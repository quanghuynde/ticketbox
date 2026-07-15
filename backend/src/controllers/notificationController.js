const Notification = require('../models/Notification');

// GET /api/notifications - List notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};

// PATCH /api/notifications/:id/read - Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error while updating notification.' });
  }
};

// DELETE /api/notifications/:id - Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error while deleting notification.' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
