const User = require('../models/User');

// GET /api/users/profile - Get currently logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    // req.user is populated by the verifyToken middleware
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching current profile:', error);
    return res.status(500).json({ message: 'Server error while retrieving profile.' });
  }
};

// GET /api/users/profile/:id - Get a specific user's profile
const getUserProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUser = req.user;

    // Business rule: Customer cannot view others' profiles
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== targetUserId) {
      return res.status(403).json({ message: 'Access denied. You cannot view other users\' profiles.' });
    }

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching specific user profile:', error);
    return res.status(500).json({ message: 'Server error while retrieving profile.' });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
};
