import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ 
  id, 
  title, 
  description, 
  date, 
  location, 
  image, 
  status, 
  minPrice, 
  categoryName,
  totalRemaining 
}) => {
  const eventDate = new Date(date);
  const isPast = eventDate < new Date();
  const isCompleted = status === 'completed' || isPast;

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const BACKEND_URL = API_URL.replace('/api', '');

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
  };

  // Format date parts
  const day = eventDate.getDate();
  const month = `Thg ${eventDate.getMonth() + 1}`;
  const year = eventDate.getFullYear();

  // Price formatting
  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    if (typeof price === 'number') {
      return `${price.toLocaleString('vi-VN')}đ`;
    }
    return null;
  };

  return (
    <article className="group relative flex flex-col bg-[#121215] rounded-3xl overflow-hidden border border-white/10 hover:border-[#2dc275]/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(45,194,117,0.12)]">
      {/* Top Image & Visual Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
        <img 
          src={getImageUrl(image)} 
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop';
          }}
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/30" />

        {/* Date Badge (Top Left - Eventbrite / Luma style) */}
        <div className="absolute top-3.5 left-3.5 flex flex-col items-center justify-center min-w-[50px] px-2.5 py-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#2dc275]">
            {month}
          </span>
          <span className="text-xl font-extrabold leading-none tracking-tight">
            {day}
          </span>
        </div>

        {/* Category & Status Badges (Top Right) */}
        <div className="absolute top-3.5 right-3.5 flex flex-col items-end gap-1.5">
          {categoryName && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md border border-white/15 text-zinc-200">
              {categoryName}
            </span>
          )}

          {isPast ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 border border-rose-500/30 text-rose-300">
              Đã diễn ra
            </span>
          ) : isCompleted ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-700/60 border border-white/20 text-zinc-300">
              Hết vé
            </span>
          ) : totalRemaining !== undefined && totalRemaining > 0 && totalRemaining <= 20 ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Chỉ còn {totalRemaining} vé
            </span>
          ) : null}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="text-white font-bold text-lg leading-snug line-clamp-2 group-hover:text-[#2dc275] transition-colors">
            {title}
          </h3>
          
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Metadata info */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 text-zinc-300 text-xs">
            <Calendar className="w-4 h-4 text-[#2dc275] shrink-0" />
            <span className="truncate">
              {eventDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' })} • {eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300 text-xs">
            <MapPin className="w-4 h-4 text-[#2dc275] shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-400 font-medium">Giá từ</span>
            <span className="text-base font-extrabold text-[#2dc275] tracking-tight">
              {formatPrice(minPrice) || 'Xem chi tiết'}
            </span>
          </div>

          {isCompleted ? (
            <button 
              disabled 
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
            >
              Đã kết thúc
            </button>
          ) : (
            <Link 
              to={`/event/${id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2dc275]/15 text-[#2dc275] border border-[#2dc275]/30 hover:bg-[#2dc275] hover:text-black hover:border-transparent transition-all duration-200 group/btn"
            >
              <span>Đặt vé</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
