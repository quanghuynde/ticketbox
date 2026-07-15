import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/userService';
import { ArrowLeft, Lock, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(token, { oldPassword, newPassword });
      setSuccess('Đổi mật khẩu thành công.');
      showToast('success', 'Đổi mật khẩu thành công.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.message || 'Lỗi đổi mật khẩu.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-black text-white">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="bg-[#27272a]/20 border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {success && <div className="text-green-400 text-sm">{success}</div>}

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2dc275] py-3 text-black font-bold transition-all hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="animate-spin w-4 h-4" /> Đang đổi...</span> : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
