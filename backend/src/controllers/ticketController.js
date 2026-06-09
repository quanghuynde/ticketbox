const Ticket = require('../../models/Ticket');

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
    const ticket = await Ticket.findById(req.params.id).populate('eventId', 'title eventDate location');
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết vé', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const ticket = await Ticket.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo vé', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('eventId', 'title eventDate location');
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật vé', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé' });
    res.status(200).json({ message: 'Xóa vé thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa vé', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
