const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/', getNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
