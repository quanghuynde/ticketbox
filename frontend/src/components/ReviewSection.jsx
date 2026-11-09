import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Send, MessageSquare, Loader2, LogIn, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReviewsByEvent, createReview, deleteReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-1 rounded-lg hover:bg-white/5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc275]"
          aria-label={`Đánh giá ${star} sao`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? 'fill-[#2dc275] text-[#2dc275]'
                : 'text-zinc-600'
            }`}
          />
        </button>
      ))}
      <span className="text-xs font-semibold text-zinc-400 ml-2">
        {value === 5 ? 'Tuyệt vời!' : value === 4 ? 'Rất tốt' : value === 3 ? 'Bình thường' : value === 2 ? 'Tạm được' : value === 1 ? 'Chưa hài lòng' : 'Chọn số sao'}
      </span>
    </div>
  );
}

// ── Star Display (read-only) ──────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'fill-[#2dc275] text-[#2dc275]' : 'text-zinc-700'}`}
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
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center bg-zinc-900/90 rounded-2xl p-6 border border-white/10 shadow-lg">
      {/* Average Score */}
      <div className="text-center shrink-0 space-y-1">
        <div className="text-5xl font-black text-[#2dc275] tracking-tight">{avg.toFixed(1)}</div>
        <div className="flex justify-center">
          <StarDisplay rating={Math.round(avg)} size="md" />
        </div>
        <div className="text-xs text-zinc-400 font-medium">{reviews.length} lượt đánh giá</div>
      </div>

      {/* Distribution Bars */}
      <div className="w-full flex-1 space-y-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
        {dist.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2.5 text-xs">
            <span className="text-zinc-400 w-3 font-semibold">{star}</span>
            <Star className="w-3 h-3 fill-[#2dc275] text-[#2dc275] shrink-0" />
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2dc275] to-[#40e08f] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-zinc-500 w-6 text-right font-mono">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onDelete, currentUserId }) {
  const userObj = review.userId;
  const name = userObj?.fullName || userObj?.email || 'Người tham gia';
  const avatar = userObj?.avatar;
  const isOwner = currentUserId && (userObj?._id === currentUserId || userObj?.id === currentUserId);
  const date = new Date(review.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="bg-zinc-900/60 rounded-2xl p-5 border border-white/5 hover:border-white/15 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center overflow-hidden shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#2dc275] font-extrabold text-sm">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-bold text-sm text-white">{name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={review.rating} size="sm" />
              <span className="text-[11px] text-zinc-500 font-medium">• {date}</span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(review._id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400"
            title="Xóa đánh giá"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {review.comment && (
        <p className="mt-3 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap pl-13">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ── Main ReviewSection ────────────────────────────────────────────────────────
const ReviewSection = ({ eventId }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // ── Fetch reviews ───────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getReviewsByEvent(eventId);
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { 
    fetchReviews(); 
  }, [fetchReviews]);

  // ── Submit review ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!user) {
      setFormError('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }

    if (rating === 0) { 
      setFormError('Vui lòng chọn số sao đánh giá (1 - 5 sao).'); 
      return; 
    }

    setSubmitting(true);
    try {
      const newReview = await createReview({ 
        userId: currentUserId, 
        eventId, 
        rating, 
        comment 
      });

      setReviews((prev) => [
        { 
          ...newReview, 
          userId: { 
            fullName: user.fullName || 'Bạn', 
            _id: currentUserId,
            avatar: user.avatar
          } 
        }, 
        ...prev
      ]);
      setRating(0);
      setComment('');
      setSuccessMsg('Cảm ơn bạn đã gửi đánh giá cho sự kiện!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setFormError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete review ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Không thể xóa đánh giá.');
    }
  };

  return (
    <div className="bg-zinc-900/60 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-8 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Đánh giá từ người tham gia</h3>
            <p className="text-zinc-400 text-xs">
              {reviews.length > 0 ? `Tổng hợp ${reviews.length} lượt đánh giá thực tế` : 'Chưa có đánh giá nào'}
            </p>
          </div>
        </div>
      </div>

      {/* Rating Summary Bar */}
      <RatingSummary reviews={reviews} />

      {/* Submit Form or Login Callout */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900/90 rounded-2xl p-5 sm:p-6 border border-white/10">
          <h4 className="font-bold text-sm text-white">Viết nhận xét của bạn</h4>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Bạn cảm thấy sự kiện thế nào? *</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Chia sẻ trải nghiệm chi tiết (tùy chọn)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Âm thanh, ánh sáng, khâu đón tiếp, nghệ sĩ biểu diễn..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
            />
          </div>

          {formError && (
            <p className="text-rose-400 text-xs font-medium">{formError}</p>
          )}

          {successMsg && (
            <p className="text-[#2dc275] text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(45,194,117,0.25)] cursor-pointer"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng tải...</>
            ) : (
              <><Send className="w-4 h-4" /> Gửi đánh giá</>
            )}
          </button>
        </form>
      ) : (
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Bạn đã tham gia sự kiện này?</h4>
            <p className="text-xs text-zinc-400">Đăng nhập để chia sẻ cảm nhận và đánh giá sao cho cộng đồng.</p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2dc275] text-black font-bold text-xs hover:bg-[#35d883] transition-all shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập để đánh giá</span>
          </Link>
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#2dc275]" />
          <span className="text-xs">Đang tải danh sách đánh giá...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-rose-400 text-xs">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-xs">Chưa có đánh giá nào cho sự kiện này. Hãy là người đầu tiên chia sẻ!</p>
        </div>
      ) : (
        <div className="space-y-3">
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
