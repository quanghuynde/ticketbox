import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, Ticket, Key, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Vui lòng nhập email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể gửi mã OTP.');
      setMessage(data.message);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ OTP và mật khẩu mới.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể đổi mật khẩu.');
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại đăng nhập
        </button>

        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2dc275]/10 rounded-2xl rotate-3 mb-2 border border-[#2dc275]/30">
            <Ticket className="text-[#2dc275] w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quên mật khẩu?</h1>
          <p className="text-[#999999]">Nhập email để nhận mã OTP và đặt lại mật khẩu mới.</p>
        </div>

        <div className="bg-[#27272a]/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-[#2dc275]/10 border border-[#2dc275]/20 text-[#2dc275] text-sm px-4 py-3 rounded-2xl">
              {message}
            </div>
          )}

          {step === 'email' ? (
            <form className="space-y-4" onSubmit={sendOtp}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaaaaa] ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#2dc275] text-black font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={resetPassword}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaaaaa] ml-1">OTP</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaaaaa] ml-1">Mật khẩu mới</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#aaaaaa] ml-1">Xác nhận mật khẩu mới</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#2dc275] text-black font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-[#aaaaaa] text-sm">
          Nhớ mật khẩu rồi? {' '}
          <Link to="/login" className="text-[#2dc275] font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
