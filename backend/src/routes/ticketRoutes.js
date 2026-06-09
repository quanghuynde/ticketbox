const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.getAll);
router.get('/:ticketId', ticketController.getById);
router.post('/', ticketController.create);
router.put('/:ticketId', ticketController.update);
router.delete('/:ticketId', ticketController.remove);

module.exports = router;
