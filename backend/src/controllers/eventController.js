 
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

/**
 * Get all events with optional filtering
 * @param {Object} req - Request object with query parameters (category, search, status)
 * @param {Object} res - Response object
 */
const getAll = async (req, res) => {
  try {
    // Extract and validate query parameters
    const { category, search, status } = req.query;
    console.log('Fetching events with filters:', { category, search, status });
    
    // Build dynamic MongoDB query object
    const query = {}; 
    if (category) query.categoryId = category;
    if (status) query.status = status;
    if (search) {
      // Case-insensitive regex search on title
      query.title = { $regex: search, $options: 'i' };
    }

    // Query database and populate category details
    const events = await Event.find(query)
      .populate('categoryId', 'name')
      .sort({ eventDate: 1 });
    
    console.log(`Found ${events.length} events matching criteria`);
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
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
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn('Invalid event ID format:', id);
      return res.status(404).json({ message: 'ID sự kiện không hợp lệ' });
    }
    
    console.log('Fetching event details for ID:', id);
    
    // Find event and populate category information
    const event = await Event.findById(id).populate('categoryId', 'name');
    if (!event) {
      console.warn('Event not found for ID:', id);
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    // Fetch all tickets associated with this event
    const tickets = await Ticket.find({ eventId: event._id });
    console.log(`Event ${id} has ${tickets.length} tickets`);
    
    res.status(200).json({ ...event.toObject(), tickets });
  } catch (err) {
    console.error('Error fetching event details:', err.message);
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
    
    // Validate required fields
    if (!title || !eventDate || !location || !categoryId) {
      console.warn('Missing required fields for event creation');
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin sự kiện' });
    }
    
    console.log('Creating new event:', title);
    
    // Create event with default status if not provided
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

    console.log('Event created successfully with ID:', event._id);
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err.message);
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
    console.log('Updating event ID:', req.params.id);
    
    // Find event by ID and update with new data, run validators
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      console.warn('Event not found for update, ID:', req.params.id);
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    console.log('Event updated successfully');
    res.status(200).json(event);
  } catch (err) {
    console.error('Error updating event:', err.message);
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
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn('Invalid event ID for deletion:', id);
      return res.status(404).json({ message: 'ID sự kiện không hợp lệ' });
    }

    console.log('Attempting to delete event ID:', id);

    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      console.warn('Event not found for deletion, ID:', id);
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    // Check if tickets were sold for this event
    const tickets = await Ticket.find({ eventId: id });
    const totalSold = tickets.reduce((sum, t) => sum + (t.soldQuantity || 0), 0);
    
    if (totalSold > 0) {
      console.warn(`Cannot delete event ${id}: ${totalSold} tickets already sold`);
      return res.status(400).json({ message: 'Không thể xóa sự kiện đã có vé được bán ra' });
    }

    // Delete associated tickets and event
    console.log(`Deleting ${tickets.length} associated tickets`);
    await Ticket.deleteMany({ eventId: id });
    await Event.findByIdAndDelete(id);
    
    console.log('Event deleted successfully:', id);
    res.status(200).json({ message: 'Xóa sự kiện thành công' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ message: 'Lỗi xóa sự kiện', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
