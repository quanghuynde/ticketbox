const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderDetail = require('../models/OrderDetail');
const Ticket = require('../models/Ticket');

function generateOrderCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${ts}${rand}`;
}

async function createUniqueOrderCode() {
  for (let i = 0; i < 5; i += 1) {
    const orderCode = generateOrderCode();
    const exists = await Order.exists({ orderCode });
    if (!exists) return orderCode;
  }

  throw new Error('Cannot generate unique order code');
}

function getNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'string' && value.trim() === '') return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toObjectId(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return mongoose.Types.ObjectId.isValid(value.trim()) ? value.trim() : null;
}

function validateOrderPayload(payload) {
  const errors = [];
  const data = {
    items: []
  };

  if (!payload || Object.keys(payload).length === 0) {
    return {
      errors: ['userId', 'items'],
      data
    };
  }

  const userId = toObjectId(payload.userId);
  if (!userId) {
    errors.push('userId');
  } else {
    data.userId = userId;
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('items');
    return { errors, data };
  }

  const ticketIds = new Set();

  payload.items.forEach((item, index) => {
    const ticketId = toObjectId(item.ticketId);
    const quantity = getNumber(item.quantity);

    if (!ticketId) {
      errors.push(`items[${index}].ticketId`);
    } else if (ticketIds.has(ticketId)) {
      errors.push(`items[${index}].ticketId`);
    } else {
      ticketIds.add(ticketId);
      data.items.push({ ticketId, quantity });
    }

    if (quantity === null || quantity <= 0 || !Number.isInteger(quantity)) {
      errors.push(`items[${index}].quantity`);
    } else {
      const found = data.items.find(entry => entry.ticketId === ticketId);
      if (found) found.quantity = quantity;
    }
  });

  return { errors, data };
}

function isLegacyOrderPayload(payload) {
  return payload && payload.orderCode && payload.userId && payload.totalPrice !== undefined;
}

function validateLegacyOrderPayload(payload) {
  const errors = [];
  const data = {};
  const allowedStatuses = ['pending', 'paid', 'cancelled', 'refunded'];

  if (typeof payload.orderCode !== 'string' || payload.orderCode.trim() === '') {
    errors.push('orderCode');
  } else {
    data.orderCode = payload.orderCode.trim();
  }

  const userId = toObjectId(payload.userId);
  if (!userId) {
    errors.push('userId');
  } else {
    data.userId = userId;
  }

  const totalPrice = getNumber(payload.totalPrice);
  if (totalPrice === null || totalPrice < 0) {
    errors.push('totalPrice');
  } else {
    data.totalPrice = totalPrice;
  }

  if (payload.status !== undefined) {
    if (!allowedStatuses.includes(payload.status)) {
      errors.push('status');
    } else {
      data.status = payload.status;
    }
  }

  return { errors, data };
}

async function createLegacyOrder(req, res) {
  try {
    const { errors, data } = validateLegacyOrderPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Dữ liệu đơn hàng cũ không hợp lệ',
        fields: errors
      });
    }

    const order = await Order.create(data);
    res.status(201).json(order);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại', error: err.message });
    }

    res.status(400).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
  }
}

function toObject(value) {
  return value && typeof value.toObject === 'function' ? value.toObject() : value;
}

function getTicketIdValue(ticketId) {
  if (!ticketId) return null;

  const ticketObject = toObject(ticketId);
  return ticketObject._id || ticketId;
}

function formatOrderResponse(order) {
  const orderObject = toObject(order);
  const orderDetails = Array.isArray(orderObject.orderDetails) ? orderObject.orderDetails : [];

  return {
    _id: orderObject._id,
    orderCode: orderObject.orderCode,
    userId: orderObject.userId,
    totalPrice: orderObject.totalPrice,
    status: orderObject.status,
    createdAt: orderObject.createdAt,
    id: orderObject._id,
    orderDetails: orderDetails.map(detail => {
      const detailObject = toObject(detail);
      return {
        _id: detailObject._id,
        orderId: detailObject.orderId,
        ticketId: getTicketIdValue(detailObject.ticketId),
        quantity: detailObject.quantity,
        unitPrice: detailObject.unitPrice,
        lineTotal: detailObject.unitPrice * detailObject.quantity
      };
    })
  };
}

async function getPopulatedOrder(orderId) {
  const order = await Order.findById(orderId)
    .populate({
      path: 'orderDetails'
    })
    .populate('userId', 'fullName email');

  return order ? formatOrderResponse(order) : null;
}

const getAll = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'orderDetails'
      })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders.map(formatOrderResponse));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    const order = await getPopulatedOrder(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error: err.message });
  }
};

const create = async (req, res) => {
  if (isLegacyOrderPayload(req.body)) {
    return createLegacyOrder(req, res);
  }

  let order = null;
  const reservedTickets = [];

  try {
    const { errors, data } = validateOrderPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Dữ liệu đơn hàng không hợp lệ',
        fields: errors
      });
    }

    const tickets = await Ticket.find({ _id: { $in: data.items.map(item => item.ticketId) } });
    const ticketMap = new Map(tickets.map(ticket => [ticket._id.toString(), ticket]));
    const missingTicketIds = data.items
      .filter(item => !ticketMap.has(item.ticketId))
      .map(item => item.ticketId);

    if (missingTicketIds.length > 0) {
      return res.status(404).json({
        message: 'Một hoặc nhiều vé không tồn tại',
        missingTicketIds
      });
    }

    const eventIds = new Set(tickets.map(ticket => ticket.eventId.toString()));
    if (eventIds.size > 1) {
      return res.status(400).json({ message: 'Đơn hàng chỉ được chứa vé của cùng một sự kiện' });
    }

    const stockErrors = [];
    data.items.forEach(item => {
      const ticket = ticketMap.get(item.ticketId);
      const available = ticket.quantity;

      if (available <= 0) {
        stockErrors.push({ ticketId: item.ticketId, ticketName: ticket.ticketName, available: 0 });
      } else if (item.quantity > available) {
        stockErrors.push({
          ticketId: item.ticketId,
          ticketName: ticket.ticketName,
          available,
          requested: item.quantity
        });
      }
    });

    if (stockErrors.length > 0) {
      return res.status(400).json({
        message: 'Số lượng vé không đủ',
        stockErrors
      });
    }

    const orderCode = await createUniqueOrderCode();
    const totalPrice = data.items.reduce((sum, item) => {
      const ticket = ticketMap.get(item.ticketId);
      return sum + ticket.price * item.quantity;
    }, 0);

    order = await Order.create({
      orderCode,
      userId: data.userId,
      totalPrice,
      status: req.body.status || 'pending'
    });

    const details = data.items.map(item => {
      const ticket = ticketMap.get(item.ticketId);
      return {
        orderId: order._id,
        ticketId: item.ticketId,
        quantity: item.quantity,
        unitPrice: ticket.price
      };
    });

    await OrderDetail.insertMany(details);

    for (const item of data.items) {
      const ticket = ticketMap.get(item.ticketId);
      const updated = await Ticket.findOneAndUpdate(
        {
          _id: item.ticketId,
          quantity: { $gte: item.quantity }
        },
        { $inc: { quantity: -item.quantity, soldQuantity: item.quantity } },
        { new: true }
      );

      if (!updated) {
        throw new Error('Stock changed');
      }

      reservedTickets.push({
        ticketId: item.ticketId,
        quantity: item.quantity
      });
    }

    const populatedOrder = await getPopulatedOrder(order._id);
    res.status(201).json(populatedOrder);
  } catch (err) {
    if (reservedTickets.length > 0) {
      await Promise.all(reservedTickets.map(item => Ticket.updateOne(
        { _id: item.ticketId },
        { $inc: { quantity: item.quantity, soldQuantity: -item.quantity } }
      )));
    }

    if (order) {
      await OrderDetail.deleteMany({ orderId: order._id });
      await Order.findByIdAndDelete(order._id);
    }

    if (err.message === 'Stock changed') {
      return res.status(400).json({ message: 'Số lượng vé đã thay đổi, vui lòng thử lại' });
    }

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mã đơn hàng đã tồn tại', error: err.message });
    }

    res.status(400).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    const data = {};
    if (req.body.status) {
      data.status = req.body.status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập thông tin cần cập nhật' });
    }

    const order = await Order.findByIdAndUpdate(req.params.orderId, data, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật đơn hàng', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ' });
    }

    const order = await Order.findById(req.params.orderId).populate('orderDetails');
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.status === 'paid') {
      return res.status(400).json({ message: 'Không thể xóa đơn hàng đã thanh toán' });
    }

    await Promise.all(order.orderDetails.map(detail => Ticket.updateOne(
      { _id: detail.ticketId },
      { $inc: { quantity: detail.quantity, soldQuantity: -detail.quantity } }
    )));

    await OrderDetail.deleteMany({ orderId: order._id });
    await Order.findByIdAndDelete(order._id);

    res.status(200).json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa đơn hàng', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
