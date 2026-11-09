import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Ticket, Key, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!fullName || !email || !password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      setOtpSent(true);
      setShowOtpStep(true);
      setCountdown(300);
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!showOtpStep) {
      if (!fullName || !email || !password) {
        setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
        return;
      }
      if (password.length < 8) {
        setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
        return;
      }
      await handleSendOtp();
      return;
    }

    if (!otp) {
      setError('Vui lòng nhập mã OTP xác thực.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(fullName, email, password, otp);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#2dc275] to-[#40e08f] rounded-2xl rotate-3 shadow-[0_0_35px_rgba(45,194,117,0.35)] mb-1">
            <Ticket className="text-black w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {showOtpStep ? 'Xác thực OTP' : 'Tạo tài khoản mới'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {showOtpStep 
              ? 'Nhập mã gồm 6 chữ số được gửi tới email của bạn' 
              : 'Gia nhập cộng đồng săn vé sự kiện đỉnh cao tại TicketBox'}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-zinc-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!showOtpStep ? (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1">Họ và tên</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1">Địa chỉ Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] transition-colors pointer-events-none" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1">Mật khẩu (Tối thiểu 8 ký tự)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] transition-colors pointer-events-none" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Next Step / Send OTP Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2dc275] text-black font-extrabold py-3.5 rounded-2xl mt-4 hover:bg-[#35d883] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-[0_0_25px_rgba(45,194,117,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  <span>{loading ? 'Đang gửi mã OTP...' : 'Tiếp tục nhận mã OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-[#2dc275]/10 border border-[#2dc275]/20 text-xs text-zinc-300 leading-relaxed text-center">
                  Mã OTP đã được gửi tới email <b className="text-white">{email}</b>. Vui lòng nhập mã để hoàn tất đăng ký.
                  {countdown > 0 ? (
                    <div className="mt-2 text-[#2dc275] font-mono font-bold">
                      Hiệu lực còn lại: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[#2dc275] underline font-bold"
                      >
                        Gửi lại mã OTP
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 ml-1">Mã xác thực OTP (6 chữ số)</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      autoFocus
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white font-mono tracking-widest text-base placeholder:text-zinc-600 focus:outline-none focus:border-[#2dc275] focus:ring-2 focus:ring-[#2dc275]/20 transition-all text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => { setShowOtpStep(false); setOtpSent(false); setError(''); setCountdown(0); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3.5 rounded-2xl transition-all text-xs"
                  >
                    Quay lại
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !otp}
                    className="flex-[2] bg-[#2dc275] text-black font-extrabold py-3.5 rounded-2xl hover:bg-[#35d883] transition-all shadow-[0_0_25px_rgba(45,194,117,0.35)] disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Đang xác thực...' : 'Hoàn tất đăng ký'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-zinc-400 text-xs">
          Đã có tài khoản TicketBox? {' '}
          <Link to="/login" id="to-login" className="text-[#2dc275] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
