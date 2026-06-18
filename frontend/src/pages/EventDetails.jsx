import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Share2, Heart, ChevronLeft, Plus, Minus, Ticket, RefreshCw } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const BACKEND_URL = API_URL.replace('/api', '');

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không tìm thấy sự kiện');
        
        setEventData(data);
        
        // Initialize quantities
        const initQtys = {};
        data.tickets.forEach(t => {
          initQtys[t._id] = 0;
        });
        setQuantities(initQtys);
      } catch (err) {
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id]);

  const updateQty = (ticketId, delta, available) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > available) return prev; // Don't exceed available stock
      return { ...prev, [ticketId]: next };
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-[#aaaaaa]">
        <RefreshCw className="animate-spin text-[#2dc275] w-10 h-10" />
        <p>Đang tải thông tin sự kiện...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy sự kiện</h2>
        <button onClick={() => navigate('/')} className="text-[#2dc275] hover:underline">Quay lại trang chủ</button>
      </div>
    );
  }

  const tickets = eventData.tickets || [];
  const totalPrice = tickets.reduce((sum, t) => sum + (t.price * (quantities[t._id] || 0)), 0);
  const totalQty = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại sự kiện
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Event Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-[#27272a]/20">
            <img 
              src={getImageUrl(eventData.image)} 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
              }}
              alt={eventData.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">{eventData.title}</h1>
            <div className="flex flex-wrap gap-6 text-[#aaaaaa]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2dc275]" />
                <span>{new Date(eventData.eventDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(eventData.eventDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2dc275]" />
                <span>{eventData.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#27272a]/30 rounded-3xl p-8 border border-white/5 space-y-4">
            <h3 className="text-xl font-bold">Về sự kiện này</h3>
            <p className="text-[#aaaaaa] leading-relaxed whitespace-pre-wrap">
              {eventData.description}
            </p>
          </div>

          {/* Review Section */}
          <ReviewSection eventId={id} />
        </div>

        {/* Right Column: Ticket Selection */}
        <div className="space-y-6">
          <div className="bg-[#27272a] rounded-3xl p-8 border border-[#2dc275]/20 shadow-[0_0_50px_rgba(45,194,117,0.1)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="text-[#2dc275] w-6 h-6" />
              Chọn loại vé
            </h2>

            <div className="space-y-6">
              {tickets.length === 0 ? (
                <p className="text-[#999999] text-center py-4 italic">Hiện chưa có loại vé nào cho sự kiện này.</p>
              ) : (
                tickets.map(ticket => {
                  const available = ticket.quantity - (ticket.soldQuantity || 0);
                  return (
                    <div key={ticket._id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{ticket.ticketName}</h4>
                          <p className={`text-[10px] font-semibold uppercase ${available > 0 ? 'text-[#2dc275]' : 'text-red-500'}`}>
                            {available > 0 ? `còn ${available} vé` : 'Hết vé'}
                          </p>
                        </div>
                        <span className="font-bold text-[#2dc275]">{ticket.price.toLocaleString()}đ</span>
                      </div>
                      
                      <div className="flex items-center justify-end gap-4 pt-2">
                        <button 
                          onClick={() => updateQty(ticket._id, -1, available)}
                          disabled={available === 0}
                          className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center hover:bg-[#2dc275] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-4 text-center font-bold">{quantities[ticket._id] || 0}</span>
                        <button 
                          onClick={() => updateQty(ticket._id, 1, available)}
                          disabled={available === 0}
                          className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center hover:bg-[#2dc275] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[#aaaaaa]">
                <span>Tổng cộng {totalQty} vé</span>
                <span className="text-white font-bold text-xl">{totalPrice.toLocaleString()}đ</span>
              </div>
              <button 
                disabled={totalQty === 0}
                onClick={() => {
                  const items = tickets
                    .filter(t => (quantities[t._id] || 0) > 0)
                    .map(t => ({
                      name: eventData.title,
                      type: t.ticketName,
                      quantity: quantities[t._id],
                      unitPrice: t.price
                    }));
                  navigate('/checkout', { state: { items, totalAmount: totalPrice } });
                }}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  totalQty > 0 
                  ? 'bg-[#2dc275] text-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(45,194,117,0.3)]' 
                  : 'bg-[#27272a] text-[#aaaaaa] cursor-not-allowed'
                }`}
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-4 rounded-2xl border border-white/10 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-all">
              <Share2 className="w-5 h-5" />
              Chia sẻ
            </button>
            <button className="flex-1 py-4 rounded-2xl border border-white/10 flex items-center justify-center gap-2 text-white hover:bg-white/5 transition-all">
              <Heart className="w-5 h-5" />
              Yêu thích
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
