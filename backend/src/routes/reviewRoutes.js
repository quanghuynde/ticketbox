const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByEvent,
  deleteReview
} = require('../controllers/reviewController');

// POST /api/reviews - Create a new review
router.post('/', createReview);

// GET /api/reviews/event/:eventId - Get reviews for a specific event
router.get('/event/:eventId', getReviewsByEvent);

// DELETE /api/reviews/:id - Delete a review
router.delete('/:id', deleteReview);

module.exports = router;
