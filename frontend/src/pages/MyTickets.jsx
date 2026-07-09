import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Calendar, Clock, MapPin, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999/api';

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, paid, pending

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await fetch(`${API_URL}/orders/user/${user.id || user._id}`);
        if (!response.ok) throw new Error('Failed to fetch user orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate]);

  const filteredOrders = orders.filter(
    (order) => filter === 'all' || order.status === filter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Ticket className="w-8 h-8 text-[#2dc275]" />
            Vé của tôi
          </h1>
          <p className="text-[#999999] mt-2">Quản lý vé tham gia sự kiện của bạn</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {['all', 'paid', 'pending'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === status
                ? 'bg-[#2dc275] text-black shadow-[0_0_15px_rgba(45,194,117,0.3)]'
                : 'bg-[#27272a] text-white hover:bg-[#3f3f46]'
            }`}
          >
            {status === 'all' && 'Tất cả'}
            {status === 'paid' && 'Đã thanh toán'}
            {status === 'pending' && 'Đang xử lý'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-[#aaaaaa] py-12">Đang tải vé...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-[#27272a] rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-[#2dc275]/50 transition-colors">
              <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${
                order.status === 'paid' ? 'bg-[#2dc275]/20 text-[#2dc275]' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {order.status === 'paid' ? 'Thành công' : 'Chờ thanh toán'}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="text-[#999999] text-xs font-mono">Mã đơn: {order.orderCode}</div>
                <h3 className="text-xl font-bold text-white line-clamp-2">
                  {order.orderDetails?.[0]?.eventName || 'Đơn hàng vé sự kiện'}
                </h3>
                
                <div className="space-y-2 text-sm text-[#aaaaaa]">
                  {order.orderDetails?.map((detail, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-[#2dc275]/5 -mx-2 px-2 py-1 rounded">
                      <span>{detail.quantity}x {detail.ticketName || 'Vé'}</span>
                      <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detail.unitPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-medium">Tổng tiền</span>
                  <span className="text-lg font-bold text-[#2dc275]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</span>
                </div>
              </div>

              {/* Decorative side border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2dc275] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#27272a]/30 rounded-3xl border border-white/5">
          <Ticket className="w-16 h-16 text-[#444] mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có vé nào</h2>
          <p className="text-[#aaaaaa] max-w-md mx-auto mb-6">Bạn chưa mua bất kỳ vé nào hoặc không có vé nào ở trạng thái này.</p>
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
