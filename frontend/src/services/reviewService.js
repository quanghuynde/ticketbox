const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * GET /api/reviews/event/:eventId
 * Returns all reviews for a specific event
 */
export async function getReviewsByEvent(eventId) {
  const res = await fetch(`${API_URL}/reviews/event/${eventId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
  // returns: [{ _id, userId: { fullName, avatar, email }, eventId, rating, comment, createdAt }]
}

/**
 * POST /api/reviews
 * Create a new review
 * @param {{ userId: string, eventId: string, rating: number, comment: string }} data
 */
export async function createReview(data) {
  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

/**
 * DELETE /api/reviews/:id
 */
export async function deleteReview(id) {
  const res = await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete review');
  return res.json();
}
