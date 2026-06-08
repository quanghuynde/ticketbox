import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Share2, Heart, ChevronLeft, Plus, Minus, Ticket } from 'lucide-react';

const mockTickets = [
  { id: 't001', name: 'Vé VIP', price: 500000, desc: 'Chỗ ngồi hàng đầu + thẻ hậu trường + poster phiên bản giới hạn.', available: 15 },
  { id: 't002', name: 'Vé Thường', price: 200000, desc: 'Vé vào cửa phổ thông với tầm nhìn tốt.', available: 120 },
  { id: 't003', name: 'Vé Sinh Viên', price: 100000, desc: 'Yêu cầu thẻ sinh viên hợp lệ tại cửa.', available: 45 }
];

const EventDetails = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({
    't001': 0,
    't002': 0,
    't003': 0
  });

  const updateQty = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const totalPrice = mockTickets.reduce((sum, t) => sum + (t.price * quantities[t.id]), 0);
  const totalQty = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại sự kiện
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Event Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video rounded-3xl overflow-hidden border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop" 
              alt="Event" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">FPT Music Festival 2026</h1>
            <div className="flex flex-wrap gap-6 text-[#aaaaaa]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2dc275]" />
                <span>August 15, 2026 • 19:00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2dc275]" />
                <span>FPT University Hoa Lac</span>
              </div>
            </div>
          </div>

          <div className="bg-[#27272a]/30 rounded-3xl p-8 border border-white/5 space-y-4">
            <h3 className="text-xl font-bold">Về sự kiện này</h3>
            <p className="text-[#aaaaaa] leading-relaxed">
              Lễ hội âm nhạc thường niên dành cho sinh viên đại học với sự góp mặt của nhiều nghệ sĩ nổi tiếng. 
              Trải nghiệm đêm nhạc bùng nổ với hệ thống âm thanh ánh sáng hiện đại nhất. 
              Đừng bỏ lỡ cơ hội cháy hết mình cùng bạn bè trong không gian âm nhạc đẳng cấp.
            </p>
          </div>
        </div>

        {/* Right Column: Ticket Selection */}
        <div className="space-y-6">
          <div className="bg-[#27272a] rounded-3xl p-8 border border-[#2dc275]/20 shadow-[0_0_50px_rgba(45,194,117,0.1)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="text-[#2dc275] w-6 h-6" />
              Chọn loại vé
            </h2>

            <div className="space-y-6">
              {mockTickets.map(ticket => (
                <div key={ticket.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white">{ticket.name}</h4>
                      <p className="text-[10px] text-[#2dc275] font-semibold uppercase">còn {ticket.available} vé</p>
                    </div>
                    <span className="font-bold text-[#2dc275]">{ticket.price.toLocaleString()}đ</span>
                  </div>
                  <p className="text-xs text-[#999999]">{ticket.desc}</p>
                  
                  <div className="flex items-center justify-end gap-4 pt-2">
                    <button 
                      onClick={() => updateQty(ticket.id, -1)}
                      className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center hover:bg-[#2dc275] hover:text-black transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-bold">{quantities[ticket.id]}</span>
                    <button 
                      onClick={() => updateQty(ticket.id, 1)}
                      className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center hover:bg-[#2dc275] hover:text-black transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-[#aaaaaa]">
                <span>Tổng cộng {totalQty} vé</span>
                <span className="text-white font-bold text-xl">{totalPrice.toLocaleString()}đ</span>
              </div>
              <button 
                disabled={totalQty === 0}
                onClick={() => navigate('/checkout')}
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
