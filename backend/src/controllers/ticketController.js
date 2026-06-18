const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getNonEmptyString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validateTicketPayload(payload, isUpdate = false) {
  const errors = [];
  const data = {};

  if (!payload || Object.keys(payload).length === 0) {
    return {
      errors: ['eventId', 'ticketName', 'price', 'quantity'],
      data
    };
  }

  if (payload.eventId !== undefined) {
    const eventId = getNonEmptyString(payload.eventId);
    if (!eventId) {
      errors.push('eventId');
    } else {
      data.eventId = eventId;
    }
  } else if (!isUpdate) {
    errors.push('eventId');
  }

  if (payload.ticketName !== undefined) {
    const ticketName = getNonEmptyString(payload.ticketName);
    if (!ticketName) {
      errors.push('ticketName');
    } else {
      data.ticketName = ticketName;
    }
  } else if (!isUpdate) {
    errors.push('ticketName');
  }

  if (payload.price !== undefined) {
    const price = getNumber(payload.price);
    if (price === null || price < 0) {
      errors.push('price');
    } else {
      data.price = price;
    }
  } else if (!isUpdate) {
    errors.push('price');
  }

  if (payload.quantity !== undefined) {
    const quantity = getNumber(payload.quantity);
    if (quantity === null || quantity < 0 || !Number.isInteger(quantity)) {
      errors.push('quantity');
    } else {
      data.quantity = quantity;
    }
  } else if (!isUpdate) {
    errors.push('quantity');
  }

  if (payload.soldQuantity !== undefined) {
    const soldQuantity = getNumber(payload.soldQuantity);
    if (soldQuantity === null || soldQuantity < 0 || !Number.isInteger(soldQuantity)) {
      errors.push('soldQuantity');
    } else {
      data.soldQuantity = soldQuantity;
    }
  }

  return { errors, data };
}

async function findDuplicateTicket(data, ticketId = null) {
  if (!data.eventId || !data.ticketName) {
    return null;
  }

  const query = {
    eventId: data.eventId,
    ticketName: new RegExp(`^${escapeRegExp(data.ticketName)}$`, 'i')
  };

  if (ticketId) {
    query._id = { $ne: ticketId };
  }

  return Ticket.findOne(query);
}

const getAll = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('eventId', 'title eventDate location').sort({ ticketName: 1 });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách vé', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId).populate('eventId', 'title eventDate location');
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết vé', error: err.message });
  }
};

const getByEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ message: 'Mã sự kiện không hợp lệ' });
    }

    const tickets = await Ticket.find({ eventId: req.params.eventId }).sort({ ticketName: 1 });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách vé', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { errors, data } = validateTicketPayload(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ thông tin vé',
        fields: errors
      });
    }

    const duplicate = await findDuplicateTicket(data);
    if (duplicate) {
      return res.status(400).json({ message: 'Tên vé đã tồn tại cho sự kiện này' });
    }

    const ticket = await Ticket.create(data);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo vé, vui lòng thử lại', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { errors, data } = validateTicketPayload(req.body, true);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập thông tin cần cập nhật' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Dữ liệu vé không hợp lệ',
        fields: errors
      });
    }

    const duplicate = await findDuplicateTicket(data, req.params.ticketId);
    if (duplicate) {
      return res.status(400).json({ message: 'Tên vé đã tồn tại cho sự kiện này' });
    }

    const ticket = await Ticket.findByIdAndUpdate(req.params.ticketId, data, { new: true, runValidators: true }).populate('eventId', 'title eventDate location');
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Đang có lỗi khi đặt vé, vui lòng thử lại', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json({ message: 'Xóa vé thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa vé, vui lòng thử lại', error: err.message });
  }
};

module.exports = { getAll, getById, getByEvent, create, update, remove };
