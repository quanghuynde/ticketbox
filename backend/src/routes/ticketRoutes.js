const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', ticketController.getAll);
router.get('/event/:eventId', ticketController.getByEvent);
router.get('/:ticketId', ticketController.getById);

// Admin routes
router.post('/', verifyToken, isAdmin, ticketController.create);
router.put('/:ticketId', verifyToken, isAdmin, ticketController.update);
router.delete('/:ticketId', verifyToken, isAdmin, ticketController.remove);

module.exports = router;
