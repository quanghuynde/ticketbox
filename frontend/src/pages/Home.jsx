import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', name: 'Tất cả' }]);
  const [activeCategory, setActiveCategory] = useState('all');
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
        setCategories([{ _id: 'all', name: 'Tất cả' }, ...catData]);

        // Fetch events
        const eventRes = await fetch(`${API_URL}/events`);
        const eventData = await eventRes.json();
        setEvents(eventData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Keep search in sync with URL (back/forward)
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearch(p.get('search') || '');
  }, [location.search]);

  const lowerSearch = (search || '').trim().toLowerCase();

  const filteredByCategory = activeCategory === 'all'
    ? events
    : events.filter(e => e.categoryId?._id === activeCategory || e.categoryId === activeCategory);

  const filteredEvents = lowerSearch
    ? filteredByCategory.filter(e => {
        const t = (e.title || '').toLowerCase();
        const d = (e.description || '').toLowerCase();
        const l = (e.location || '').toLowerCase();
        return t.includes(lowerSearch) || d.includes(lowerSearch) || l.includes(lowerSearch);
      })
    : filteredByCategory;

  return (
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold">Khám phá <span className="text-[#2dc275]">Sự kiện</span></h2>
          <div className="w-full md:max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (search || '').trim();
                  if (q) navigate(`/?search=${encodeURIComponent(q)}`);
                  else navigate('/');
                }
              }}
              placeholder="Tìm kiếm sự kiện, tên, địa điểm..."
              className="w-full px-4 py-2 rounded-full bg-[#151516] border border-[#27272a] text-sm outline-none focus:ring-2 focus:ring-[#2dc275]/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat._id 
                    ? 'bg-[#2dc275] text-black shadow-[0_0_20px_rgba(45,194,117,0.3)]' 
                    : 'bg-[#27272a] text-[#aaaaaa] hover:bg-[#27272a]/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 4, 8].map(n => (
              <div key={n} className="h-80 bg-[#27272a] animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#27272a]/20 rounded-3xl border border-white/5">
            <p className="text-[#aaaaaa]">Không có sự kiện nào được tìm thấy trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEvents.map(event => (
              <EventCard 
                key={event._id}
                id={event._id}
                title={event.title}
                description={event.description}
                date={event.eventDate}
                location={event.location}
                image={event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2670&auto=format&fit=crop'}
                status={event.status}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
