const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentStatus,
  sePayWebhook
} = require('../controllers/paymentController');

// Create a new payment (returns QR URL + order code)
router.post('/create', createPayment);

// Poll payment status
router.get('/status/:orderCode', getPaymentStatus);

// SePay webhook (called by SePay server)
router.post('/webhook', sePayWebhook);

module.exports = router;
