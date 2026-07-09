const Order = require('../models/Order');
const Payment = require('../models/Payment');
const PayOS = require('@payos/node');
const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const OrderDetail = require('../models/OrderDetail');

// Initialize PayOS instance
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a unique numeric index order code for PayOS (integer format)
 */
function generateOrderCode() {
  return parseInt(Date.now().toString().slice(-8) + Math.floor(10 + Math.random() * 90));
}

// ── controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/payment/create
 * Body: { items: [{ ticketId, name, quantity, unitPrice }], totalAmount: Number, userId: String }
 * Creates an Order + Payment and returns the PayOS CheckLink details.
 */
const createPayment = async (req, res) => {
  let createdOrder = null;
  const reservedTickets = [];

  try {
    const { totalAmount, userId, items } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'totalAmount is required and must be > 0' });
    }

    const orderCode = generateOrderCode();

    // Create order
    createdOrder = await Order.create({
      orderCode: String(orderCode),
      userId: userId || '000000000000000000000000', // fallback to placeholder
      totalPrice: totalAmount,
      status: 'pending'
    });

    // Process tickets and details if provided
    if (Array.isArray(items) && items.length > 0) {
      const ticketIds = items.map(item => item.ticketId).filter(Boolean);
      const tickets = await Ticket.find({ _id: { $in: ticketIds } });
      const ticketMap = new Map(tickets.map(t => [t._id.toString(), t]));

      const details = items.map(item => {
        const ticket = ticketMap.get(item.ticketId);
        return {
          orderId: createdOrder._id,
          ticketId: item.ticketId,
          quantity: item.quantity,
          unitPrice: ticket ? ticket.price : item.unitPrice
        };
      });

      if (details.length > 0) {
        await OrderDetail.insertMany(details);
      }

      // Deduct stock and record reservation
      for (const item of items) {
        if (item.ticketId) {
          const updated = await Ticket.findOneAndUpdate(
            { _id: item.ticketId, quantity: { $gte: item.quantity } },
            { $inc: { quantity: -item.quantity, soldQuantity: item.quantity } },
            { new: true }
          );

          if (updated) {
            reservedTickets.push({
              ticketId: item.ticketId,
              quantity: item.quantity
            });
          }
        }
      }
    }

    // Create payment record
    await Payment.create({
      orderId: createdOrder._id,
      orderCode: String(orderCode),
      method: 'payos',
      amount: totalAmount,
      status: 'pending'
    });

    // Create payment link on PayOS
    const paymentLinkData = {
      orderCode: orderCode, // integer
      amount: totalAmount,
      description: `Thanh toan ve ${orderCode}`.slice(0, 25),
      cancelUrl: process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/checkout',
      returnUrl: process.env.PAYOS_RETURN_URL || 'http://localhost:5173/checkout',
      items: [
        {
          name: 'Ve xem ca nhac',
          quantity: 1,
          price: totalAmount
        }
      ]
    };

    const paymentLink = await payos.createPaymentLink(paymentLinkData);

    res.json({
      orderCode: String(orderCode),
      checkoutUrl: paymentLink.checkoutUrl,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentLink.qrCode)}`,
      bankInfo: {
        bankId: paymentLink.bin || 'MB',
        accountNo: paymentLink.accountNumber || '0365586658',
        accountName: paymentLink.accountName || 'NGUYEN QUANG HUY'
      },
      amount: totalAmount
    });
  } catch (err) {
    if (reservedTickets.length > 0) {
      await Promise.all(reservedTickets.map(item => Ticket.updateOne(
        { _id: item.ticketId },
        { $inc: { quantity: item.quantity, soldQuantity: -item.quantity } }
      )));
    }

    if (createdOrder) {
      await OrderDetail.deleteMany({ orderId: createdOrder._id });
      await Order.findByIdAndDelete(createdOrder._id);
    }

    console.error('[createPayment]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/payment/status/:orderCode
 * Returns the current payment/order status.
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const payment = await Payment.findOne({ orderCode });

    res.json({
      orderCode,
      status: order.status,         // 'pending' | 'paid' | 'cancelled' | 'refunded'
      paymentStatus: payment?.status, // 'pending' | 'success' | 'failed'
      amount: order.totalPrice
    });
  } catch (err) {
    console.error('[getPaymentStatus]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/payment/webhook
 * Called by PayOS when payment is processed.
 */
const payOsWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    if (!webhookData || !webhookData.data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    let verifiedData;
    try {
      verifiedData = payos.verifyPaymentWebhookData(webhookData);
    } catch (verifyErr) {
      console.error('[payOsWebhook] Signature verification failed:', verifyErr);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { orderCode, amount } = verifiedData;

    const order = await Order.findOne({ orderCode: String(orderCode) });
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({ success: true, message: 'Already paid' });
    }

    // Update order status
    order.status = 'paid';
    await order.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderCode: String(orderCode) },
      { status: 'success', transactionId: verifiedData.reference, paidAt: new Date() }
    );

    // Create notification for user
    try {
      await Notification.create({
        userId: order.userId,
        type: 'payment',
        title: 'Thanh toán thành công',
        message: `Đơn hàng #${orderCode} của bạn đã được thanh toán thành công.`
      });
      console.log(`[payOsWebhook] Notification created for user ${order.userId}`);
    } catch (notifErr) {
      console.error('[payOsWebhook] Failed to create notification:', notifErr);
    }

    console.log(`[payOsWebhook] Order ${orderCode} marked as PAID (amount: ${amount})`);
    res.json({ success: true });
  } catch (err) {
    console.error('[payOsWebhook]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPayment, getPaymentStatus, payOsWebhook };
