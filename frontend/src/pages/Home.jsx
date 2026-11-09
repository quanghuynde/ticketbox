import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, CalendarDays, X, AlertCircle } from 'lucide-react';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', name: 'Tất cả thể loại' }]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'upcoming' | 'this_month'
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [search, setSearch] = useState(params.get('search') || '');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await fetch(`${API_URL}/categories`);
        const catData = await catRes.json();
        setCategories([{ _id: 'all', name: 'Tất cả thể loại' }, ...(Array.isArray(catData) ? catData : [])]);

        // Fetch events
        const eventRes = await fetch(`${API_URL}/events`);
        const eventData = await eventRes.json();
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // Keep search in sync with URL (back/forward)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearch(p.get('search') || '');
  }, [location.search]);

  const lowerSearch = (search || '').trim().toLowerCase();

  // Category filter
  const filteredByCategory = activeCategory === 'all'
    ? events
    : events.filter(e => {
        const catId = typeof e.categoryId === 'object' ? e.categoryId?._id : e.categoryId;
        return catId === activeCategory;
      });

  // Time filter
  const filteredByTime = filteredByCategory.filter(e => {
    if (timeFilter === 'all') return true;
    const evDate = new Date(e.eventDate);
    const now = new Date();
    if (timeFilter === 'upcoming') {
      return evDate >= now;
    }
    if (timeFilter === 'this_month') {
      return evDate.getMonth() === now.getMonth() && evDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Search filter
  const finalEvents = lowerSearch
    ? filteredByTime.filter(e => {
        const t = (e.title || '').toLowerCase();
        const d = (e.description || '').toLowerCase();
        const l = (e.location || '').toLowerCase();
        return t.includes(lowerSearch) || d.includes(lowerSearch) || l.includes(lowerSearch);
      })
    : filteredByTime;

  const handleClearFilters = () => {
    setActiveCategory('all');
    setTimeFilter('all');
    setSearch('');
    navigate('/');
  };

  return (
    <div className="space-y-12">
      {/* Hero Showcase Section */}
      <Hero />

      {/* Main Events Discovery Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header & Search / Filters bar */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2dc275] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trải nghiệm không giới hạn</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Khám phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dc275] to-[#55f0a0]">Sự kiện</span>
              </h2>
            </div>

            {/* Results count indicator */}
            <div className="text-xs text-zinc-400 font-medium">
              Đang hiển thị <span className="text-white font-bold">{finalEvents.length}</span> sự kiện
              {search && <span> cho từ khóa "<span className="text-[#2dc275] font-semibold">{search}</span>"</span>}
            </div>
          </div>

          {/* Filter Bar: Category pills & Time filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-2">
            
            {/* Category Pills (Horizontal scrollable on mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map(cat => {
                const isActive = activeCategory === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                      isActive 
                        ? 'bg-[#2dc275] text-black border-[#2dc275] shadow-[0_0_20px_rgba(45,194,117,0.35)]' 
                        : 'bg-zinc-900/90 text-zinc-300 border-white/10 hover:border-white/25 hover:bg-zinc-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Time Filter Segmented Control */}
            <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-2xl border border-white/10 self-start lg:self-auto shrink-0">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeFilter === 'all' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTimeFilter('upcoming')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeFilter === 'upcoming' 
                    ? 'bg-zinc-800 text-[#2dc275] shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sắp diễn ra
              </button>
              <button
                onClick={() => setTimeFilter('this_month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeFilter === 'this_month' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tháng này
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Loading / Empty / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div 
                key={n} 
                className="bg-[#121215] border border-white/5 rounded-3xl p-4 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-[16/10] bg-zinc-800/80 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="h-5 bg-zinc-800 rounded w-20" />
                  <div className="h-8 bg-zinc-800 rounded-xl w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : finalEvents.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#121215] rounded-3xl border border-white/10 max-w-2xl mx-auto space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#2dc275]/10 border border-[#2dc275]/20 flex items-center justify-center mx-auto text-[#2dc275]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Không tìm thấy sự kiện phù hợp</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Không có sự kiện nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn. Thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-[#2dc275] hover:text-black text-white text-xs font-bold transition-all"
              >
                <X className="w-4 h-4" />
                <span>Xóa tất cả bộ lọc</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {finalEvents.map(event => (
              <EventCard 
                key={event._id}
                id={event._id}
                title={event.title}
                description={event.description}
                date={event.eventDate}
                location={event.location}
                image={event.image}
                status={event.status}
                minPrice={event.minPrice}
                categoryName={event.categoryId?.name}
                totalRemaining={event.totalRemaining}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
