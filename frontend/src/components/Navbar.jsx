import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Ticket, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    // Keep input in sync when URL changes (back/forward)
    const p = new URLSearchParams(location.search);
    setSearch(p.get('search') || '');
  }, [location.search]);

  return (
    <>
      {/* Global top search bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-[#27272a] py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-full max-w-4xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = search.trim();
                  if (q) navigate(`/?search=${encodeURIComponent(q)}`);
                  else navigate('/');
                }
              }}
              type="text"
              placeholder="Tìm kiếm sự kiện, nghệ sĩ, hoặc địa điểm..."
              className="w-full bg-[#27272a] text-white pl-10 pr-4 py-2 rounded-full text-sm border border-transparent focus:border-[#2dc275] focus:outline-none transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <nav className="fixed top-14 left-0 right-0 z-40 bg-[#000000]/80 backdrop-blur-md border-b border-[#27272a]">
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

        {/* Search Bar intentionally hidden here since global search is used */}
        <div className="hidden" />

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:flex text-[#2dc275] hover:text-white text-sm font-semibold transition-colors"
                >
                  Dashboard
                </button>
              )}
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-white bg-[#27272a]/80 px-4 py-2 rounded-full text-sm font-medium border border-white/5 shadow-sm cursor-pointer hover:border-[#2dc275]/50 hover:bg-[#27272a] transition-all"
              >
                <div className="w-5 h-5 bg-[#2dc275] rounded-full flex items-center justify-center text-black font-bold text-[10px]">
                  {user?.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <span>{user?.fullName || 'User'}</span>
              </div>
              <button
                onClick={logout}
                className="text-[#aaaaaa] hover:text-red-500 text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
          <button className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
