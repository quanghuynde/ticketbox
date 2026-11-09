import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import { uploadImage } from '../services/uploadService';
import { ArrowLeft, User, Mail, RefreshCw, Camera, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('token');
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email) {
      setError('Họ tên và email là bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      let avatarUrl = avatar;

      if (avatarFile) {
        avatarUrl = await uploadImage(token, avatarFile);
      }

      const updated = await updateProfile(token, { fullName, email, avatar: avatarUrl });
      setSuccess('Cập nhật hồ sơ thành công.');
      localStorage.setItem('user', JSON.stringify(updated));
      updateUser(updated);
      setAvatarFile(null);
      if (showToast) showToast('success', 'Cập nhật hồ sơ thành công.');
      navigate('/profile');
    } catch (err) {
      let msg = 'Lỗi cập nhật hồ sơ.';
      try {
        if (err && err.data) {
          const d = err.data;
          if (d.errors) {
            if (Array.isArray(d.errors)) {
              msg = d.errors.map(x => x.msg || x).join('; ');
            } else if (typeof d.errors === 'object') {
              msg = Object.values(d.errors).flat().map(x => (x.msg || x)).join('; ');
            }
          } else if (d.message) {
            msg = d.message;
          } else {
            msg = JSON.stringify(d);
          }
        } else if (err && err.message) {
          msg = err.message;
        }
      } catch (parseErr) {
        msg = err.message || msg;
      }

      setError(msg);
      try { if (showToast) showToast('error', msg); } catch (e) { /* ignore */ }
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

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#2dc275]/15 border border-[#2dc275]/30 flex items-center justify-center text-[#2dc275]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chỉnh sửa hồ sơ</h1>
              <p className="text-xs text-zinc-400">Thay đổi tên, email và ảnh đại diện của bạn</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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

            {/* Avatar Uploader Preview */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-black/60 border-2 border-[#2dc275]/40 group-hover:border-[#2dc275] shadow-lg">
                  {avatar ? (
                    <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xl font-bold">
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] text-zinc-200 font-semibold mt-1">Đổi ảnh</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-[11px] text-zinc-500">Chạm vào ảnh đại diện để chọn ảnh mới từ máy tính</p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">Họ và tên</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 ml-1">Địa chỉ Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#2dc275] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2dc275] py-3.5 text-black font-extrabold text-sm transition-all hover:bg-[#35d883] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(45,194,117,0.3)] cursor-pointer mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <RefreshCw className="animate-spin w-4 h-4" />
                  Đang lưu thay đổi...
                </span>
              ) : (
                'Lưu thay đổi hồ sơ'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
