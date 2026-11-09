import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';
import { Bell, CheckCircle2, Trash2, ArrowLeft, RefreshCw, BellOff, Sparkles, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setLoading(false);
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getNotifications(currentToken);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message && err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/login');
        return;
      }
      setError(err.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      loadNotifications();
    }
  }, [user, authLoading]);

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(token, id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      setError(err.message || 'Không thể đánh dấu đã đọc.');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      try {
        await markAsRead(token, n._id);
      } catch {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(token, id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.message || 'Không thể xóa thông báo.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4 text-[#2dc275]" /> 
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#2dc275]/15 border border-[#2dc275]/30 rounded-2xl flex items-center justify-center text-[#2dc275] shadow-[0_0_20px_rgba(45,194,117,0.2)]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Hộp thư thông báo</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#2dc275] text-black">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-xs mt-0.5">Cập nhật trạng thái thanh toán, vé điện tử và nhắc nhở sự kiện</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#2dc275]" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Main List Box */}
      <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
            <RefreshCw className="animate-spin text-[#2dc275] w-8 h-8" />
            <span className="text-xs">Đang tải thông báo...</span>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-xs py-8 text-center">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
              <BellOff className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Không có thông báo nào</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Khi bạn đặt vé hoặc có thông tin mới về sự kiện, thông báo sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`rounded-2xl border p-5 transition-all ${
                  notification.isRead 
                    ? 'border-white/5 bg-black/40 hover:border-white/15' 
                    : 'border-[#2dc275]/40 bg-[#2dc275]/10 shadow-[0_0_20px_rgba(45,194,117,0.08)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2dc275] shrink-0" />
                      )}
                      <h3 className="font-bold text-sm text-white">{notification.title}</h3>
                    </div>
                    <p className="text-zinc-500 text-[11px] font-medium">
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification._id)} 
                        className="px-2.5 py-1 rounded-lg bg-[#2dc275]/15 text-[#2dc275] hover:bg-[#2dc275] hover:text-black text-xs font-semibold transition-all flex items-center gap-1"
                        title="Đánh dấu đã đọc"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã đọc</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification._id)} 
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed pl-4">
                  {notification.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
