import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, DollarSign, Ticket, Calendar, TrendingUp, 
  ShieldAlert, RefreshCw, Layers, Plus, Search, 
  Trash2, X, CheckCircle2, ArrowUpRight,
  Tag, Clock, MapPin, Sparkles, LayoutDashboard,
  ImagePlus, UploadCloud, Check, FileText
} from 'lucide-react';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

// ══════════════════════════════════════════════════════════════════════════════
// MODAL 1: EVENT CREATE / EDIT (WORLD-CLASS DESIGN)
// ══════════════════════════════════════════════════════════════════════════════
function AdminEventModal({ isOpen, onClose, onSave, editingEvent, categoriesData }) {
  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [date, setDate] = useState(editingEvent?.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[0] : '');
  const [time, setTime] = useState(editingEvent?.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[1]?.slice(0, 5) || '19:00' : '19:00');
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [categoryId, setCategoryId] = useState(editingEvent?.categoryId?._id || editingEvent?.categoryId || (categoriesData[0]?._id || ''));
  const [status, setStatus] = useState(editingEvent?.status || 'upcoming');
  const [image, setImage] = useState(editingEvent?.image || '');
  const [imageFile, setImageFile] = useState(null);
  const [imageSource, setImageSource] = useState('url'); // 'url' | 'upload'
  const [previewUrl, setPreviewUrl] = useState(editingEvent?.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setDescription(editingEvent.description || '');
      setDate(editingEvent.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[0] : '');
      setTime(editingEvent.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[1]?.slice(0, 5) || '19:00' : '19:00');
      setLocation(editingEvent.location || '');
      setCategoryId(editingEvent.categoryId?._id || editingEvent.categoryId || (categoriesData[0]?._id || ''));
      setStatus(editingEvent.status || 'upcoming');
      setImage(editingEvent.image || '');
      setPreviewUrl(editingEvent.image || '');
      setImageFile(null);
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setTime('19:00');
      setLocation('');
      setCategoryId(categoriesData[0]?._id || '');
      setStatus('upcoming');
      setImage('');
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [editingEvent, categoriesData]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUrlChange = (val) => {
    setImage(val);
    setPreviewUrl(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        title,
        description,
        date,
        time,
        location,
        categoryId,
        status,
        image,
        imageFile
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121216] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275] shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingEvent ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}
              </h3>
              <p className="text-xs text-zinc-400">Thiết lập thông tin, hình ảnh và lịch biểu diễn để mở bán vé</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: EVENT POSTER BANNER & LIVE PREVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-[#2dc275]" />
                <span>Ảnh bìa sự kiện (Poster Banner)</span>
              </label>
              
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    imageSource === 'url' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Nhập URL ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    imageSource === 'upload' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Tải tệp lên
                </button>
              </div>
            </div>

            {/* Live Banner Preview Box */}
            <div className="relative aspect-[21/9] sm:aspect-[16/7] rounded-2xl overflow-hidden bg-zinc-900/90 border-2 border-dashed border-white/15 flex items-center justify-center group shadow-inner">
              {previewUrl ? (
                <>
                  <img 
                    src={previewUrl} 
                    alt="Preview banner" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2dc275] text-black">
                      Ảnh hiển thị trực tiếp
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setImage(''); setPreviewUrl(''); setImageFile(null); }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-rose-500 text-white transition-all text-xs"
                    title="Xóa ảnh này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                    <ImagePlus className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">Chưa có ảnh bìa</p>
                  <p className="text-[11px] text-zinc-500">Nên chọn hình ảnh có tỉ lệ 16:9 độ nét cao để hiển thị đẹp nhất</p>
                </div>
              )}
            </div>

            {/* Input by Mode */}
            {imageSource === 'url' ? (
              <input 
                type="url"
                value={image} 
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Dán link ảnh tại đây (ví dụ: https://images.unsplash.com/...)" 
                className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
              />
            ) : (
              <label className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-[#18181c] border border-white/10 hover:border-[#2dc275]/50 text-xs text-zinc-300 hover:text-white cursor-pointer transition-all">
                <UploadCloud className="w-4 h-4 text-[#2dc275]" />
                <span className="font-semibold truncate">
                  {imageFile ? imageFile.name : 'Nhấn vào đây để chọn tệp ảnh từ máy tính (PNG, JPG, WEBP)'}
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {/* SECTION 2: BASIC DETAILS */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2dc275]" />
                <span>Tiêu đề sự kiện *</span>
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                placeholder="Ví dụ: Đại nhạc hội Mùa hè TicketBox Summer Fest 2026"
                className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-semibold placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
              />
            </div>

            {/* 2-col Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#2dc275]" />
                  <span>Danh mục thể loại *</span>
                </label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  required 
                  className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Chọn danh mục</option>
                  {categoriesData.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2dc275]" />
                  <span>Trạng thái mở bán *</span>
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="upcoming">Sắp diễn ra (Mở bán vé)</option>
                  <option value="ongoing">Đang diễn ra (Live Show)</option>
                  <option value="completed">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* 2-col Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2dc275]" />
                  <span>Ngày diễn ra *</span>
                </label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  required 
                  className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2dc275]" />
                  <span>Giờ bắt đầu *</span>
                </label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)}
                  required 
                  className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2dc275]" />
                <span>Địa điểm tổ chức *</span>
              </label>
              <input 
                type="text"
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                required 
                placeholder="Ví dụ: Trung tâm Hội nghị Quốc gia, Mễ Trì, Nam Từ Liêm, Hà Nội"
                className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2dc275]" />
                <span>Nội dung chi tiết sự kiện *</span>
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required 
                rows={4}
                placeholder="Giới thiệu ban tổ chức, danh sách nghệ sĩ biểu diễn, các lưu ý khi tham gia và sơ đồ vị trí..."
                className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all resize-none leading-relaxed" 
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all shadow-[0_0_25px_rgba(45,194,117,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu sự kiện</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL 2: TICKET CREATE / EDIT (WORLD-CLASS DESIGN)
// ══════════════════════════════════════════════════════════════════════════════
function AdminTicketModal({ isOpen, onClose, onSave, editingTicket, eventsData }) {
  const [eventId, setEventId] = useState(editingTicket?.eventId?._id || editingTicket?.eventId || (eventsData[0]?._id || ''));
  const [ticketName, setTicketName] = useState(editingTicket?.ticketName || '');
  const [price, setPrice] = useState(editingTicket?.price !== undefined ? editingTicket.price : 250000);
  const [quantity, setQuantity] = useState(editingTicket?.quantity || 100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTicket) {
      setEventId(editingTicket.eventId?._id || editingTicket.eventId || (eventsData[0]?._id || ''));
      setTicketName(editingTicket.ticketName || '');
      setPrice(editingTicket.price !== undefined ? editingTicket.price : 250000);
      setQuantity(editingTicket.quantity || 100);
    } else {
      setEventId(eventsData[0]?._id || '');
      setTicketName('');
      setPrice(250000);
      setQuantity(100);
    }
  }, [editingTicket, eventsData]);

  if (!isOpen) return null;

  const quickTicketNames = ['Vé VIP', 'Vé Tiêu Chuẩn', 'Early Bird', 'Học sinh / Sinh viên', 'Vé Nhóm (Group)'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        eventId,
        ticketName,
        price: Number(price),
        quantity: Number(quantity)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = eventsData.find(e => e._id === eventId);

  return typeof document !== 'undefined' ? createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121216] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275] shadow-sm">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingTicket ? 'Chỉnh sửa Hạng vé' : 'Thêm Hạng vé mới'}
              </h3>
              <p className="text-xs text-zinc-400">Định giá và phân bổ số lượng vé cho từng khu vực sự kiện</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Select Event */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2dc275]" />
              <span>Sự kiện áp dụng *</span>
            </label>
            <select 
              value={eventId} 
              onChange={(e) => setEventId(e.target.value)}
              required 
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all cursor-pointer"
            >
              <option value="">Chọn sự kiện</option>
              {eventsData.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>

          {/* Ticket Name & Quick Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2dc275]" />
              <span>Tên loại vé *</span>
            </label>
            <input 
              type="text"
              value={ticketName} 
              onChange={(e) => setTicketName(e.target.value)}
              required 
              placeholder="Ví dụ: Vé VIP Lối vào riêng & Ghế Front-row"
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickTicketNames.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setTicketName(name)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 hover:bg-[#2dc275]/20 hover:text-[#2dc275] text-zinc-300 border border-white/5 transition-all"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Currency Formatter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#2dc275]" />
                <span>Giá vé niêm yết (VNĐ) *</span>
              </label>
              <span className="text-xs font-extrabold text-[#2dc275]">
                {formatVND(price)}
              </span>
            </div>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              required 
              min={0}
              step={1000}
              placeholder="Ví dụ: 350000"
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
            />
            {/* Quick price chips */}
            <div className="flex flex-wrap gap-1.5">
              {[0, 150000, 300000, 500000, 1000000].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPrice(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 hover:bg-[#2dc275]/20 hover:text-[#2dc275] text-zinc-300 border border-white/5 transition-all"
                >
                  {p === 0 ? 'Miễn phí' : `${p / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Quick stepper chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#2dc275]" />
              <span>Số lượng vé phát hành *</span>
            </label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)}
              required 
              min={1}
              placeholder="100"
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-sm focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
            />
            <div className="flex flex-wrap gap-1.5">
              {[50, 100, 250, 500, 1000].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setQuantity(q)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 hover:bg-[#2dc275]/20 hover:text-[#2dc275] text-zinc-300 border border-white/5 transition-all"
                >
                  {q} vé
                </button>
              ))}
            </div>
          </div>

          {/* Live Ticket Badge Preview */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Xem trước thẻ vé</span>
            <div className="flex justify-between items-center pt-1">
              <div>
                <h5 className="font-bold text-white text-xs">{ticketName || 'Tên loại vé'}</h5>
                <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">{selectedEvent?.title || 'Sự kiện chưa chọn'}</p>
              </div>
              <div className="text-right">
                <span className="font-black text-[#2dc275] text-sm">{formatVND(price)}</span>
                <p className="text-[10px] text-zinc-400">Còn {quantity} vé</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all shadow-[0_0_25px_rgba(45,194,117,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu hạng vé</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL 3: CATEGORY CREATE / EDIT (WORLD-CLASS DESIGN)
// ══════════════════════════════════════════════════════════════════════════════
function AdminCategoryModal({ isOpen, onClose, onSave, editingCategory }) {
  const [name, setName] = useState(editingCategory?.name || '');
  const [description, setDescription] = useState(editingCategory?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setDescription(editingCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editingCategory]);

  if (!isOpen) return null;

  const quickCategories = [
    'Hòa nhạc & Âm nhạc',
    'Hội thảo & Công nghệ',
    'Thể thao & E-Sports',
    'Sân khấu & Kịch nói',
    'Triển lãm & Nghệ thuật'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        description
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return typeof document !== 'undefined' ? createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121216] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275] shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
              </h3>
              <p className="text-xs text-zinc-400">Phân loại sự kiện giúp khách hàng dễ dàng tìm kiếm</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2dc275]" />
              <span>Tên danh mục *</span>
            </label>
            <input 
              type="text"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required 
              placeholder="Ví dụ: Hòa nhạc & Âm nhạc"
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all" 
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickCategories.map((catName) => (
                <button
                  type="button"
                  key={catName}
                  onClick={() => setName(catName)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 hover:bg-[#2dc275]/20 hover:text-[#2dc275] text-zinc-300 border border-white/5 transition-all"
                >
                  + {catName}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2dc275]" />
              <span>Mô tả thể loại (tùy chọn)</span>
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả tóm tắt về loại hình sự kiện này..."
              className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-3 text-white text-xs placeholder:text-zinc-500 focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 outline-none transition-all resize-none" 
            />
          </div>

          {/* Live Category Pill Preview */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hiển thị ngoài trang chủ:</span>
            <div>
              <span className="inline-block px-4 py-2 rounded-full text-xs font-bold bg-[#2dc275] text-black shadow-[0_0_15px_rgba(45,194,117,0.3)]">
                {name || 'Tên danh mục'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all shadow-[0_0_25px_rgba(45,194,117,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu danh mục</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation Guard: Redirect if not Admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Tab State: 'overview' | 'events' | 'tickets' | 'categories'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  // Search query states for tabs
  const [searchQuery, setSearchQuery] = useState('');

  // Modals states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoadingData(true);
      setError('');

      if (activeTab === 'overview') {
        const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsJson = await statsRes.json();
        if (!statsRes.ok) throw new Error(statsJson.message || 'Lỗi tải dữ liệu thống kê.');
        setStats(statsJson);
      } else if (activeTab === 'events') {
        await fetchEvents();
        await fetchCategories();
      } else if (activeTab === 'tickets') {
        await fetchTickets();
        await fetchEvents();
      } else if (activeTab === 'categories') {
        await fetchCategories();
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi tải dữ liệu admin.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEventsData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTicketsData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategoriesData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  // ── Event Save Handler ─────────────────────────────────────────────────────
  const handleSaveEvent = async (eventData) => {
    let finalImageUrl = eventData.image;

    if (eventData.imageFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', eventData.imageFile);
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || 'Lỗi upload ảnh');
        finalImageUrl = uploadJson.url;
      } catch (err) {
        alert('Lỗi upload ảnh: ' + err.message);
        return;
      }
    }

    const payload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      categoryId: eventData.categoryId,
      status: eventData.status,
      image: finalImageUrl,
      eventDate: `${eventData.date}T${eventData.time}`
    };

    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `${API_URL}/events/${editingEvent._id}` : `${API_URL}/events`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || 'Lỗi khi lưu sự kiện.');

      setShowEventModal(false);
      setEditingEvent(null);
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.')) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể xóa sự kiện.');
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Ticket Save Handler ────────────────────────────────────────────────────
  const handleSaveTicket = async (ticketData) => {
    try {
      const method = editingTicket ? 'PUT' : 'POST';
      const url = editingTicket ? `${API_URL}/tickets/${editingTicket._id}` : `${API_URL}/tickets`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });
      
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || 'Lỗi khi lưu vé.');

      setShowTicketModal(false);
      setEditingTicket(null);
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hạng vé này?')) return;
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể xóa vé.');
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Category Save Handler ──────────────────────────────────────────────────
  const handleSaveCategory = async (categoryData) => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `${API_URL}/categories/${editingCategory._id}` : `${API_URL}/categories`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });
      
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.message || 'Lỗi khi lưu danh mục.');

      setShowCategoryModal(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể xóa danh mục.');
      await fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered lists by tab search query
  const lowerSearch = searchQuery.toLowerCase().trim();

  const filteredEvents = eventsData.filter(ev => {
    if (!lowerSearch) return true;
    return (
      (ev.title || '').toLowerCase().includes(lowerSearch) ||
      (ev.location || '').toLowerCase().includes(lowerSearch) ||
      (ev.categoryId?.name || '').toLowerCase().includes(lowerSearch)
    );
  });

  const filteredTickets = ticketsData.filter(tk => {
    if (!lowerSearch) return true;
    return (
      (tk.ticketName || '').toLowerCase().includes(lowerSearch) ||
      (tk.eventId?.title || '').toLowerCase().includes(lowerSearch)
    );
  });

  const filteredCategories = categoriesData.filter(cat => {
    if (!lowerSearch) return true;
    return (
      (cat.name || '').toLowerCase().includes(lowerSearch) ||
      (cat.description || '').toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Admin Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2dc275]/15 border border-[#2dc275]/30 text-[#2dc275] text-[11px] font-bold uppercase tracking-wider mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Trung tâm Quản trị Hệ thống</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Quản trị sự kiện, vé, danh mục và theo dõi các chỉ số doanh thu thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2dc275] ${loadingData ? 'animate-spin' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-5 py-4 rounded-2xl flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Segmented Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'overview', label: 'Tổng quan (Analytics)', icon: TrendingUp },
          { key: 'events', label: 'Quản lý Sự kiện', icon: Calendar },
          { key: 'tickets', label: 'Quản lý Hạng vé', icon: Ticket },
          { key: 'categories', label: 'Danh mục', icon: Layers }
        ].map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearchQuery(''); }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                isActive 
                  ? 'bg-[#2dc275] text-black border-[#2dc275] shadow-[0_0_20px_rgba(45,194,117,0.35)]' 
                  : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1: OVERVIEW & ANALYTICS
         ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Total Revenue */}
            <div className="relative overflow-hidden bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 group hover:border-[#2dc275]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Doanh thu tổng</span>
                <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {loadingData ? '...' : formatVND(stats?.summary?.totalRevenue || 0)}
                </span>
                <p className="text-[11px] text-[#2dc275] font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Từ các đơn hàng thanh toán thành công</span>
                </p>
              </div>
            </div>

            {/* 2. Total Users */}
            <div className="relative overflow-hidden bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tổng người dùng</span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {loadingData ? '...' : stats?.summary?.totalUsers || 0}
                </span>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                  Đang hoạt động: <b className="text-white">{stats?.summary?.activeUsers || 0}</b> tài khoản
                </p>
              </div>
            </div>

            {/* 3. Tickets Sold */}
            <div className="relative overflow-hidden bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 group hover:border-[#2dc275]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Vé đã bán ra</span>
                <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275]">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {loadingData ? '...' : stats?.summary?.totalTicketsSold || 0}
                </span>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                  Số vé điện tử đã cấp phát
                </p>
              </div>
            </div>

            {/* 4. Active Events */}
            <div className="relative overflow-hidden bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tổng sự kiện</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {loadingData ? '...' : stats?.events?.total || 0}
                </span>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                  Sắp diễn ra: <b className="text-[#2dc275]">{stats?.events?.upcoming || 0}</b> | Đã kết thúc: {stats?.events?.completed || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Grids: Recent Transactions & Top Selling Shows */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Recent Orders Table (8 cols) */}
            <div className="lg:col-span-8 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2dc275]" />
                  <span>Giao dịch mua vé gần đây</span>
                </h3>
                <span className="text-xs text-zinc-400 font-medium">Thời gian thực</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                      <th className="pb-3 pl-2">Mã Đơn</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">Tổng Tiền</th>
                      <th className="pb-3 text-right pr-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingData ? (
                      [1, 2, 3].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-4 pl-2"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
                          <td className="py-4"><div className="h-4 bg-zinc-800 rounded w-28" /></td>
                          <td className="py-4"><div className="h-4 bg-zinc-800 rounded w-20" /></td>
                          <td className="py-4 pr-2 text-right"><div className="h-6 bg-zinc-800 rounded w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : stats?.recentOrders?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-zinc-500">Chưa có giao dịch mua vé nào.</td>
                      </tr>
                    ) : (
                      stats?.recentOrders?.map((order) => (
                        <tr key={order._id} className="hover:bg-white/5 transition-all">
                          <td className="py-3.5 pl-2 font-mono font-bold text-white">#{order.orderCode}</td>
                          <td className="py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white">{order.userId?.fullName || 'Khách hàng'}</span>
                              <span className="text-[11px] text-zinc-400">{order.userId?.email || ''}</span>
                            </div>
                          </td>
                          <td className="py-3.5 font-extrabold text-[#2dc275]">{formatVND(order.totalPrice)}</td>
                          <td className="py-3.5 pr-2 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              order.status === 'paid' ? 'bg-[#2dc275]/15 text-[#2dc275] border-[#2dc275]/30' :
                              order.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                              'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {order.status === 'paid' ? 'Đã thanh toán' : order.status === 'pending' ? 'Chờ quét QR' : 'Đã hủy'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Events Widget (4 cols) */}
            <div className="lg:col-span-4 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Show bán chạy nhất</span>
              </h3>

              <div className="space-y-3">
                {loadingData ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="animate-pulse flex gap-3 items-center">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-zinc-800 rounded w-3/4" />
                        <div className="h-3 bg-zinc-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : stats?.topEvents?.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">Chưa có vé nào được bán ra.</div>
                ) : (
                  stats?.topEvents?.map((evt, idx) => (
                    <div key={evt._id || idx} className="flex gap-3.5 items-center p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' :
                        idx === 1 ? 'bg-zinc-300 text-black' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{evt.title}</h4>
                        <div className="flex justify-between items-center mt-1 text-[11px]">
                          <span className="text-zinc-400">Đã bán: <b className="text-white">{evt.ticketsSold}</b> vé</span>
                          <span className="text-[#2dc275] font-bold">{formatVND(evt.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2: EVENT MANAGEMENT
         ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sự kiện theo tên, địa điểm, thể loại..."
                className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2.5 rounded-full text-xs border border-white/10 focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <button 
              onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
              className="px-5 py-2.5 rounded-full bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(45,194,117,0.3)] cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Sự kiện mới</span>
            </button>
          </div>
          
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                    <th className="pb-3 pl-2">Tên Sự kiện</th>
                    <th className="pb-3">Ngày diễn ra</th>
                    <th className="pb-3">Địa điểm</th>
                    <th className="pb-3">Danh mục</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3 text-right pr-2">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingData ? (
                    [1, 2, 3].map(n => (
                      <tr key={n} className="animate-pulse">
                        <td colSpan="6" className="py-4 h-12 bg-zinc-800/20" />
                      </tr>
                    ))
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-zinc-500">
                        Không tìm thấy sự kiện nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map(ev => (
                      <tr key={ev._id} className="hover:bg-white/5 transition-all">
                        <td className="py-3.5 pl-2 font-bold text-white max-w-[220px] truncate">{ev.title}</td>
                        <td className="py-3.5 text-zinc-300">{new Date(ev.eventDate).toLocaleDateString('vi-VN')}</td>
                        <td className="py-3.5 text-zinc-300 max-w-[180px] truncate">{ev.location}</td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/5">
                            {ev.categoryId?.name || 'Chung'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            ev.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                            ev.status === 'completed' ? 'bg-[#2dc275]/15 text-[#2dc275] border-[#2dc275]/30' :
                            'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}>
                            {ev.status === 'upcoming' ? 'Sắp diễn ra' : ev.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2 space-x-2">
                          <button 
                            onClick={() => { setEditingEvent(ev); setShowEventModal(true); }} 
                            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(ev._id)} 
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: TICKET MANAGEMENT
         ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm hạng vé hoặc tên sự kiện..."
                className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2.5 rounded-full text-xs border border-white/10 focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <button 
              onClick={() => { setEditingTicket(null); setShowTicketModal(true); }}
              className="px-5 py-2.5 rounded-full bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(45,194,117,0.3)] cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Hạng vé mới</span>
            </button>
          </div>
          
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                    <th className="pb-3 pl-2">Loại vé</th>
                    <th className="pb-3">Sự kiện áp dụng</th>
                    <th className="pb-3">Đơn giá</th>
                    <th className="pb-3">Tổng vé</th>
                    <th className="pb-3">Đã bán</th>
                    <th className="pb-3 text-right pr-2">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingData ? (
                    [1, 2, 3].map(n => (
                      <tr key={n} className="animate-pulse"><td colSpan="6" className="py-4 h-12 bg-zinc-800/20" /></tr>
                    ))
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-zinc-500">Chưa có hạng vé nào được tạo.</td>
                    </tr>
                  ) : (
                    filteredTickets.map(tk => (
                      <tr key={tk._id} className="hover:bg-white/5 transition-all">
                        <td className="py-3.5 pl-2 font-bold text-white">{tk.ticketName}</td>
                        <td className="py-3.5 text-zinc-300 max-w-[200px] truncate">{tk.eventId?.title || 'N/A'}</td>
                        <td className="py-3.5 font-bold text-[#2dc275]">{formatVND(tk.price)}</td>
                        <td className="py-3.5 text-zinc-300">{tk.quantity}</td>
                        <td className="py-3.5 font-bold text-amber-400">{tk.soldQuantity || 0}</td>
                        <td className="py-3.5 text-right pr-2 space-x-2">
                          <button 
                            onClick={() => { setEditingTicket(tk); setShowTicketModal(true); }} 
                            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteTicket(tk._id)} 
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 4: CATEGORY MANAGEMENT
         ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm danh mục sự kiện..."
                className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2.5 rounded-full text-xs border border-white/10 focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <button 
              onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              className="px-5 py-2.5 rounded-full bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(45,194,117,0.3)] cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh mục mới</span>
            </button>
          </div>
          
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase font-semibold">
                    <th className="pb-3 pl-2">Tên danh mục</th>
                    <th className="pb-3">Mô tả</th>
                    <th className="pb-3 text-right pr-2">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingData ? (
                    [1, 2, 3].map(n => (
                      <tr key={n} className="animate-pulse"><td colSpan="3" className="py-4 h-12 bg-zinc-800/20" /></tr>
                    ))
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-zinc-500">Chưa có danh mục nào.</td>
                    </tr>
                  ) : (
                    filteredCategories.map(cat => (
                      <tr key={cat._id} className="hover:bg-white/5 transition-all">
                        <td className="py-3.5 pl-2 font-bold text-white">{cat.name}</td>
                        <td className="py-3.5 text-zinc-400 max-w-[300px] truncate">{cat.description || 'Không có mô tả'}</td>
                        <td className="py-3.5 text-right pr-2 space-x-2">
                          <button 
                            onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }} 
                            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat._id)} 
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          STANDALONE MODALS VIA REACT PORTAL
         ════════════════════════════════════════════════════════════════════════ */}
      <AdminEventModal
        isOpen={showEventModal}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        categoriesData={categoriesData}
      />

      <AdminTicketModal
        isOpen={showTicketModal}
        onClose={() => { setShowTicketModal(false); setEditingTicket(null); }}
        onSave={handleSaveTicket}
        editingTicket={editingTicket}
        eventsData={eventsData}
      />

      <AdminCategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default AdminDashboard;
