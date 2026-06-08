import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, Ticket, Menu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-[#2dc275] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Ticket className="text-black w-5 h-5" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TicketBox</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện, nghệ sĩ, hoặc địa điểm..."
            className="w-full bg-[#27272a] text-white pl-10 pr-4 py-2 rounded-full text-sm border border-transparent focus:border-[#2dc275] focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:flex text-[#aaaaaa] hover:text-[#2dc275] text-sm font-medium transition-colors"
          >
            Bán vé
          </button>
          <div className="w-[1px] h-4 bg-[#27272a] hidden sm:block"></div>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-white bg-[#27272a] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#2dc275] hover:text-black transition-all duration-300"
          >
            <User className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
