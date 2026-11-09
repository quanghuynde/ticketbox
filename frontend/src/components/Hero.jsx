import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronRight, ChevronLeft, RefreshCw, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const BACKEND_URL = API_URL.replace('/api', '');

  const getImageUrl = (img, fallback) => {
    if (!img) return fallback;
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/events`);
        const data = await res.json();
        if (data && Array.isArray(data) && data.length > 0) {
          // Take up to 5 upcoming events for featured carousel
          const upcoming = data.filter(e => new Date(e.eventDate) >= new Date());
          setFeaturedEvents(upcoming.length > 0 ? upcoming.slice(0, 5) : data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [API_URL]);

  // Auto advance slide every 7 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredEvents.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] min-h-[460px] flex items-center justify-center bg-black">
        <RefreshCw className="animate-spin text-[#2dc275] w-8 h-8" />
      </div>
    );
  }

  const currentEvent = featuredEvents[currentIndex] || {
    title: "Khám phá Trải nghiệm Sự kiện Đỉnh cao",
    description: "Kết nối cộng đồng âm nhạc, hội thảo công nghệ và workshop hấp dẫn nhất cùng TicketBox với cổng thanh toán bảo mật tức thì.",
    eventDate: new Date().toISOString(),
    location: "Việt Nam",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop"
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredEvents.length);
  };

  return (
    <div className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-black py-12 lg:py-16">
      {/* Dynamic Background Image with Depth Gradients */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentEvent._id || 'default-bg'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={getImageUrl(currentEvent.image, "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop")} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2dc275]/20 text-[#2dc275] border border-[#2dc275]/40 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 text-[#2dc275]" />
                Sự kiện thịnh hành
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-medium border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2dc275]" />
                Vé chính hãng 100%
              </span>
            </div>
            
            {/* Title with smooth key animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentEvent._id || 'title'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  {currentEvent.title}
                </h1>
                
                <p className="text-zinc-300 text-base sm:text-lg max-w-xl leading-relaxed line-clamp-3">
                  {currentEvent.description}
                </p>
              </motion.div>
            </AnimatePresence>
  
            {/* Date & Location Chips */}
            <div className="flex flex-wrap gap-4 sm:gap-6 py-2">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-zinc-200 text-sm">
                <Calendar className="w-4 h-4 text-[#2dc275] shrink-0" />
                <span className="font-medium">
                  {new Date(currentEvent.eventDate).toLocaleDateString('vi-VN', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 text-zinc-200 text-sm">
                <MapPin className="w-4 h-4 text-[#2dc275] shrink-0" />
                <span className="font-medium truncate max-w-[260px]">{currentEvent.location}</span>
              </div>
            </div>
  
            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => currentEvent._id && navigate(`/event/${currentEvent._id}`)}
                className="px-8 py-3.5 rounded-full font-bold text-sm bg-[#2dc275] text-black hover:bg-[#35d883] hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-[0_0_30px_rgba(45,194,117,0.35)]"
              >
                <span>Đặt vé ngay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => currentEvent._id && navigate(`/event/${currentEvent._id}`)}
                className="px-6 py-3.5 rounded-full font-semibold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all duration-300"
              >
                Xem chi tiết & Lịch diễn
              </button>
            </div>
          </div>

          {/* Right Floating Card Preview (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 bg-[#2dc275]/20 blur-3xl rounded-full pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent._id || 'card-preview'}
                  initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-3xl overflow-hidden border border-white/15 bg-zinc-900/90 shadow-2xl p-3"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <img 
                      src={getImageUrl(currentEvent.image, "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop")} 
                      alt={currentEvent.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-[#2dc275] border border-white/10">
                      LIVE TICKET
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-white font-bold text-base line-clamp-1">{currentEvent.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">{currentEvent.location}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-xs text-zinc-400">Trạng thái</span>
                      <span className="text-xs font-bold text-[#2dc275] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#2dc275] animate-ping" />
                        Đang mở bán
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Carousel Controls & Pagination Dots */}
        {featuredEvents.length > 1 && (
          <div className="flex items-center justify-between pt-10 border-t border-white/10 mt-8">
            {/* Pagination indicator dots */}
            <div className="flex items-center gap-2">
              {featuredEvents.map((ev, idx) => (
                <button
                  key={ev._id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx 
                      ? 'w-8 bg-[#2dc275]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Chuyển đến sự kiện ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-[#2dc275] hover:text-black hover:border-transparent transition-all"
                aria-label="Sự kiện trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-zinc-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-[#2dc275] hover:text-black hover:border-transparent transition-all"
                aria-label="Sự kiện tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
