 
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

/**
 * Get all events with optional filtering
 * @param {Object} req - Request object with query parameters (category, search, status)
 * @param {Object} res - Response object
 */
const getAll = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const query = {}; 
    if (category) query.categoryId = category;
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('categoryId', 'name')
      .sort({ eventDate: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sự kiện', error: err.message });
  }
};

/**
 * Get event details by ID including associated tickets
 * @param {Object} req - Request object with event ID in params
 * @param {Object} res - Response object
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'ID sự kiện không hợp lệ' });
    }
  
    const event = await Event.findById(id).populate('categoryId', 'name');
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    
    // Also fetch tickets for this event
    const tickets = await Ticket.find({ eventId: event._id });
    
    res.status(200).json({ ...event.toObject(), tickets });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết sự kiện', error: err.message });
  }
};

/**
 * Create a new event (Admin only)
 * @param {Object} req - Request object with event data in body
 * @param {Object} res - Response object
 */
const create = async (req, res) => {
  try {
    const { title, description, eventDate, location, image, categoryId, status } = req.body;
    
    if (!title || !eventDate || !location || !categoryId) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sự kiện' });
    }
   


    const event = await Event.create({
      title,
      description,
      eventDate,
      location,
      image,
      categoryId,
      status: status || 'upcoming',
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi tạo sự kiện', error: err.message });
  }
};

/**
 * Update an event by ID (Admin only)
 * @param {Object} req - Request object with event ID in params and update data in body
 * @param {Object} res - Response object
 */
const update = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi cập nhật sự kiện', error: err.message });
  }
};

/**
 * Delete an event by ID (Admin only)
 * Prevents deletion if event has sold tickets
 * @param {Object} req - Request object with event ID in params
 * @param {Object} res - Response object
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'ID sự kiện không hợp lệ' });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });

    // Optionally check if tickets were sold
    const tickets = await Ticket.find({ eventId: id });
    const totalSold = tickets.reduce((sum, t) => sum + (t.soldQuantity || 0), 0);
    
    if (totalSold > 0) {
      return res.status(400).json({ message: 'Không thể xóa sự kiện đã có vé được bán ra' });
    }



    // Delete associated tickets if any
    await Ticket.deleteMany({ eventId: id });
    await Event.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Xóa sự kiện thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa sự kiện', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
