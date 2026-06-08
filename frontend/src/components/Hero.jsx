import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero-side.png';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=2670&auto=format&fit=crop" 
          alt="Concert Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl space-y-6">
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
              className="text-5xl md:text-7xl font-bold text-white leading-tight"
            >
              FPT Music <br /> <span className="text-[#2dc275]">Festival 2026</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#aaaaaa] text-lg max-w-lg leading-relaxed"
            >
              Trải nghiệm sự kiện âm nhạc được mong đợi nhất trong năm tại Đại học FPT. 
              Hãy cùng hàng ngàn sinh viên tận hưởng một đêm trình diễn bùng nổ và những kỷ niệm khó quên.
            </motion.p>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 py-4"
            >
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-[#2dc275]" />
                <span className="text-sm font-medium">15 thg 8, 2026 • 19:00</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-[#2dc275]" />
                <span className="text-sm font-medium">Đại học FPT Hòa Lạc</span>
              </div>
            </motion.div>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pt-2"
            >
              <button 
                onClick={() => navigate('/event/fpt-music-festival-2026')}
                className="bg-[#2dc275] text-black px-8 py-3 rounded-full font-bold hover:bg-[#2dc275]/90 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Đặt vé ngay
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/event/fpt-music-festival-2026')}
                className="text-white bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all duration-300"
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
            <div className="absolute -inset-4 bg-[#2dc275]/20 blur-3xl rounded-full z-0 animate-pulse"></div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <img 
                src={heroImage} 
                alt="Festival Visual" 
                className="rounded-3xl shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
