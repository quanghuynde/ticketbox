import React, { useState } from 'react';
import Hero from '../components/Hero';
import EventCard from '../components/EventCard';

// Mock data based on events.json
const mockEvents = [
  {
    "_id": "e001",
    "title": "FPT Music Festival 2026",
    "description": "Lễ hội âm nhạc thường niên dành cho sinh viên đại học với sự góp mặt của nhiều nghệ sĩ nổi tiếng.",
    "eventDate": "2026-08-15T19:00:00Z",
    "location": "FPT University Hoa Lac",
    "image": "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2574&auto=format&fit=crop",
    "categoryId": "c001",
    "status": "upcoming"
  },
  {
    "_id": "e002",
    "title": "AI Career Workshop",
    "description": "Định hướng nghề nghiệp và cập nhật những xu hướng trí tuệ nhân tạo mới nhất trong năm 2026.",
    "eventDate": "2026-09-10T08:00:00Z",
    "location": "Hall A - Innovation Hub",
    "image": "https://images.unsplash.com/photo-1591115765373-520b7a21769b?q=80&w=2670&auto=format&fit=crop",
    "categoryId": "c002",
    "status": "upcoming"
  },
  {
    "_id": "e003",
    "title": "Startup Innovation Seminar",
    "description": "Chia sẻ kinh nghiệm khởi nghiệp thực chiến từ các founders thành công tại Việt Nam.",
    "eventDate": "2026-07-20T14:00:00Z",
    "location": "Convention Center",
    "image": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2670&auto=format&fit=crop",
    "categoryId": "c003",
    "status": "completed"
  }
];

const categories = [
  { id: 'all', name: 'Tất cả' },
  { id: 'c001', name: 'Hòa nhạc' },
  { id: 'c002', name: 'Hội thảo' },
  { id: 'c003', name: 'Seminar' }
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredEvents = activeCategory === 'all' 
    ? mockEvents 
    : mockEvents.filter(e => e.categoryId === activeCategory);

  return (
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold">Khám phá <span className="text-[#2dc275]">Sự kiện</span></h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-[#2dc275] text-black shadow-[0_0_20px_rgba(45,194,117,0.3)]' 
                    : 'bg-[#27272a] text-[#aaaaaa] hover:bg-[#27272a]/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredEvents.map(event => (
            <EventCard 
              key={event._id}
              title={event.title}
              description={event.description}
              date={event.eventDate}
              location={event.location}
              image={event.image}
              status={event.status}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
