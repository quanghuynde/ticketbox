import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ id, title, description, date, location, image, status }) => {
  const isCompleted = status === 'completed';

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const BACKEND_URL = API_URL.replace('/api', '');

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
  };

  return (
    <div className="group bg-[#27272a] rounded-3xl overflow-hidden border border-white/5 hover:border-[#2dc275]/50 transition-all duration-500 hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getImageUrl(image)} 
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop';
          }}
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isCompleted ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-[#2dc275] text-black'
        }`}>
          {isCompleted ? 'Hết vé' : 'Sắp diễn ra'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-white font-bold text-lg line-clamp-1 group-hover:text-[#2dc275] transition-colors">
            {title}
          </h3>
          <p className="text-[#999999] text-xs line-clamp-2 leading-relaxed h-8">
            {description}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-[#aaaaaa]">
            <Calendar className="w-4 h-4 text-[#2dc275]" />
            <span className="text-xs">{new Date(date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-[#aaaaaa]">
            <MapPin className="w-4 h-4 text-[#2dc275]" />
            <span className="text-xs line-clamp-1">{location}</span>
          </div>
        </div>

        {isCompleted ? (
          <button disabled className="w-full py-3 rounded-xl font-bold text-sm bg-transparent border border-white/10 text-[#aaaaaa] cursor-not-allowed">
            Đã kết thúc
          </button>
        ) : (
          <Link 
            to={`/event/${id}`}
            className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-[#2dc275] hover:text-black transition-all duration-300 text-center block"
          >
            Đặt ngay
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventCard;
