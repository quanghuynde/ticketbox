const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

// Admin routes
router.post('/', verifyToken, isAdmin, eventController.create);
router.put('/:id', verifyToken, isAdmin, eventController.update);
router.delete('/:id', verifyToken, isAdmin, eventController.remove);

module.exports = router;
