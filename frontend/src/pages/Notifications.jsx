import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';
import { Bell, CheckCircle2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getNotifications(token);
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const updated = await markAsRead(token, id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      setError(err.message || 'Không thể đánh dấu đã đọc.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(token, id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError(err.message || 'Không thể xóa thông báo.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-black text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#2dc275]/10 rounded-full flex items-center justify-center text-[#2dc275]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <p className="text-[#999999]">Quản lý thông báo tài khoản của bạn.</p>
          </div>
        </div>

        <div className="bg-[#27272a]/20 border border-white/5 rounded-3xl p-6 shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="animate-spin text-[#2dc275] w-8 h-8" />
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm py-10 text-center">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 text-[#999999]">Không có thông báo nào.</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification._id} className={`rounded-3xl border p-5 ${notification.isRead ? 'border-[#27272a] bg-[#090909]' : 'border-[#2dc275]/30 bg-[#2dc275]/5'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="font-semibold text-white">{notification.title}</h2>
                      <p className="text-[#999999] text-sm mt-1">{new Date(notification.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button onClick={() => handleMarkAsRead(notification._id)} className="text-[#2dc275] hover:text-white text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> Đã đọc
                        </button>
                      )}
                      <button onClick={() => handleDelete(notification._id)} className="text-red-500 hover:text-red-400 text-sm font-semibold">
                        <Trash2 className="w-4 h-4 inline-block mr-1" /> Xóa
                      </button>
                    </div>
                  </div>
                  <p className="text-[#cccccc] text-sm leading-relaxed">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
