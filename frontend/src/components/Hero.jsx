import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero-side.png';

const Hero = () => {
  const navigate = useNavigate();
  const [featuredEvent, setFeaturedEvent] = useState(null);
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
          // Take the first upcoming event as featured
          setFeaturedEvent(data[0]);
        }
      } catch (err) {
        console.error('Error fetching featured event:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="w-full h-[70vh] min-h-[500px] flex items-center justify-center bg-black">
        <RefreshCw className="animate-spin text-[#2dc275] w-10 h-10" />
      </div>
    );
  }

  // Fallback if no events found
  const heroData = featuredEvent || {
    title: "Khám phá Sự kiện Đặc sắc",
    description: "Trải nghiệm những sự kiện âm nhạc, hội thảo và workshop tuyệt vời nhất tại TicketBox. Đặt vé ngay để nhận ưu đãi hấp dẫn.",
    eventDate: new Date().toISOString(),
    location: "Việt Nam",
    image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop"
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={getImageUrl(heroData.image, "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop")} 
          alt="Concert Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-12 items-center">
          <div className="max-w-2xl space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2dc275]/20 text-[#2dc275] border border-[#2dc275]/30 text-xs font-semibold uppercase tracking-wider"
            >
              Sự kiện nổi bật
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight"
            >
              {heroData.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#aaaaaa] text-xl max-w-lg leading-relaxed line-clamp-3"
            >
              {heroData.description}
            </motion.p>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-8 py-4"
            >
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-6 h-6 text-[#2dc275]" />
                <span className="text-base font-medium">
                  {new Date(heroData.eventDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(heroData.eventDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <MapPin className="w-6 h-6 text-[#2dc275]" />
                <span className="text-base font-medium">{heroData.location}</span>
              </div>
            </motion.div>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pt-4"
            >
              <button 
                onClick={() => featuredEvent && navigate(`/event/${featuredEvent._id}`)}
                disabled={!featuredEvent}
                className="bg-[#2dc275] text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-[#2dc275]/90 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(45,194,117,0.3)]"
              >
                Đặt vé ngay
                <ChevronRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => featuredEvent && navigate(`/event/${featuredEvent._id}`)}
                disabled={!featuredEvent}
                className="text-white bg-white/5 backdrop-blur-md px-10 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xem chi tiết
              </button>
            </motion.div>
          </div>

          {/* Right side image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-6 bg-[#2dc275]/10 blur-[80px] rounded-full z-0 animate-pulse"></div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src={getImageUrl(heroData.image, heroImage)} 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop';
                  }}
                  alt={heroData.title} 
                  className="w-full aspect-square object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
