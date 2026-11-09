import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, MapPin, Share2, Heart, ChevronLeft, Plus, Minus, 
  Ticket, RefreshCw, CheckCircle2, ExternalLink, CalendarPlus, 
  Sparkles, ShieldCheck, Clock, Users, ArrowRight, AlertCircle, Copy
} from 'lucide-react';
import ReviewSection from '../components/ReviewSection';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  
  const ticketSectionRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const BACKEND_URL = API_URL.replace('/api', '');

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không tìm thấy sự kiện');
        
        setEventData(data);
        
        // Initialize quantities
        const initQtys = {};
        (data.tickets || []).forEach(t => {
          initQtys[t._id] = 0;
        });
        setQuantities(initQtys);
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id, API_URL]);

  const updateQty = (ticketId, delta, available) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > available) return prev; // Do not exceed available
      return { ...prev, [ticketId]: next };
    });
  };

  const scrollToTickets = () => {
    ticketSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: eventData?.title || 'Sự kiện TicketBox',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const getPerks = (ticketName) => {
    const lower = (ticketName || '').toLowerCase();
    if (lower.includes('vip') || lower.includes('premium')) {
      return ['Lối check-in ưu tiên riêng biệt', 'Vị trí sát sân khấu & tầm nhìn đẹp nhất', 'Tặng 01 phần nước & quà lưu niệm'];
    }
    if (lower.includes('early') || lower.includes('sinh viên') || lower.includes('student')) {
      return ['Vé ưu đãi số lượng giới hạn', 'Khu vực khán đài tiêu chuẩn', 'Vé điện tử quét mã QR tức thì'];
    }
    return ['Vào cổng sự kiện tiêu chuẩn', 'Vé điện tử bảo mật QR Code', 'Tự do trải nghiệm tất cả các khu vực chung'];
  };

  const makeGoogleCalendarUrl = (event) => {
    if (!event || !event.eventDate) return '#';
    const start = new Date(event.eventDate);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(event.title || 'Sự kiện TicketBox');
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGDate(start)}/${formatGDate(end)}&details=${details}&location=${location}`;
  };

  const makeGoogleMapsUrl = (location) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || '')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <RefreshCw className="animate-spin text-[#2dc275] w-10 h-10" />
        <p className="text-sm font-medium">Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Không tìm thấy sự kiện</h2>
        <p className="text-zinc-400 text-sm">Sự kiện có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-2 px-6 py-2.5 rounded-full bg-[#2dc275] text-black font-semibold text-xs hover:bg-[#35d883] transition-all"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const tickets = eventData.tickets || [];
  const eventDate = new Date(eventData.eventDate);
  const isPast = eventDate < new Date();
  const totalPrice = tickets.reduce((sum, t) => sum + (t.price * (quantities[t._id] || 0)), 0);
  const totalQty = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const handleProceedToCheckout = () => {
    const items = tickets
      .filter(t => (quantities[t._id] || 0) > 0)
      .map(t => ({
        ticketId: t._id,
        name: eventData.title,
        type: t.ticketName,
        quantity: quantities[t._id],
        unitPrice: t.price
      }));
    navigate('/checkout', { state: { items, totalAmount: totalPrice } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium py-1 px-2 -ml-2 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4 text-[#2dc275]" />
          <span>Tất cả sự kiện</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            title="Chia sẻ sự kiện"
          >
            {copiedShare ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2dc275]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShare ? 'Đã sao chép link' : 'Chia sẻ'}</span>
          </button>

          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full border transition-all ${
              isLiked 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-500' 
                : 'bg-zinc-900 border-white/10 text-zinc-300 hover:text-rose-400'
            }`}
            title="Lưu yêu thích"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column (8 cols): Hero Media, Bento Boxes, Description, Reviews */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Main Visual Poster Banner */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl">
            <img 
              src={getImageUrl(eventData.image)} 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
              }}
              alt={eventData.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Category badge over banner */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2dc275] text-black shadow-md">
                {eventData.categoryId?.name || 'Sự kiện đặc sắc'}
              </span>
              {isPast && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/80 text-white backdrop-blur-md">
                  Đã diễn ra
                </span>
              )}
            </div>
          </div>

          {/* Event Title Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {eventData.title}
            </h1>
          </div>

          {/* Bento Grid: Date/Time + Location Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Bento Card 1: Date & Calendar Add */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2dc275]/10 border border-[#2dc275]/20 flex items-center justify-center text-[#2dc275]">
                  <Calendar className="w-5 h-5" />
                </div>
                <a
                  href={makeGoogleCalendarUrl(eventData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2dc275] hover:underline"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Thêm vào lịch</span>
                </a>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Thời gian diễn ra</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {eventDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-zinc-300 font-medium mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2dc275]" />
                  {eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (Giờ Việt Nam)
                </p>
              </div>
            </div>

            {/* Bento Card 2: Location & Google Maps */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2dc275]/10 border border-[#2dc275]/20 flex items-center justify-center text-[#2dc275]">
                  <MapPin className="w-5 h-5" />
                </div>
                <a
                  href={makeGoogleMapsUrl(eventData.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2dc275] hover:underline"
                >
                  <span>Chỉ đường</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Địa điểm tổ chức</p>
                <p className="text-sm font-bold text-white mt-0.5 line-clamp-2">
                  {eventData.location}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Guarantees Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#121215] border border-white/5 text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2dc275] shrink-0" />
              <span>Vé chính hãng từ Ban tổ chức</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#2dc275] shrink-0" />
              <span>Quét mã QR vào cổng tức thì</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2dc275] shrink-0" />
              <span>Hỗ trợ thanh toán VietQR 24/7</span>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Giới thiệu sự kiện
            </h3>
            <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap space-y-3">
              {eventData.description}
            </div>
          </div>

          {/* Review & Ratings Section */}
          <div className="pt-4">
            <ReviewSection eventId={id} />
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Ticket Selection Box */}
        <div ref={ticketSectionRef} className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-[#141418] border border-white/15 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2dc275]/15 flex items-center justify-center text-[#2dc275]">
                  <Ticket className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">Chọn loại vé</h2>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {tickets.length} hạng vé
              </span>
            </div>

            {isPast && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Sự kiện này đã kết thúc. Rất tiếc hiện không thể đặt thêm vé.</span>
              </div>
            )}

            {/* Ticket Tier Cards List */}
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs italic">
                  Hiện chưa có thông tin loại vé cho sự kiện này.
                </div>
              ) : (
                tickets.map(ticket => {
                  const available = (ticket.quantity || 0) - (ticket.soldQuantity || 0);
                  const isSoldOut = available <= 0;
                  const selectedCount = quantities[ticket._id] || 0;
                  const perks = getPerks(ticket.ticketName);

                  return (
                    <div 
                      key={ticket._id}
                      className={`p-4 rounded-2xl border transition-all ${
                        selectedCount > 0 
                          ? 'bg-[#1b1b22] border-[#2dc275]/60 shadow-[0_0_20px_rgba(45,194,117,0.15)]' 
                          : 'bg-zinc-900/80 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Name & Price */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{ticket.ticketName}</h4>
                          <span className={`inline-block text-[11px] font-semibold mt-0.5 ${
                            isSoldOut 
                              ? 'text-rose-400' 
                              : available <= 15 
                                ? 'text-amber-400' 
                                : 'text-[#2dc275]'
                          }`}>
                            {isSoldOut ? 'Hết vé' : available <= 15 ? `Chỉ còn ${available} vé!` : `Còn ${available} vé`}
                          </span>
                        </div>
                        <span className="font-extrabold text-[#2dc275] text-lg">
                          {ticket.price ? `${ticket.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                        </span>
                      </div>

                      {/* Perks list */}
                      <ul className="space-y-1 my-3 pt-2 border-t border-white/5">
                        {perks.map((p, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                            <CheckCircle2 className="w-3 h-3 text-[#2dc275] shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Stepper +/- Controller */}
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => updateQty(ticket._id, -1, available)}
                          disabled={selectedCount <= 0 || isSoldOut || isPast}
                          className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white hover:bg-[#2dc275] hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-bold text-white text-base">
                          {selectedCount}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQty(ticket._id, 1, available)}
                          disabled={isSoldOut || isPast || selectedCount >= available}
                          className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white hover:bg-[#2dc275] hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total Calculation & Checkout CTA Button */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Đã chọn ({totalQty} vé)</span>
                <span className="text-2xl font-black text-white">
                  {totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={totalQty === 0 || isPast}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  totalQty > 0 && !isPast
                    ? 'bg-[#2dc275] text-black hover:bg-[#35d883] hover:scale-[1.02] shadow-[0_10px_30px_rgba(45,194,117,0.35)] cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span>{isPast ? 'Sự kiện đã kết thúc' : totalQty === 0 ? 'Vui lòng chọn vé' : 'Tiếp tục thanh toán'}</span>
                {totalQty > 0 && !isPast && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Booking Bar (visible on mobile screens when tickets selected or CTA pressed) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d10]/95 backdrop-blur-xl border-t border-white/15 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-[11px] text-zinc-400">
              {totalQty > 0 ? `Đã chọn ${totalQty} vé` : 'Chưa chọn vé'}
            </span>
            <span className="block text-xl font-black text-white">
              {totalPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {totalQty > 0 ? (
            <button
              onClick={handleProceedToCheckout}
              disabled={isPast}
              className="px-6 py-3 rounded-xl bg-[#2dc275] text-black font-bold text-sm shadow-[0_0_20px_rgba(45,194,117,0.35)] flex items-center gap-1.5"
            >
              <span>Thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={scrollToTickets}
              disabled={isPast}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-[#2dc275] hover:text-black text-white font-bold text-sm transition-all"
            >
              Chọn vé ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
