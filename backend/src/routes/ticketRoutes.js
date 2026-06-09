const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.getAll);
router.get('/:id', ticketController.getById);
router.post('/', ticketController.create);
router.put('/:id', ticketController.update);
router.delete('/:id', ticketController.remove);

module.exports = router;
