const Order = require('../models/Order');
const Payment = require('../models/Payment');

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a unique order code:  TB + timestamp (base36) + 4 random chars
 */
function generateOrderCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TB${ts}${rand}`;
}

/**
 * Build a VietQR image URL using the public vietqr.io API (no auth required).
 * Template: https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={amount}&addInfo={addInfo}&accountName={accountName}
 */
function buildQrUrl(orderCode, amount) {
  const bankId      = process.env.BANK_ID;
  const accountNo   = process.env.BANK_ACCOUNT_NO;
  const accountName = encodeURIComponent(process.env.BANK_ACCOUNT_NAME || '');
  const addInfo     = encodeURIComponent(orderCode);

  return (
    `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png` +
    `?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`
  );
}

// ── controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/payment/create
 * Body: { items: [{ name, quantity, unitPrice }], totalAmount: Number }
 * Creates an Order + Payment and returns the VietQR URL.
 */
const createPayment = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'totalAmount is required and must be > 0' });
    }

    const orderCode = generateOrderCode();

    // Create order (userId left optional for now – will be set from auth middleware later)
    const order = await Order.create({
      orderCode,
      userId: req.body.userId || '000000000000000000000000', // placeholder
      totalPrice: totalAmount,
      status: 'pending'
    });

    // Create payment record
    await Payment.create({
      orderId: order._id,
      orderCode,
      method: 'sepay',
      amount: totalAmount,
      status: 'pending'
    });

    const qrUrl = buildQrUrl(orderCode, totalAmount);

    res.json({
      orderCode,
      qrUrl,
      bankInfo: {
        bankId:      process.env.BANK_ID,
        accountNo:   process.env.BANK_ACCOUNT_NO,
        accountName: process.env.BANK_ACCOUNT_NAME
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
 * Called by SePay when a matching bank transfer is detected.
 * Header: Authorization: Apikey <SEPAY_SECRET_KEY>
 * Body (SePay format): { content, transferAmount, ... }
 */
const sePayWebhook = async (req, res) => {
  try {
    // Validate secret key
    const authHeader = req.headers['authorization'] || '';
    const expectedKey = `Apikey ${process.env.SEPAY_SECRET_KEY}`;
    if (authHeader !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content, transferAmount } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Missing content field' });
    }

    // SePay puts the bank transfer description in `content`.
    // We search for any orderCode (TB…) embedded in the description.
    const match = content.match(/TB[A-Z0-9]+/);
    if (!match) {
      // Transfer does not match any order code pattern – ignore
      return res.json({ success: false, message: 'No order code found in content' });
    }

    const orderCode = match[0];

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'paid') {
      // Already confirmed – idempotent response
      return res.json({ success: true, message: 'Already paid' });
    }

    // Update order
    order.status = 'paid';
    await order.save();

    // Update payment
    await Payment.findOneAndUpdate(
      { orderCode },
      { status: 'success', transactionId: content, paidAt: new Date() }
    );

    console.log(`[sePayWebhook] Order ${orderCode} marked as PAID (amount: ${transferAmount})`);
    res.json({ success: true });
  } catch (err) {
    console.error('[sePayWebhook]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createPayment, getPaymentStatus, sePayWebhook };
