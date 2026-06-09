const User = require('../models/User');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Category = require('../models/Category');

// GET /api/admin/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Users & Active Users count
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // 2. Total Revenue (sum of orders with status 'paid')
    const revenueResult = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult[0] ? revenueResult[0].total : 0;

    // 3. Total Tickets Sold (sum of soldQuantity from Ticket collection)
    const ticketsResult = await Ticket.aggregate([
      { $group: { _id: null, total: { $sum: '$soldQuantity' } } },
    ]);
    const totalTicketsSold = ticketsResult[0] ? ticketsResult[0].total : 0;

    // 4. Events count and status breakdown
    const totalEvents = await Event.countDocuments();
    const eventStatusBreakdown = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const eventStats = {
      total: totalEvents,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
    };
    eventStatusBreakdown.forEach((item) => {
      if (item._id in eventStats) {
        eventStats[item._id] = item.count;
      }
    });

    // 5. Monthly Revenue Trend (for dashboard chart representation)
    const monthlyRevenueTrend = await Order.aggregate([
      { $match: { status: 'paid', createdAt: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: { $toDate: '$createdAt' } },
            month: { $month: { $toDate: '$createdAt' } },
          },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 6. Category event distribution
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          count: 1,
        },
      },
    ]);

    // 7. Top 5 Best Selling Events
    const topEvents = await Ticket.aggregate([
      {
        $group: {
          _id: '$eventId',
          ticketsSold: { $sum: '$soldQuantity' },
          revenue: { $sum: { $multiply: ['$price', '$soldQuantity'] } },
        },
      },
      { $sort: { ticketsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 1,
          title: '$event.title',
          image: '$event.image',
          eventDate: '$event.eventDate',
          status: '$event.status',
          ticketsSold: 1,
          revenue: 1,
        },
      },
    ]);

    // 8. Recent 5 Orders
    const recentOrders = await Order.find()
      .populate('userId', 'fullName email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      summary: {
        totalUsers,
        activeUsers,
        totalRevenue,
        totalTicketsSold,
      },
      events: eventStats,
      monthlyRevenueTrend,
      categoryStats,
      topEvents,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while calculating statistics.' });
  }
};

// GET /api/admin/users (with search, role filters, and pagination)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while retrieving users.' });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error while retrieving user.' });
  }
};

// PUT /api/admin/users/:id (update user roles or status)
const updateUser = async (req, res) => {
  try {
    const { fullName, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Protect updating own role/status to prevent locking oneself out
    if (req.user._id.toString() === req.params.id) {
      if (role && role !== user.role) {
        return res.status(400).json({ message: 'You cannot change your own admin role.' });
      }
      if (isActive !== undefined && isActive === false) {
        return res.status(400).json({ message: 'You cannot deactivate your own admin account.' });
      }
    }

    if (fullName) user.fullName = fullName;
    if (email) {
      // Check if email is already taken by another user
      const duplicateUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (duplicateUser) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.status(200).json({
      message: 'User updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user.' });
  }
};

// DELETE /api/admin/users/:id (soft-delete toggled as active status to false)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot deactivate/delete your own admin account.' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: 'User deactivated successfully (soft-deleted).',
      userId: user._id,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deactivating user.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
