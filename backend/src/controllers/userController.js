const bcrypt = require('bcryptjs');
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

// PUT /api/users/profile - Update currently logged-in user's profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email, avatar } = req.body;

    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (avatar) updates.avatar = avatar.trim();

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== req.user.email) {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && existingUser._id.toString() !== userId.toString()) {
          return res.status(400).json({ message: 'Email này đã được sử dụng bởi tài khoản khác.' });
        }
      }
      updates.email = normalizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      context: 'query',
      select: '-password'
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// PUT /api/users/profile/password - Change the currently logged-in user's password
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Server error while changing password.' });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
  updateProfile,
  changePassword,
};
