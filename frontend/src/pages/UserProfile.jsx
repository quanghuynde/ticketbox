import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Award, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');

  // Navigation Guard: Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError('');
        
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Không thể tải thông tin hồ sơ.');
        }
        
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#2dc275] w-10 h-10" />
          <p className="text-sm font-medium text-[#aaaaaa]">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-black text-white">
      <div className="w-full max-w-lg">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] text-sm font-semibold mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>

        {/* Profile Card */}
        <div className="bg-[#27272a]/20 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2dc275]/5 rounded-full blur-3xl group-hover:bg-[#2dc275]/10 transition-all duration-500"></div>

          {error ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-red-500 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-[#2dc275] text-black font-bold px-6 py-2.5 rounded-xl text-xs hover:scale-105 active:scale-95 transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Header: Large Avatar & Name */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#2dc275] to-[#2dc275]/40 rounded-full p-[3px] shadow-[0_0_30px_rgba(45,194,117,0.2)]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-4xl text-white">
                      {profile?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#2dc275] p-1.5 rounded-full border-2 border-black" title="Tài khoản đang hoạt động">
                    <CheckCircle className="w-3.5 h-3.5 text-black" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">{profile?.fullName}</h2>
                  <p className="text-[#999999] text-sm mt-1">{profile?.email}</p>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="border-t border-[#27272a] pt-6 space-y-4">
                
                {/* Full Name field */}
                <div className="flex items-center gap-4 bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
                  <div className="text-[#aaaaaa]">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-[#aaaaaa] tracking-wider">Họ và tên</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{profile?.fullName}</p>
                  </div>
                </div>

                {/* Email Address field */}
                <div className="flex items-center gap-4 bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
                  <div className="text-[#aaaaaa]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-[#aaaaaa] tracking-wider">Địa chỉ Email</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{profile?.email}</p>
                  </div>
                </div>

                {/* Role field */}
                <div className="flex items-center gap-4 bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
                  <div className="text-[#aaaaaa]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-[#aaaaaa] tracking-wider">Vai trò tài khoản</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {profile?.role === 'admin' ? (
                        <span className="flex items-center gap-1 bg-[#2dc275]/10 text-[#2dc275] border border-[#2dc275]/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                          <Award className="w-3.5 h-3.5" />
                          Quản trị viên (Admin)
                        </span>
                      ) : (
                        <span className="bg-[#aaaaaa]/10 text-[#aaaaaa] border border-white/5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
                          Khách hàng (Customer)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Created Date field */}
                <div className="flex items-center gap-4 bg-black/30 border border-white/5 px-4 py-3 rounded-2xl">
                  <div className="text-[#aaaaaa]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-[#aaaaaa] tracking-wider">Ngày tham gia</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
