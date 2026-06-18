const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api';

/**
 * Create a new payment order and receive QR URL + bank details.
 * @param {Array}  items        - [{ name, quantity, unitPrice }]
 * @param {number} totalAmount  - Total in VND
 */
export async function createPayment(items, totalAmount) {
  const res = await fetch(`${API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, totalAmount })
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
  // returns: { orderCode, qrUrl, bankInfo: { bankId, accountNo, accountName }, amount }
}

/**
 * Poll backend for payment status.
 * @param {string} orderCode
 */
export async function getPaymentStatus(orderCode) {
  const res = await fetch(`${API_URL}/payment/status/${orderCode}`);
  if (!res.ok) throw new Error('Failed to fetch payment status');
  return res.json();
  // returns: { orderCode, status, paymentStatus, amount }
}
