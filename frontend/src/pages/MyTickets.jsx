import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api';

const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const STATUS_META = {
  paid: { label: 'Đã thanh toán', className: 'bg-[#2dc275]/20 text-[#2dc275]' },
  pending: { label: 'Chờ thanh toán', className: 'bg-yellow-500/20 text-yellow-500' },
  cancelled: { label: 'Đã huỷ', className: 'bg-red-500/20 text-red-400' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-blue-500/20 text-blue-400' }
};

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'pending', label: 'Đang xử lý' },
  { key: 'cancelled', label: 'Đã huỷ' }
];

const MyTickets = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/orders/user/${user.id || user._id}`);
        if (!response.ok) throw new Error('Failed to fetch user orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  const getOrderTitle = (order) => {
    const firstEvent = order.orderDetails?.find((d) => d.eventName)?.eventName;
    if (firstEvent) return firstEvent;
    return `Đơn hàng (${order.orderDetails?.length || 0} loại vé)`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket className="w-8 h-8 text-[#2dc275]" />
            Đơn hàng của tôi
          </h1>
          <p className="text-[#999999] mt-2">Quản lý vé và đơn hàng sự kiện của bạn</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === key
                ? 'bg-[#2dc275] text-black shadow-[0_0_15px_rgba(45,194,117,0.3)]'
                : 'bg-[#27272a] text-white hover:bg-[#3f3f46]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-[#aaaaaa] py-12">Đang tải đơn hàng...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.pending;
            const eventDate = order.orderDetails?.find((d) => d.eventDate)?.eventDate;
            const location = order.orderDetails?.find((d) => d.location)?.location;

            return (
              <div
                key={order._id}
                className="bg-[#27272a] rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-[#2dc275]/50 transition-colors"
              >
                <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                  {status.label}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="text-[#999999] text-xs font-mono">Mã đơn: {order.orderCode}</div>
                  <h3 className="text-xl font-bold text-white line-clamp-2 pr-20">
                    {getOrderTitle(order)}
                  </h3>

                  {(eventDate || location) && (
                    <div className="space-y-1.5 text-xs text-[#aaaaaa]">
                      {formatDate(eventDate) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#2dc275]" />
                          <span>{formatDate(eventDate)}</span>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#2dc275]" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-[#aaaaaa]">
                    {order.orderDetails?.map((detail, idx) => (
                      <div
                        key={detail._id || idx}
                        className="flex justify-between items-center text-xs bg-[#2dc275]/5 -mx-2 px-2 py-1.5 rounded"
                      >
                        <span>
                          {detail.quantity}x {detail.ticketName || 'Vé'}
                        </span>
                        <span className="font-medium">{formatVND(detail.lineTotal ?? detail.unitPrice * detail.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm font-medium">Tổng tiền</span>
                    <span className="text-lg font-bold text-[#2dc275]">{formatVND(order.totalPrice)}</span>
                  </div>

                  {order.createdAt && (
                    <div className="text-[10px] text-[#666]">
                      Đặt lúc: {formatDate(order.createdAt)}
                    </div>
                  )}
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2dc275] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#27272a]/30 rounded-3xl border border-white/5">
          <Ticket className="w-16 h-16 text-[#444] mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-[#aaaaaa] max-w-md mx-auto mb-6">
            Bạn chưa có đơn hàng nào hoặc không có đơn nào ở trạng thái này.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl bg-[#2dc275] text-black font-semibold hover:scale-105 transition-transform"
          >
            Khám phá sự kiện ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
