const OrderDetail = require('../models/OrderDetail');
const Ticket = require('../models/Ticket');

/**
 * Deduct ticket stock for a paid order.
 *
 * Reads the order's OrderDetails and, for each ticket, atomically decrements
 * `quantity` and increments `soldQuantity`. The atomic condition
 * (`quantity >= detail.quantity`) prevents overselling when several pending
 * orders compete for the same tickets. If any ticket no longer has enough
 * stock, previously applied deductions in this call are rolled back and an
 * error is thrown.
 *
 * @param {import('mongoose').Types.ObjectId|string} orderId
 * @returns {Promise<Array<{ ticketId: string, quantity: number }>>} applied deductions
 */
async function deductStockForOrder(orderId) {
  const details = await OrderDetail.find({ orderId });
  const applied = [];

  try {
    for (const detail of details) {
      const updated = await Ticket.findOneAndUpdate(
        { _id: detail.ticketId, quantity: { $gte: detail.quantity } },
        { $inc: { quantity: -detail.quantity, soldQuantity: detail.quantity } },
        { new: true }
      );

      if (!updated) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      applied.push({ ticketId: detail.ticketId, quantity: detail.quantity });
    }

    return applied;
  } catch (err) {
    // Roll back any deductions already applied in this call
    if (applied.length > 0) {
      await Promise.all(applied.map(item => Ticket.updateOne(
        { _id: item.ticketId },
        { $inc: { quantity: item.quantity, soldQuantity: -item.quantity } }
      )));
    }
    throw err;
  }
}

/**
 * Restore ticket stock for an order that was previously paid (e.g. cancelled
 * or refunded). Increments `quantity` and decrements `soldQuantity` back.
 *
 * @param {import('mongoose').Types.ObjectId|string} orderId
 * @returns {Promise<void>}
 */
async function restoreStockForOrder(orderId) {
  const details = await OrderDetail.find({ orderId });

  await Promise.all(details.map(detail => Ticket.updateOne(
    { _id: detail.ticketId },
    { $inc: { quantity: detail.quantity, soldQuantity: -detail.quantity } }
  )));
}

module.exports = { deductStockForOrder, restoreStockForOrder };
