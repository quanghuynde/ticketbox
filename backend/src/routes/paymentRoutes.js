const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentStatus,
  payOsWebhook
} = require('../controllers/paymentController');

// Create a new payment (returns QR URL + order code)
router.post('/create', createPayment);

// Poll payment status
router.get('/status/:orderCode', getPaymentStatus);

// PayOS webhook (called by PayOS server)
router.post('/webhook', payOsWebhook);

module.exports = router;
