const Order = require('../models/Order');
const Payment = require('../models/Payment');
const PayOS = require('@payos/node');
const Notification = require('../models/Notification');

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
 * Body: { items: [{ name, quantity, unitPrice }], totalAmount: Number }
 * Creates an Order + Payment and returns the PayOS CheckLink details.
 */
const createPayment = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'totalAmount is required and must be > 0' });
    }

    const orderCode = generateOrderCode();

    // Create order
    const order = await Order.create({
      orderCode: String(orderCode),
      userId: req.body.userId || '000000000000000000000000', // placeholder
      totalPrice: totalAmount,
      status: 'pending'
    });

    // Create payment record
    await Payment.create({
      orderId: order._id,
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
