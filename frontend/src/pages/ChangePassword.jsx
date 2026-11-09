import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/userService';
import { ArrowLeft, Lock, RefreshCw, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(token, { oldPassword, newPassword });
      setSuccess('Đổi mật khẩu thành công!');
      if (showToast) showToast('success', 'Đổi mật khẩu thành công.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.message || 'Lỗi đổi mật khẩu.';
      setError(msg);
      if (showToast) showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-black text-white">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 text-[#2dc275]" /> 
          <span>Quay lại hồ sơ</span>
        </button>

        {/* Change Password Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Đổi mật khẩu</h1>
              <p className="text-xs text-zinc-400">Cập nhật mật khẩu để bảo mật tài khoản tốt hơn</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3.5 rounded-2xl bg-[#2dc275]/10 border border-[#2dc275]/30 text-[#2dc275] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">Mật khẩu hiện tại</label>
              <div className="relative group">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 pr-11 text-white text-sm focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">Mật khẩu mới (Tối thiểu 8 ký tự)</label>
              <div className="relative group">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                  minLength={8}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 pr-11 text-white text-sm focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">Xác nhận mật khẩu mới</label>
              <div className="relative group">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 pr-11 text-white text-sm focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2dc275] py-3.5 text-black font-extrabold text-sm transition-all hover:bg-[#35d883] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(45,194,117,0.3)] mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="animate-spin w-4 h-4" />
                  Đang cập nhật...
                </span>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
