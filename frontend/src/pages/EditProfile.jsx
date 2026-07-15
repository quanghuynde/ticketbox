import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/userService';
import { uploadImage } from '../services/uploadService';
import { ArrowLeft, User, Mail, RefreshCw } from 'lucide-react';
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
      showToast('success', 'Cập nhật hồ sơ thành công.');
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
        try { showToast('error', msg); } catch (e) { /* ignore */ }
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
          <h1 className="text-2xl font-bold mb-6">Chỉnh sửa hồ sơ</h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {success && <div className="text-green-400 text-sm">{success}</div>}

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 text-white focus:border-[#2dc275] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#aaaaaa]">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#111111] border border-white/10">
                  {avatar ? (
                    <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#999999]">No image</div>
                  )}
                </div>
                <label className="cursor-pointer rounded-2xl border border-[#2dc275] px-4 py-3 text-sm font-medium text-[#2dc275] hover:bg-[#2dc275]/10 transition-colors">
                  Chọn ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-[#777777]">Ảnh sẽ được lưu trên Cloudinary.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2dc275] py-3 text-black font-bold transition-all hover:scale-[1.01] disabled:opacity-70"
            >
              {loading ? <span className="inline-flex items-center gap-2"><RefreshCw className="animate-spin w-4 h-4" /> Đang lưu...</span> : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
