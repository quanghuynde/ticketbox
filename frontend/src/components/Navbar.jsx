import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, User, Ticket, Menu, X, Bell, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setSearch(p.get('search') || '');
  }, [location.search]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/?search=${encodeURIComponent(q)}`);
    else navigate('/');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasScrolled 
          ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40' 
          : 'bg-[#09090b]/75 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link 
          to="/"
          className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2dc275] rounded-xl p-1"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-[#2dc275] to-[#40e08f] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(45,194,117,0.35)] group-hover:scale-105 transition-transform duration-300">
            <Ticket className="text-black w-5 h-5 fill-black stroke-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-xl tracking-tight group-hover:text-[#2dc275] transition-colors leading-none">
              TicketBox
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">
              Live Experiences
            </span>
          </div>
        </Link>

        {/* Global Smart Search Bar (Desktop & Tablet) */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl mx-4 relative items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
              className="w-full bg-zinc-900/90 text-white pl-10 pr-10 py-2.5 rounded-full text-sm border border-white/10 focus:border-[#2dc275] focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#2dc275]/20 placeholder-zinc-400 transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); navigate('/'); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs p-1 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2dc275] bg-[#2dc275]/10 border border-[#2dc275]/25 hover:bg-[#2dc275]/20 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              <Link
                to="/my-tickets"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/5 transition-all"
              >
                <Ticket className="w-4 h-4 text-[#2dc275]" />
                <span>Vé của tôi</span>
              </Link>

              <Link
                to="/notifications"
                className="relative p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2dc275] rounded-full ring-2 ring-black" />
              </Link>

              <div className="h-5 w-[1px] bg-white/10 mx-1" />

              {/* User Profile Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#2dc275]/40 hover:bg-zinc-800/80 transition-all group"
              >
                <div className="w-7 h-7 bg-[#2dc275] rounded-full flex items-center justify-center text-black font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-white max-w-[120px] truncate">
                  {user?.fullName || 'Tài khoản'}
                </span>
              </Link>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                title="Đăng xuất"
                className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors"
              >
                Đăng ký sự kiện
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#2dc275] text-black hover:bg-[#35d883] hover:shadow-[0_0_20px_rgba(45,194,117,0.4)] transition-all duration-300"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to="/my-tickets"
              className="p-2 rounded-full text-zinc-200 hover:bg-white/10"
              title="Vé của tôi"
            >
              <Ticket className="w-5 h-5 text-[#2dc275]" />
            </Link>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white hover:text-[#2dc275] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e0e11] border-b border-white/10 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sự kiện, nghệ sĩ..."
              className="w-full bg-zinc-900 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm border border-white/10 focus:border-[#2dc275] focus:outline-none"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="space-y-1 pt-2">
            <Link
              to="/"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-200 text-sm font-medium"
            >
              <span>Khám phá sự kiện</span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </Link>

            {user ? (
              <>
                <Link
                  to="/my-tickets"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-200 text-sm font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <Ticket className="w-4 h-4 text-[#2dc275]" />
                    Vé của tôi
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>

                <Link
                  to="/notifications"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-200 text-sm font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#2dc275]" />
                    Thông báo
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-zinc-200 text-sm font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#2dc275]" />
                    Tài khoản cá nhân ({user.fullName})
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#2dc275]/10 border border-[#2dc275]/20 text-[#2dc275] text-sm font-medium"
                  >
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      Trang Quản trị (Admin)
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl hover:bg-rose-500/10 text-rose-400 text-sm font-medium mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-3 rounded-xl bg-[#2dc275] text-black font-semibold text-sm"
                >
                  Đăng nhập / Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal rendered directly into body via React Portal */}
      {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowLogoutConfirm(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#141418] border border-white/15 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Xác nhận đăng xuất</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản TicketBox không?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate('/');
                }}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
