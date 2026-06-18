const Review = require('../models/Review');

/**
 * POST /api/reviews
 * Body: { userId, eventId, rating, comment }
 */
const createReview = async (req, res) => {
  try {
    const { userId, eventId, rating, comment } = req.body;

    if (!userId || !eventId || !rating) {
      return res.status(400).json({ message: 'userId, eventId, and rating are required' });
    }

    const review = await Review.create({
      userId,
      eventId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('[createReview]', err);
    res.status(500).json({ message: 'Lỗi tạo đánh giá', error: err.message });
  }
};

/**
 * GET /api/reviews/event/:eventId
 * Returns reviews for a specific event
 */
const getReviewsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const reviews = await Review.find({ eventId }).populate('userId', 'fullName avatar email').sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    console.error('[getReviewsByEvent]', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách đánh giá', error: err.message });
  }
};

/**
 * GET /api/reviews
 * Returns all reviews
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().select('-__v')
      .populate('userId', 'fullName avatar email')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    console.error('[getAllReviews]', err);
    res.status(500).json({ message: 'Lỗi lấy tất cả đánh giá', error: err.message });
  }
};

/**
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    res.status(200).json({ message: 'Xóa đánh giá thành công' });
  } catch (err) {
    console.error('[deleteReview]', err);
    res.status(500).json({ message: 'Lỗi xóa đánh giá', error: err.message });
  }
};

module.exports = {
  createReview,
  getReviewsByEvent,
  deleteReview,
  getAllReviews
};
