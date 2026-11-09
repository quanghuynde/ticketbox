import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Lock, CheckCircle2,
  XCircle, Copy, RefreshCw, Clock, ShieldCheck,
  AlertTriangle, ArrowRight, Ticket, QrCode, ExternalLink
} from 'lucide-react';
import { createPayment, getPaymentStatus } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#2dc275]/20 text-zinc-300 hover:text-[#2dc275] transition-all flex items-center gap-1 text-xs"
      title="Sao chép"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2dc275]" />
          <span className="text-[10px] text-[#2dc275] font-semibold">Đã chép</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span className="text-[10px]">Chép</span>
        </>
      )}
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ── order data from state ───────────────────────────────────────────────────
  const orderItems = location.state?.items || [
    { name: 'Sự kiện âm nhạc TicketBox Live', type: 'Vé Tiêu Chuẩn', quantity: 1, unitPrice: 350_000 }
  ];
  const processingFee = 0; // Transparent zero hidden fee standard
  const subtotal = orderItems.reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
  const totalAmount = subtotal + processingFee;

  // ── state ───────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1=method, 2=qr, 3=result
  const [paymentMethod, setPaymentMethod] = useState('payos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payData, setPayData] = useState(null);
  const [pollStatus, setPollStatus] = useState('pending'); // 'pending'|'paid'|'failed'
  const [countdown, setCountdown] = useState(600); // 10 min expiry

  const pollRef = useRef(null);
  const countRef = useRef(null);

  // ── polling ─────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current);
    clearInterval(countRef.current);
  }, []);

  const startPolling = useCallback((orderCode) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await getPaymentStatus(orderCode);
        if (data.status === 'paid' || data.paymentStatus === 'success') {
          setPollStatus('paid');
          setStep(3);
          stopPolling();
        } else if (data.status === 'cancelled' || data.status === 'failed') {
          setPollStatus('failed');
          setStep(3);
          stopPolling();
        }
      } catch { /* network hiccup – keep polling */ }
    }, 3000);

    // countdown timer
    countRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopPolling();
          setPollStatus('failed');
          setStep(3);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Handle PayOS return URL redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    const orderCodeParam = params.get('orderCode');
    
    if (statusParam && orderCodeParam) {
      if (statusParam === 'PAID') {
        const verifyPayment = async () => {
          try {
            const data = await getPaymentStatus(orderCodeParam);
            if (data.status === 'paid' || data.paymentStatus === 'success') {
              setPollStatus('paid');
              setStep(3);
              setPayData({ orderCode: orderCodeParam });
            }
          } catch (err) {
            console.error('Error verifying payment after redirect:', err);
          }
        };
        verifyPayment();
      } else {
        setPollStatus('failed');
        setStep(3);
      }
    }
  }, [location.search]);

  // ── pay now handler ──────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createPayment(orderItems, totalAmount, user?.id || user?._id);
      setPayData(data);
      setStep(2);
      startPolling(data.orderCode);
    } catch (err) {
      setError('Không thể tạo đơn hàng thanh toán. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── countdown display ────────────────────────────────────────────────────────
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4 text-[#2dc275]" />
          <span>Quay lại sự kiện</span>
        </button>

        {/* Cart Reservation Lock Timer (International CRO best practice) */}
        {step < 3 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Giữ vé trong:</span>
            <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-md border border-amber-500/30">
              {mm}:{ss}
            </span>
          </div>
        )}
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 py-2">
        {[
          { n: 1, label: 'Xác nhận đơn' },
          { n: 2, label: 'Quét VietQR' },
          { n: 3, label: 'Nhận vé' }
        ].map(({ n, label }, i, arr) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2.5 ${step >= n ? 'text-[#2dc275]' : 'text-zinc-500'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                step >= n 
                  ? 'border-[#2dc275] bg-[#2dc275]/15 text-[#2dc275] shadow-[0_0_15px_rgba(45,194,117,0.3)]' 
                  : 'border-zinc-800 bg-zinc-900 text-zinc-500'
              }`}>
                {n}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{label}</span>
            </div>
            {i < arr.length - 1 && (
              <div className={`w-8 sm:w-16 h-[2px] transition-all ${step > n ? 'bg-[#2dc275]' : 'bg-zinc-800'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Method selection & Order review ───────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Payment Method Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Phương thức thanh toán</h2>
              <p className="text-zinc-400 text-xs">Hỗ trợ chuyển khoản ngân hàng tự động qua mã VietQR an toàn.</p>
            </div>

            <div className="space-y-3">
              {/* PayOS VietQR Option */}
              <div
                onClick={() => setPaymentMethod('payos')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'payos' 
                    ? 'border-[#2dc275] bg-[#2dc275]/10 shadow-[0_0_25px_rgba(45,194,117,0.15)]' 
                    : 'border-white/10 bg-zinc-900/60 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                    <span className="text-black font-black text-xs tracking-tight">VietQR</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Chuyển khoản VietQR tức thì</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2dc275]/20 text-[#2dc275]">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Quét mã bằng bất kỳ App ngân hàng nào (MB, VCB, Techcombank, MoMo...)</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMethod === 'payos' ? 'border-[#2dc275]' : 'border-zinc-700'
                }`}>
                  {paymentMethod === 'payos' && <div className="w-2.5 h-2.5 rounded-full bg-[#2dc275]" />}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Trust badge */}
            <div className="p-4 rounded-2xl bg-[#121215] border border-white/5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2dc275] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-white text-xs font-bold">Thanh toán bảo mật chuẩn SSL 256-bit</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Vé điện tử sẽ được cấp phát ngay lập tức và gửi về tài khoản sau khi ngân hàng xác nhận giao dịch thành công.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-5 bg-zinc-900/90 rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#2dc275]" />
                Tóm tắt vé đặt
              </h3>
              <span className="text-xs text-zinc-400 font-semibold">{orderItems.length} mục</span>
            </div>

            <div className="space-y-3 divide-y divide-white/5">
              {orderItems.map((item, i) => (
                <div key={i} className="pt-3 first:pt-0 flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-zinc-300 font-medium">
                      {item.quantity}x {item.type}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-white shrink-0">
                    {formatVND(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Tạm tính</span>
                <span className="text-zinc-200 font-semibold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Phí dịch vụ</span>
                <span className="text-[#2dc275] font-semibold">Miễn phí</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-zinc-300 font-bold text-sm">Tổng thanh toán</span>
              <span className="text-2xl font-black text-[#2dc275]">{formatVND(totalAmount)}</span>
            </div>

            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#2dc275] text-black font-extrabold text-base
                hover:bg-[#35d883] hover:scale-[1.02] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.35)]
                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Đang khởi tạo VietQR...</span>
                </>
              ) : (
                <>
                  <span>Thanh toán ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: VietQR Live Payment View ─────────────────────────────── */}
      {step === 2 && payData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: QR Code Box */}
          <div className="lg:col-span-5 flex flex-col items-center gap-5 bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 text-center shadow-xl">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Quét mã VietQR</h2>
              <p className="text-zinc-400 text-xs">Mở ứng dụng ngân hàng bất kỳ để quét mã thanh toán</p>
            </div>

            {/* High Contrast White QR Container */}
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(45,194,117,0.2)] border-4 border-white flex flex-col items-center">
              <img
                src={payData.qrUrl}
                alt="VietQR Payment Code"
                className="w-60 h-60 object-contain"
              />
            </div>

            {payData.checkoutUrl && (
              <a
                href={payData.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2dc275] hover:underline bg-[#2dc275]/10 px-4 py-2 rounded-full border border-[#2dc275]/25 font-semibold"
              >
                <span>Mở trang thanh toán dự phòng</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Live Polling Status Indicator */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-white/10 text-xs text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2dc275] animate-ping" />
              <span>Hệ thống đang tự động kiểm tra giao dịch...</span>
            </div>
          </div>

          {/* Right: Bank Details & Direct Confirmation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white">Thông tin chuyển khoản thủ công</h3>
                <span className="text-[11px] text-zinc-400">(Nếu không thể quét QR)</span>
              </div>

              <div className="space-y-4">
                <InfoRow label="Ngân hàng thụ hưởng" value={payData.bankInfo?.bankId} />
                <InfoRow label="Số tài khoản" value={payData.bankInfo?.accountNo} copyable />
                <InfoRow label="Tên người nhận" value={payData.bankInfo?.accountName} />
                <InfoRow label="Số tiền chính xác" value={formatVND(payData.amount)} highlight copyable rawValue={payData.amount} />
                <InfoRow label="Nội dung chuyển khoản" value={payData.orderCode} copyable important />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý quan trọng:</strong> Vui lòng giữ nguyên <strong>Mã nội dung ({payData.orderCode})</strong> khi chuyển khoản để hệ thống tự động xuất vé ngay lập tức.
              </div>
            </div>

            <button
              onClick={() => { stopPolling(); setStep(1); }}
              className="w-full py-3.5 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-xs font-bold"
            >
              Hủy thanh toán & Đổi thông tin
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Celebratory Result View ──────────────────────────────── */}
      {step === 3 && (
        <div className="bg-zinc-900/90 rounded-3xl border border-white/10 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-8 shadow-2xl">
          {pollStatus === 'paid' ? (
            <>
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-[#2dc275]/20 blur-xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-[#2dc275]/15 border-2 border-[#2dc275] flex items-center justify-center text-[#2dc275]">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">Thanh toán thành công!</h2>
                <p className="text-zinc-300 text-sm max-w-md mx-auto leading-relaxed">
                  Đơn hàng của bạn đã được xác nhận. Vé điện tử kèm mã QR vào cổng đã sẵn sàng trong tài khoản của bạn.
                </p>
                {payData?.orderCode && (
                  <p className="text-xs font-mono text-zinc-400 bg-black/40 py-1 px-3 rounded-full inline-block border border-white/10 mt-2">
                    Mã đơn hàng: #{payData.orderCode}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="px-8 py-3.5 rounded-2xl bg-[#2dc275] text-black font-extrabold text-sm hover:bg-[#35d883] hover:scale-105 transition-all shadow-[0_0_25px_rgba(45,194,117,0.35)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Xem vé điện tử ngay</span>
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3.5 rounded-2xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Thanh toán chưa hoàn tất</h2>
                <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                  {countdown === 0 
                    ? 'Thời gian giữ vé đã hết hạn. Vui lòng thực hiện đặt lại.' 
                    : 'Giao dịch chưa được hệ thống ghi nhận hoặc đã bị hủy.'}
                </p>
              </div>

              <button
                onClick={() => { setStep(1); setPayData(null); setCountdown(600); setPollStatus('pending'); setError(''); }}
                className="px-8 py-3.5 rounded-full bg-[#2dc275] text-black font-bold text-xs hover:bg-[#35d883] transition-all"
              >
                Thử lại thanh toán
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── small helper row component ────────────────────────────────────────────────
function InfoRow({ label, value, copyable = false, highlight = false, important = false, rawValue }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0">
      <span className={`text-xs ${important ? 'text-amber-300 font-semibold' : 'text-zinc-400'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-xs font-bold truncate ${highlight ? 'text-[#2dc275] text-base' : 'text-white'} ${important ? 'text-amber-200' : ''}`}>
          {value}
        </span>
        {copyable && <CopyButton text={rawValue !== undefined ? rawValue : value} />}
      </div>
    </div>
  );
}

export default Checkout;
