import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, Calendar, MapPin, QrCode, CheckCircle2, Clock, 
  XCircle, Copy, ExternalLink, CalendarPlus, X, Sparkles, 
  ChevronRight, AlertCircle, Share2, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const STATUS_META = {
  paid: { 
    label: 'Đã thanh toán • Sẵn sàng', 
    className: 'bg-[#2dc275]/15 text-[#2dc275] border-[#2dc275]/30' 
  },
  pending: { 
    label: 'Chờ thanh toán', 
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
  },
  cancelled: { 
    label: 'Đã hủy', 
    className: 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
  },
  refunded: { 
    label: 'Đã hoàn tiền', 
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
  }
};

const FILTERS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'paid', label: 'Vé sẵn sàng' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'cancelled', label: 'Đã huỷ' }
];

const MyTickets = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${API_URL}/orders/${cancellingOrder._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ reason: cancelReason || 'Khách hàng yêu cầu hủy vé' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi hủy vé.');

      setOrders(prev => prev.map(o => o._id === cancellingOrder._id ? { ...o, status: 'cancelled' } : o));
      setSuccessToast(`Đã hủy thành công đơn hàng #${cancellingOrder.orderCode}.`);
      setCancellingOrder(null);
      setCancelReason('');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Không thể hủy vé');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/orders/user/${user.id || user._id}`);
        if (!response.ok) throw new Error('Failed to fetch user orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(String(code));
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const makeGoogleCalendarUrl = (order) => {
    const detail = order.orderDetails?.[0];
    const eventName = detail?.eventName || 'Sự kiện TicketBox';
    const eventDate = detail?.eventDate ? new Date(detail.eventDate) : new Date();
    const end = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);
    const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${formatGDate(eventDate)}/${formatGDate(end)}&details=${encodeURIComponent(`Mã vé: ${order.orderCode}`)}&location=${encodeURIComponent(detail?.location || '')}`;
  };

  const getOrderTitle = (order) => {
    const firstEvent = order.orderDetails?.find((d) => d.eventName)?.eventName;
    if (firstEvent) return firstEvent;
    return `Đơn hàng (${order.orderDetails?.length || 0} vé)`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2dc275] mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Ví vé điện tử cá nhân</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Vé của tôi
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Quản lý vé tham gia, mã QR check-in tại cửa và hóa đơn thanh toán
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="self-start md:self-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#2dc275] hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <span>Đặt thêm vé sự kiện</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 ${
              filter === key
                ? 'bg-[#2dc275] text-black border-[#2dc275] shadow-[0_0_15px_rgba(45,194,117,0.3)]'
                : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white hover:border-white/20'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-[#121215] border border-white/5 rounded-3xl p-6 space-y-4 animate-pulse h-80" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {filteredOrders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.pending;
            const eventDate = order.orderDetails?.find((d) => d.eventDate)?.eventDate;
            const location = order.orderDetails?.find((d) => d.location)?.location;
            const isPaid = order.status === 'paid';
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKETBOX-${order.orderCode}&color=000000`;

            return (
              <div
                key={order._id}
                className="group relative flex flex-col bg-[#121215] rounded-3xl border border-white/10 hover:border-[#2dc275]/50 transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Visual Top Bar Accent */}
                <div className={`h-1.5 w-full ${isPaid ? 'bg-gradient-to-r from-[#2dc275] to-[#40e08f]' : 'bg-zinc-700'}`} />

                {/* Main Body */}
                <div className="p-6 space-y-4 flex-1">
                  
                  {/* Status & Code Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-zinc-400 font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                      #{order.orderCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-[#2dc275] transition-colors">
                    {getOrderTitle(order)}
                  </h3>

                  {/* Metadata: Date & Venue */}
                  <div className="space-y-2 text-xs text-zinc-300 pt-1">
                    {eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#2dc275] shrink-0" />
                        <span>{formatDate(eventDate)}</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#2dc275] shrink-0" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Items List */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    {order.orderDetails?.map((detail, idx) => (
                      <div
                        key={detail._id || idx}
                        className="flex justify-between items-center text-xs py-1 px-2 rounded-lg bg-zinc-900/60 text-zinc-200"
                      >
                        <span className="font-medium">
                          {detail.quantity}x {detail.ticketName || 'Vé sự kiện'}
                        </span>
                        <span className="font-bold text-[#2dc275]">
                          {formatVND(detail.lineTotal ?? detail.unitPrice * detail.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total price */}
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-xs text-zinc-400">Tổng thanh toán</span>
                    <span className="text-base font-extrabold text-white">
                      {formatVND(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Perforated Stub Line Effect (Skeuomorphic Ticket Stubs) */}
                <div className="relative flex items-center justify-between px-0 py-1 bg-[#121215]">
                  <div className="w-4 h-8 bg-[#000000] rounded-r-full -ml-2 border-r border-white/10" />
                  <div className="flex-1 border-b-2 border-dashed border-white/15 mx-2" />
                  <div className="w-4 h-8 bg-[#000000] rounded-l-full -mr-2 border-l border-white/10" />
                </div>

                {/* Ticket Stub Action Footer */}
                <div className="p-5 bg-zinc-900/80 border-t border-white/5 space-y-3">
                  {isPaid ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedTicketModal({ ...order, qrUrl })}
                        className="flex-1 py-2.5 rounded-xl bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(45,194,117,0.25)] cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Mở mã QR check-in</span>
                      </button>

                      <a
                        href={makeGoogleCalendarUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                        title="Thêm vào Google Calendar"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 transition-all cursor-pointer"
                        title="Hủy vé & hoàn trả"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : order.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/checkout')}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Thanh toán ngay</span>
                      </button>
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="py-2.5 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 transition-all text-xs font-semibold cursor-pointer"
                        title="Hủy đơn hàng"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-[11px] text-zinc-500 italic py-1 flex items-center justify-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500/60" />
                      <span>{order.status === 'cancelled' ? 'Đơn hàng đã được hủy' : 'Đơn hàng đã hoàn tiền'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-white/10 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Chưa có vé nào</h2>
          <p className="text-zinc-400 text-xs max-w-sm mx-auto">
            Bạn chưa có vé hoặc không có đơn hàng nào ở trạng thái này. Khám phá các sự kiện hot để đặt vé ngay hôm nay.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-[#2dc275] text-black font-extrabold text-xs hover:bg-[#35d883] transition-all shadow-[0_0_20px_rgba(45,194,117,0.3)] cursor-pointer"
            >
              Khám phá sự kiện ngay
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-zinc-900 border border-[#2dc275]/40 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#2dc275] shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>,
        document.body
      )}

      {/* Digital Ticket QR Modal (High Contrast Full Screen Scan) */}
      {selectedTicketModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedTicketModal(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#141418] border border-white/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl text-center animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#2dc275]/20 text-[#2dc275] text-[10px] font-bold uppercase tracking-wider">
                Digital Event Pass
              </span>
              <h3 className="text-xl font-black text-white line-clamp-1">
                {getOrderTitle(selectedTicketModal)}
              </h3>
              <p className="text-xs text-zinc-400">
                Mã vé: <span className="text-white font-mono font-bold">#{selectedTicketModal.orderCode}</span>
              </p>
            </div>

            {/* High Contrast White QR Container for Gate Scanners */}
            <div className="p-5 bg-white rounded-2xl mx-auto inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <img
                src={selectedTicketModal.qrUrl}
                alt="Gate Check-in QR"
                className="w-56 h-56 object-contain"
              />
              <div className="pt-2 text-center">
                <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                  QUÉT TẠI CỔNG VÀO
                </span>
              </div>
            </div>

            {/* Attendee Info & Screen Brightness Notice */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">Người sở hữu:</span>
                <span className="font-bold text-white">{user?.fullName || 'Khách hàng TicketBox'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Trạng thái vé:</span>
                <span className="font-bold text-[#2dc275]">Hợp lệ • Sẵn sàng check-in</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              💡 Vui lòng tăng độ sáng màn hình điện thoại khi đưa mã QR cho nhân viên soát vé tại cửa.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleCopyCode(selectedTicketModal.orderCode)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedCode === selectedTicketModal.orderCode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#2dc275]" />
                    <span className="text-[#2dc275]">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedTicketModal(null)}
                className="flex-1 py-3 rounded-xl bg-[#2dc275] text-black font-bold text-xs hover:bg-[#35d883] transition-all cursor-pointer"
              >
                Xong
              </button>
            </div>

            {/* Secondary Option: Cancel Ticket */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const target = selectedTicketModal;
                  setSelectedTicketModal(null);
                  setCancellingOrder(target);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hủy vé & hoàn trả đơn này</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Ticket Confirmation Modal */}
      {cancellingOrder && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => !isCancelling && setCancellingOrder(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141418] border border-white/15 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {cancellingOrder.status === 'paid' ? 'Xác nhận hủy vé' : 'Hủy đơn hàng'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Đơn hàng: <span className="font-mono text-white font-bold">#{cancellingOrder.orderCode}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isCancelling && setCancellingOrder(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Details Summary */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{getOrderTitle(cancellingOrder)}</h4>
                  <div className="text-zinc-400 mt-1 space-y-0.5">
                    {cancellingOrder.orderDetails?.map((d, idx) => (
                      <div key={idx}>• {d.quantity}x {d.ticketName || 'Vé'} ({formatVND(d.unitPrice)})</div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#2dc275] text-sm">{formatVND(cancellingOrder.totalPrice)}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {cancellingOrder.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </p>
                </div>
              </div>
            </div>

            {/* Policy and Stock Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Lưu ý khi hủy vé:</span>
              </p>
              <p className="text-[11px] text-zinc-300 pl-5">
                {cancellingOrder.status === 'paid' 
                  ? '• Số lượng vé này sẽ được tự động hoàn trả lại hệ thống sự kiện để khán giả khác có thể đặt mua. Mã QR vào cổng sẽ bị vô hiệu hóa ngay lập tức.'
                  : '• Phiên đặt giữ chỗ này sẽ bị hủy bỏ ngay.'}
              </p>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Lý do hủy vé (tùy chọn)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Bận việc đột xuất',
                  'Đặt nhầm vé / số lượng',
                  'Thay đổi lịch trình',
                  'Lý do cá nhân khác'
                ].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setCancelReason(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      cancelReason === r 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                        : 'bg-white/5 text-zinc-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do cụ thể khác nếu có..."
                className="w-full bg-[#18181c] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs placeholder:text-zinc-500 focus:border-rose-500 outline-none transition-all mt-1.5"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                Giữ lại vé
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý hủy...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận hủy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyTickets;
