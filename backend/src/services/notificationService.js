const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * @param {string} userId
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {boolean} [isRead=false]
 * @returns {Promise<import('mongoose').Document>}
 */
const createNotification = async (userId, type, title, message, isRead = false) => {
  return Notification.create({
    userId,
    type,
    title,
    message,
    isRead,
  });
};

module.exports = {
  createNotification,
};
