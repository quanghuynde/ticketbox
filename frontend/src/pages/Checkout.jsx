import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Lock, CheckCircle2,
  XCircle, Copy, RefreshCw, Clock
} from 'lucide-react';
import { createPayment, getPaymentStatus } from '../services/paymentService';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#2dc275]/20 transition-colors"
      title="Copy"
    >
      {copied
        ? <CheckCircle2 className="w-4 h-4 text-[#2dc275]" />
        : <Copy className="w-4 h-4 text-[#999999]" />
      }
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const Checkout = () => {
  const navigate   = useNavigate();
  const location   = useLocation();

  // ── mock order data (replace with router state / cart store later) ──────────
  const orderItems = location.state?.items || [
    { name: 'FPT Music Festival 2026', type: 'VIP Ticket', quantity: 2, unitPrice: 500_000 }
  ];
  const processingFee  = 20_000;
  const subtotal       = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalAmount    = subtotal + processingFee;

  // ── state ───────────────────────────────────────────────────────────────────
  const [step,          setStep]          = useState(1); // 1=method, 2=qr, 3=result
  const [paymentMethod, setPaymentMethod] = useState('sepay');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [payData,       setPayData]       = useState(null);
  const [pollStatus,    setPollStatus]    = useState('pending'); // 'pending'|'paid'|'failed'
  const [countdown,     setCountdown]     = useState(600); // 10 min expiry

  const pollRef     = useRef(null);
  const countRef    = useRef(null);

  // ── polling ─────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current);
    clearInterval(countRef.current);
  }, []);

  const startPolling = useCallback((orderCode) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await getPaymentStatus(orderCode);
        if (data.status === 'paid') {
          setPollStatus('paid');
          setStep(3);
          stopPolling();
        } else if (data.status === 'cancelled') {
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

  // ── pay now handler ──────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createPayment(orderItems, totalAmount);
      setPayData(data);
      setStep(2);
      startPolling(data.orderCode);
    } catch (err) {
      setError('Không thể tạo thanh toán. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── countdown display ────────────────────────────────────────────────────────
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[
          { n: 1, label: 'Phương thức' },
          { n: 2, label: 'Thanh toán' },
          { n: 3, label: 'Xác nhận' }
        ].map(({ n, label }, i, arr) => (
          <React.Fragment key={n}>
            <div className={`flex items-center gap-2 ${step >= n ? 'text-[#2dc275]' : 'text-[#999999]'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm
                ${step >= n ? 'border-[#2dc275] bg-[#2dc275]/10' : 'border-[#555]'}`}>{n}</div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            {i < arr.length - 1 && <div className="w-10 h-[1px] bg-[#27272a]" />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Choose payment method ─────────────────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Phương thức thanh toán</h2>
              <p className="text-[#aaaaaa] text-sm">Chọn phương thức thanh toán phù hợp.</p>
            </div>

            <div className="space-y-4">
              {/* SePay option */}
              <div
                onClick={() => setPaymentMethod('sepay')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between
                  ${paymentMethod === 'sepay' ? 'border-[#2dc275] bg-[#2dc275]/5' : 'border-[#27272a] hover:border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                    <span className="text-black font-black italic text-sm">SePay</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Banking Scan (SePay)</h4>
                    <p className="text-xs text-[#999999]">Quét QR xác nhận tức thì</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${paymentMethod === 'sepay' ? 'border-[#2dc275]' : 'border-[#27272a]'}`}>
                  {paymentMethod === 'sepay' && <div className="w-3 h-3 rounded-full bg-[#2dc275]" />}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#27272a]/30 border border-white/5 flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#2dc275] shrink-0 mt-0.5" />
              <p className="text-[#999999] text-xs leading-relaxed">
                Giao dịch được bảo mật bằng SSL. Dữ liệu của bạn được xử lý theo chính sách bảo mật.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-[#27272a] rounded-3xl p-8 border border-white/5 h-fit space-y-6">
            <h3 className="text-xl font-bold">Tổng đơn hàng</h3>

            <div className="space-y-4">
              {orderItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-[#999999]">{item.quantity} x {item.type}</p>
                  </div>
                  <span className="font-bold text-sm">{formatVND(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-[#999999] text-sm">Phí xử lý</span>
                <span className="font-medium text-sm">{formatVND(processingFee)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="font-bold text-lg">Tổng cộng</span>
              <span className="font-bold text-2xl text-[#2dc275]">{formatVND(totalAmount)}</span>
            </div>

            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#2dc275] text-black font-bold text-lg
                hover:scale-[1.02] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)]
                flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Đang xử lý...</>
              ) : (
                <>Thanh toán ngay <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: QR Code ─────────────────────────────────────────────────── */}
      {step === 2 && payData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: QR */}
          <div className="flex flex-col items-center gap-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">Quét mã QR</h2>
              <p className="text-[#aaaaaa] text-sm">Mở app ngân hàng và quét mã để thanh toán</p>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2 text-[#999999] text-sm">
              <Clock className="w-4 h-4" />
              <span>Hết hạn sau <span className="text-white font-mono font-bold">{mm}:{ss}</span></span>
            </div>

            {/* QR Image */}
            <div className="p-4 bg-white rounded-3xl shadow-[0_0_60px_rgba(45,194,117,0.15)]">
              <img
                src={payData.qrUrl}
                alt="VietQR Payment QR"
                className="w-56 h-56 object-contain"
              />
            </div>

            {/* Polling indicator */}
            <div className="flex items-center gap-2 text-[#aaaaaa] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#2dc275] animate-pulse" />
              Đang chờ xác nhận thanh toán...
            </div>
          </div>

          {/* Right: Bank info + amount */}
          <div className="space-y-6">
            <div className="bg-[#27272a] rounded-3xl p-8 border border-white/5 space-y-5">
              <h3 className="text-lg font-bold">Thông tin chuyển khoản</h3>

              {/* Bank */}
              <InfoRow label="Ngân hàng" value={payData.bankInfo.bankId} />
              {/* Account no */}
              <InfoRow label="Số tài khoản" value={payData.bankInfo.accountNo} copyable />
              {/* Name */}
              <InfoRow label="Chủ tài khoản" value={payData.bankInfo.accountName} />
              {/* Amount */}
              <InfoRow label="Số tiền" value={formatVND(payData.amount)} highlight />
              {/* Content */}
              <InfoRow label="Nội dung CK" value={payData.orderCode} copyable important />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              ⚠️ Nhập <strong>đúng nội dung chuyển khoản</strong> để hệ thống tự xác nhận. Sai nội dung có thể gây chậm trễ.
            </div>

            <button
              onClick={() => { stopPolling(); setStep(1); }}
              className="w-full py-3 rounded-2xl border border-[#27272a] text-[#aaaaaa]
                hover:border-white/20 hover:text-white transition-all text-sm font-medium"
            >
              Huỷ & chọn lại
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Result ──────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center gap-8 py-12">
          {pollStatus === 'paid' ? (
            <>
              <div className="w-24 h-24 rounded-full bg-[#2dc275]/10 border-2 border-[#2dc275] flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#2dc275]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-[#2dc275]">Thanh toán thành công!</h2>
                <p className="text-[#aaaaaa] max-w-sm">
                  Vé của bạn đã được xác nhận. Kiểm tra email để nhận vé điện tử.
                </p>
                {payData && (
                  <p className="text-xs text-[#555] font-mono">Mã đơn: {payData.orderCode}</p>
                )}
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-10 py-4 rounded-2xl bg-[#2dc275] text-black font-bold text-lg
                  hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(45,194,117,0.3)]"
              >
                Về trang chủ
              </button>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-red-400">Thanh toán thất bại</h2>
                <p className="text-[#aaaaaa] max-w-sm">
                  {countdown === 0 ? 'Đơn hàng đã hết hạn.' : 'Đã xảy ra lỗi khi xử lý thanh toán.'}
                  &nbsp;Vui lòng thử lại.
                </p>
              </div>
              <button
                onClick={() => { setStep(1); setPayData(null); setCountdown(600); setPollStatus('pending'); setError(''); }}
                className="px-10 py-4 rounded-2xl border-2 border-[#2dc275] text-[#2dc275] font-bold text-lg
                  hover:bg-[#2dc275]/10 transition-all"
              >
                Thử lại
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── small helper component ────────────────────────────────────────────────────
function InfoRow({ label, value, copyable = false, highlight = false, important = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`text-sm shrink-0 ${important ? 'text-amber-300 font-medium' : 'text-[#999999]'}`}>{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm font-bold truncate ${highlight ? 'text-[#2dc275] text-lg' : ''} ${important ? 'text-amber-200' : ''}`}>
          {value}
        </span>
        {copyable && <CopyButton text={value} />}
      </div>
    </div>
  );
}

export default Checkout;
