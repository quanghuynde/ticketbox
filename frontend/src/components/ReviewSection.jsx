import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Send, MessageSquare, Loader2 } from 'lucide-react';
import { getReviewsByEvent, createReview, deleteReview } from '../services/reviewService';

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? 'fill-[#2dc275] text-[#2dc275]'
                : 'text-[#555]'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Star Display (read-only) ──────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-[#2dc275] text-[#2dc275]' : 'text-[#444]'}`}
        />
      ))}
    </div>
  );
}

// ── Rating Summary Bar ────────────────────────────────────────────────────────
function RatingSummary({ reviews }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="flex gap-8 items-center bg-[#27272a]/50 rounded-2xl p-6 border border-white/5">
      {/* Average */}
      <div className="text-center shrink-0">
        <div className="text-5xl font-bold text-[#2dc275]">{avg.toFixed(1)}</div>
        <StarDisplay rating={Math.round(avg)} size="sm" />
        <div className="text-xs text-[#999] mt-1">{reviews.length} đánh giá</div>
      </div>
      {/* Distribution */}
      <div className="flex-1 space-y-1.5">
        {dist.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="text-[#999] w-3">{star}</span>
            <Star className="w-3 h-3 fill-[#2dc275] text-[#2dc275]" />
            <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2dc275] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[#666] w-4 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onDelete, currentUserId }) {
  const user = review.userId;
  const name = user?.fullName || user?.email || 'Người dùng ẩn danh';
  const avatar = user?.avatar;
  const isOwner = currentUserId && user?._id === currentUserId;
  const date = new Date(review.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="bg-[#27272a]/40 rounded-2xl p-5 border border-white/5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#2dc275]/20 border border-[#2dc275]/30 flex items-center justify-center overflow-hidden shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#2dc275] font-bold text-sm">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">{name}</div>
            <StarDisplay rating={review.rating} size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#666] text-xs">{date}</span>
          {isOwner && (
            <button
              onClick={() => onDelete(review._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-[#666] hover:text-red-400"
              title="Xóa đánh giá"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-[#aaaaaa] text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Main ReviewSection ────────────────────────────────────────────────────────
const ReviewSection = ({ eventId, currentUserId = null }) => {
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // ── Fetch reviews ───────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getReviewsByEvent(eventId);
      setReviews(data);
    } catch {
      setError('Không thể tải đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // ── Submit review ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (rating === 0) { setFormError('Vui lòng chọn số sao.'); return; }

    // Use currentUserId or a placeholder for demo
    const userId = currentUserId || '000000000000000000000000';

    setSubmitting(true);
    try {
      const newReview = await createReview({ userId, eventId, rating, comment });
      // Optimistically add to list (with placeholder user info)
      setReviews((prev) => [{ ...newReview, userId: { fullName: 'Bạn', _id: userId } }, ...prev]);
      setRating(0);
      setComment('');
    } catch {
      setFormError('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete review ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Không thể xóa đánh giá.');
    }
  };

  return (
    <div className="bg-[#27272a]/30 rounded-3xl p-8 border border-white/5 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/10 border border-[#2dc275]/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[#2dc275]" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Đánh giá sự kiện</h3>
          <p className="text-[#999] text-xs">
            {reviews.length > 0 ? `${reviews.length} đánh giá` : 'Chưa có đánh giá nào'}
          </p>
        </div>
      </div>

      {/* Rating Summary */}
      <RatingSummary reviews={reviews} />

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-black/20 rounded-2xl p-5 border border-white/5">
        <h4 className="font-semibold text-sm text-[#ccc]">Gửi đánh giá của bạn</h4>

        <div className="space-y-1">
          <label className="text-xs text-[#999]">Chọn số sao *</label>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[#999]">Nhận xét (tuỳ chọn)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Trải nghiệm của bạn với sự kiện này..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#555] resize-none focus:outline-none focus:border-[#2dc275]/50 transition-colors"
          />
        </div>

        {formError && (
          <p className="text-red-400 text-xs">{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2dc275] text-black font-bold text-sm hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(45,194,117,0.25)]"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
          ) : (
            <><Send className="w-4 h-4" /> Gửi đánh giá</>
          )}
        </button>
      </form>

      {/* Review List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-[#999]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Đang tải đánh giá...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400 text-sm">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <MessageSquare className="w-10 h-10 text-[#444] mx-auto" />
          <p className="text-[#666] text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
