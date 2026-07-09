const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Payment = require('../models/Payment');
const PayOS = require('@payos/node');
const Notification = require('../models/Notification');
const Ticket = require('../models/Ticket');
const { deductStockForOrder } = require('../services/stockService');

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

/**
 * Mark an order as paid: update order + payment status, deduct ticket stock,
 * and notify the user. Idempotent — a no-op if the order is already paid.
 *
 * Stock is deducted here (on payment success) and nowhere else, so tickets are
 * never reserved for unpaid pending orders and are never deducted twice.
 *
 * @param {import('mongoose').Document} order  the Order document
 * @param {string} [reference]                 PayOS transaction reference
 */
async function markOrderAsPaid(order, reference) {
  if (!order) return;

  const orderCode = order.orderCode;

  // Atomically claim the pending -> paid transition. Only the caller that
  // actually flips the status proceeds to deduct stock, so stock is never
  // deducted twice even if the webhook and status polling fire at once.
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, status: { $ne: 'paid' } },
    { status: 'paid' },
    { new: true }
  );

  if (!claimed) return; // already marked paid by another concurrent call

  order.status = 'paid';

  // Deduct ticket stock now that payment succeeded. No-op for orders that have
  // no OrderDetail records (e.g. legacy payment-only flow).
  try {
    await deductStockForOrder(order._id);
  } catch (stockErr) {
    console.error(`[markOrderAsPaid] Stock deduction failed for order ${orderCode}:`, stockErr.message);
  }

  // Update payment record
  await Payment.findOneAndUpdate(
    { orderCode: String(orderCode) },
    { status: 'success', transactionId: reference, paidAt: new Date() }
  );

  // Create notification for user
  try {
    await Notification.create({
      userId: order.userId,
      type: 'payment',
      title: 'Thanh toán thành công',
      message: `Đơn hàng #${orderCode} của bạn đã được thanh toán thành công.`
    });
  } catch (notifErr) {
    console.error('[markOrderAsPaid] Failed to create notification:', notifErr);
  }

  console.log(`[markOrderAsPaid] Order ${orderCode} marked as PAID`);
}

// ── controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/payment/create
 * Body: { items: [{ ticketId, name, quantity, unitPrice }], totalAmount: Number, userId: String }
 * Creates an Order (+ OrderDetails) and returns the PayOS CheckLink details.
 */
const createPayment = async (req, res) => {
  let createdOrder = null;

  try {
    const { totalAmount, userId, items } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'totalAmount is required and must be > 0' });
    }

    const orderCode = generateOrderCode();

    // Create order (belongs to the logged-in user when provided)
    createdOrder = await Order.create({
      orderCode: String(orderCode),
      userId: userId || '000000000000000000000000', // fallback to placeholder for guest
      totalPrice: totalAmount,
      status: 'pending'
    });

    // Persist order details when the frontend sends ticket info, so the order
    // shows up under "My tickets" and stock can be deducted on payment success.
    // Stock is NOT reserved here — it is deducted only when payment succeeds
    // (see markOrderAsPaid), so unpaid pending orders never hold inventory.
    if (Array.isArray(items) && items.length > 0) {
      const ticketIds = items.map(item => item.ticketId).filter(Boolean);
      const tickets = await Ticket.find({ _id: { $in: ticketIds } });
      const ticketMap = new Map(tickets.map(t => [t._id.toString(), t]));

      const details = items
        .filter(item => item && item.ticketId)
        .map(item => {
          const ticket = ticketMap.get(String(item.ticketId));
          return {
            orderId: createdOrder._id,
            ticketId: item.ticketId,
            quantity: item.quantity || 1,
            unitPrice: ticket ? ticket.price : (item.unitPrice || 0)
          };
        });

      if (details.length > 0) {
        await OrderDetail.insertMany(details);
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
    // Roll back the order/details if anything failed after creating them.
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
 *
 * Because PayOS webhooks cannot reach a localhost server, this endpoint also
 * actively queries PayOS for the real payment link status and syncs the order
 * accordingly. This lets the frontend polling detect a successful transfer even
 * without a public webhook URL.
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    let order = await Order.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If still pending, ask PayOS for the authoritative status and sync.
    if (order.status === 'pending') {
      try {
        const info = await payos.getPaymentLinkInformation(Number(orderCode));
        const payosStatus = info?.status; // 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED'

        if (payosStatus === 'PAID') {
          const reference = info?.transactions?.[0]?.reference;
          await markOrderAsPaid(order, reference);
          order = await Order.findOne({ orderCode });
        } else if (payosStatus === 'CANCELLED' || payosStatus === 'EXPIRED') {
          order.status = 'cancelled';
          await order.save();
          await Payment.findOneAndUpdate({ orderCode: String(orderCode) }, { status: 'failed' });
        }
      } catch (syncErr) {
        // Don't fail the request if PayOS lookup hiccups — just return DB state.
        console.error('[getPaymentStatus] PayOS sync failed:', syncErr.message);
      }
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

    await markOrderAsPaid(order, verifiedData.reference);

    console.log(`[payOsWebhook] Order ${orderCode} marked as PAID (amount: ${amount})`);
    res.json({ success: true });
  } catch (err) {
    console.error('[payOsWebhook]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPayment, getPaymentStatus, payOsWebhook };
