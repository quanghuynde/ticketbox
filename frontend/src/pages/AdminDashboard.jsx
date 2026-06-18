import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, DollarSign, Ticket, Calendar, TrendingUp, 
  ShieldAlert, RefreshCw, Layers, Minus, Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation Guard: Redirect if not Admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Tab State: 'overview' | 'events' | 'tickets' | 'categories'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [ticketsData, setTicketsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  // Forms states
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoadingData(true);
      setError('');

      if (activeTab === 'overview') {
        const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsJson = await statsRes.json();
        if (!statsRes.ok) throw new Error(statsJson.message || 'Failed to load stats.');
        setStats(statsJson);
      } else if (activeTab === 'events') {
        await fetchEvents();
        await fetchCategories();
      } else if (activeTab === 'tickets') {
        await fetchTickets();
        await fetchEvents();
      } else if (activeTab === 'categories') {
        await fetchCategories();
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi tải dữ liệu admin.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEventsData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTicketsData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCategoriesData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, activeTab]);

  // Event CRUD
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = Object.fromEntries(formData);

    // If an image file is selected, upload it first
    const imageFile = formData.get('imageFile');
    if (imageFile && imageFile.name) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.message || 'Lỗi upload ảnh');
        eventData.image = uploadJson.url;
      } catch (err) {
        alert('Lỗi upload ảnh: ' + err.message);
        return;
      }
    }
    
    // Combine Date and Time
    if (eventData.date && eventData.time) {
      eventData.eventDate = `${eventData.date}T${eventData.time}`;
    }

    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `${API_URL}/events/${editingEvent._id}` : `${API_URL}/events`;
      
      // Remove temporary fields
      delete eventData.date;
      delete eventData.time;
      delete eventData.imageFile;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(eventData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi lưu sự kiện');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? (Sẽ xóa cả vé liên quan)')) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi xóa sự kiện');
      }
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  // Ticket CRUD
  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const ticketData = Object.fromEntries(new FormData(e.target));
    try {
      const method = editingTicket ? 'PUT' : 'POST';
      const url = editingTicket ? `${API_URL}/tickets/${editingTicket._id}` : `${API_URL}/tickets`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(ticketData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi lưu vé');
      }
      setShowTicketModal(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vé này?')) return;
    try {
      const res = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi xóa vé');
      }
      fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const catData = Object.fromEntries(new FormData(e.target));
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `${API_URL}/categories/${editingCategory._id}` : `${API_URL}/categories`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(catData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi lưu danh mục');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lỗi xóa danh mục');
      }
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  // Format currency
  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#2dc275] w-10 h-10" />
          <p className="text-sm font-medium text-[#aaaaaa]">Đang xác thực quyền Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#27272a] pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-[#2dc275] bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-[#999999] text-sm mt-1">
              Quản lý sự kiện, bán vé và theo dõi doanh thu tổng quan.
            </p>
          </div>
          
          {/* Action buttons/Quick refresh */}
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 bg-[#27272a]/50 hover:bg-[#27272a] border border-white/5 px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wider transition-all duration-300 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              TẢI LẠI DỮ LIỆU
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#27272a] gap-6 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Tổng quan (Overview)
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'events' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Quản lý Sự kiện
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'tickets' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Quản lý Vé
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'categories' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Danh mục
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-[#27272a]/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-[#2dc275]/30 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2dc275]/5 rounded-full blur-3xl group-hover:bg-[#2dc275]/10 transition-all duration-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Doanh thu tổng</span>
                  <div className="w-8 h-8 bg-[#2dc275]/10 rounded-xl flex items-center justify-center text-[#2dc275]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {loadingData ? '...' : formatVND(stats?.summary?.totalRevenue || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#2dc275]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Dựa trên các hóa đơn đã thanh toán</span>
                  </div>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-[#27272a]/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Tổng người dùng</span>
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {loadingData ? '...' : stats?.summary?.totalUsers || 0}
                  </div>
                  <div className="text-[10px] text-[#999999]">
                    <span>Hoạt động: {stats?.summary?.activeUsers || 0} tài khoản</span>
                  </div>
                </div>
              </div>

              {/* Tickets Sold */}
              <div className="bg-[#27272a]/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-[#2dc275]/30 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2dc275]/5 rounded-full blur-3xl group-hover:bg-[#2dc275]/10 transition-all duration-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Vé đã bán ra</span>
                  <div className="w-8 h-8 bg-[#2dc275]/10 rounded-xl flex items-center justify-center text-[#2dc275]">
                    <Ticket className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {loadingData ? '...' : stats?.summary?.totalTicketsSold || 0}
                  </div>
                  <div className="text-[10px] text-[#999999]">
                    <span>Số lượng vé thực tế trên hệ thống</span>
                  </div>
                </div>
              </div>

              {/* Active Events */}
              <div className="bg-[#27272a]/20 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#aaaaaa] uppercase tracking-wider">Số sự kiện</span>
                  <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {loadingData ? '...' : stats?.events?.total || 0}
                  </div>
                  <div className="text-[10px] text-[#999999]">
                    <span>Sắp diễn ra: {stats?.events?.upcoming || 0} | Đã kết thúc: {stats?.events?.completed || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Grids: Recent Orders & Top Selling Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Orders Table */}
              <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold tracking-tight">Giao dịch mua vé gần đây</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#27272a] text-[#aaaaaa] text-xs uppercase font-semibold">
                        <th className="pb-3 pl-2">Mã Đơn</th>
                        <th className="pb-3">Khách hàng</th>
                        <th className="pb-3">Tổng Tiền</th>
                        <th className="pb-3 pr-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]/40">
                      {loadingData ? (
                        [1, 2, 3].map((n) => (
                          <tr key={n} className="animate-pulse">
                            <td className="py-4 pl-2"><div className="h-4 bg-[#27272a] rounded w-16"></div></td>
                            <td className="py-4"><div className="h-4 bg-[#27272a] rounded w-24"></div></td>
                            <td className="py-4"><div className="h-4 bg-[#27272a] rounded w-20"></div></td>
                            <td className="py-4 pr-2"><div className="h-6 bg-[#27272a] rounded w-12"></div></td>
                          </tr>
                        ))
                      ) : stats?.recentOrders?.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-[#999999]">Chưa có đơn hàng nào được tạo.</td>
                        </tr>
                      ) : (
                        stats?.recentOrders?.map((order) => (
                          <tr key={order._id} className="hover:bg-[#27272a]/20 transition-all">
                            <td className="py-4 pl-2 font-mono font-bold text-white">{order.orderCode}</td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">{order.userId?.fullName || 'Khách vãng lai'}</span>
                                <span className="text-[10px] text-[#999999]">{order.userId?.email || ''}</span>
                              </div>
                            </td>
                            <td className="py-4 font-semibold text-white">{formatVND(order.totalPrice)}</td>
                            <td className="py-4 pr-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'paid' ? 'bg-[#2dc275]/10 text-[#2dc275] border border-[#2dc275]/20' :
                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Selling Events Panel */}
              <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold tracking-tight">Sự kiện bán chạy nhất</h3>
                
                <div className="space-y-4">
                  {loadingData ? (
                    [1, 2, 3].map((n) => (
                      <div key={n} className="animate-pulse flex gap-3 items-center">
                        <div className="w-10 h-10 bg-[#27272a] rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-[#27272a] rounded w-3/4"></div>
                          <div className="h-3 bg-[#27272a] rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : stats?.topEvents?.length === 0 ? (
                    <div className="text-center py-6 text-[#999999] text-sm">Chưa có vé nào được bán ra.</div>
                  ) : (
                    stats?.topEvents?.map((evt, idx) => (
                      <div key={evt._id || idx} className="flex gap-4 items-center group hover:bg-white/5 p-2 rounded-2xl transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center text-xs font-bold font-mono text-[#2dc275] border border-white/5">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{evt.title}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-[#999999]">Đã bán: <b className="text-white">{evt.ticketsSold}</b> vé</span>
                            <span className="text-xs text-[#2dc275] font-semibold">{formatVND(evt.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Distribution Graph Simulation (Category Breakdown) */}
            <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2dc275]" />
                Phân bố Sự kiện theo Danh mục
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {loadingData ? (
                  <div className="col-span-3 text-center py-6 text-[#999999]">Đang tải dữ liệu phân bố...</div>
                ) : stats?.categoryStats?.length === 0 ? (
                  <div className="col-span-3 text-center py-6 text-[#999999]">Chưa có sự kiện nào được ghi nhận.</div>
                ) : (
                  stats?.categoryStats?.map((cat, idx) => {
                    const percentage = Math.round((cat.count / (stats?.events?.total || 1)) * 100);
                    return (
                      <div key={cat._id || idx} className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm truncate text-[#aaaaaa]">{cat.categoryName}</span>
                          <span className="text-xs font-bold text-[#2dc275]">{cat.count} sự kiện</span>
                        </div>
                        <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2dc275] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-[#999999] flex justify-between">
                          <span>Tỉ lệ đóng góp</span>
                          <span>{percentage}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Danh sách Sự kiện</h2>
              <button 
                onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                className="bg-[#2dc275] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all"
              >
                + Thêm Sự kiện
              </button>
            </div>
            
            <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[#aaaaaa] text-xs uppercase font-semibold">
                      <th className="pb-3 pl-2">Sự kiện</th>
                      <th className="pb-3">Ngày</th>
                      <th className="pb-3">Địa điểm</th>
                      <th className="pb-3">Danh mục</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right pr-2">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/40">
                    {loadingData ? (
                      [1,2,3].map(n => <tr key={n} className="animate-pulse"><td colSpan="6" className="py-4 h-12"></td></tr>)
                    ) : eventsData.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-6 text-[#999999]">Chưa có sự kiện nào.</td></tr>
                    ) : (
                      eventsData.map(ev => (
                        <tr key={ev._id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 pl-2 font-bold">{ev.title}</td>
                          <td className="py-4">{new Date(ev.eventDate).toLocaleDateString('vi-VN')}</td>
                          <td className="py-4">{ev.location}</td>
                          <td className="py-4">{ev.categoryId?.name || 'N/A'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ev.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                              ev.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {ev.status}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2 space-x-2">
                            <button onClick={() => { setEditingEvent(ev); setShowEventModal(true); }} className="text-xs text-blue-400 hover:underline">Sửa</button>
                            <button onClick={() => handleDeleteEvent(ev._id)} className="text-xs text-red-400 hover:underline">Xóa</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Danh sách Vé</h2>
              <button 
                onClick={() => { setEditingTicket(null); setShowTicketModal(true); }}
                className="bg-[#2dc275] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all"
              >
                + Thêm Vé mới
              </button>
            </div>
            
            <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[#aaaaaa] text-xs uppercase font-semibold">
                      <th className="pb-3 pl-2">Loại vé</th>
                      <th className="pb-3">Sự kiện</th>
                      <th className="pb-3">Giá</th>
                      <th className="pb-3">Số lượng</th>
                      <th className="pb-3">Đã bán</th>
                      <th className="pb-3 text-right pr-2">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/40">
                    {loadingData ? (
                      [1,2,3].map(n => <tr key={n} className="animate-pulse"><td colSpan="6" className="py-4 h-12"></td></tr>)
                    ) : ticketsData.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-6 text-[#999999]">Chưa có vé nào.</td></tr>
                    ) : (
                      ticketsData.map(tk => (
                        <tr key={tk._id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 pl-2 font-bold">{tk.ticketName}</td>
                          <td className="py-4">{tk.eventId?.title || 'N/A'}</td>
                          <td className="py-4 font-mono">{formatVND(tk.price)}</td>
                          <td className="py-4">{tk.quantity}</td>
                          <td className="py-4 text-[#2dc275] font-bold">{tk.soldQuantity || 0}</td>
                          <td className="py-4 text-right pr-2 space-x-2">
                            <button onClick={() => { setEditingTicket(tk); setShowTicketModal(true); }} className="text-xs text-blue-400 hover:underline">Sửa</button>
                            <button onClick={() => handleDeleteTicket(tk._id)} className="text-xs text-red-400 hover:underline">Xóa</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Danh sách Danh mục</h2>
              <button 
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                className="bg-[#2dc275] text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all"
              >
                + Thêm Danh mục
              </button>
            </div>
            
            <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[#aaaaaa] text-xs uppercase font-semibold">
                      <th className="pb-3 pl-2">Tên danh mục</th>
                      <th className="pb-3">Mô tả</th>
                      <th className="pb-3 text-right pr-2">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/40">
                    {loadingData ? (
                      [1,2,3].map(n => <tr key={n} className="animate-pulse"><td colSpan="3" className="py-4 h-12"></td></tr>)
                    ) : categoriesData.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-6 text-[#999999]">Chưa có danh mục nào.</td></tr>
                    ) : (
                      categoriesData.map(cat => (
                        <tr key={cat._id} className="hover:bg-white/5 transition-all">
                          <td className="py-4 pl-2 font-bold">{cat.name}</td>
                          <td className="py-4 text-[#999999] italic">{cat.description || 'Không có mô tả'}</td>
                          <td className="py-4 text-right pr-2 space-x-2">
                            <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }} className="text-xs text-blue-400 hover:underline">Sửa</button>
                            <button onClick={() => handleDeleteCategory(cat._id)} className="text-xs text-red-400 hover:underline">Xóa</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals Implementations */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{editingEvent ? 'Chỉnh sửa Sự kiện' : 'Thêm Sự kiện mới'}</h3>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Tiêu đề sự kiện</label>
                <input name="title" defaultValue={editingEvent?.title} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Mô tả</label>
                <textarea name="description" defaultValue={editingEvent?.description} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#aaaaaa]">Ngày diễn ra</label>
                  <input type="date" name="date" defaultValue={editingEvent?.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[0] : ''} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#aaaaaa]">Giờ</label>
                  <input type="time" name="time" defaultValue={editingEvent?.eventDate ? new Date(editingEvent.eventDate).toISOString().split('T')[1].slice(0, 5) : ''} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#aaaaaa]">Ảnh sự kiện (URL)</label>
                    <input name="image" defaultValue={editingEvent?.image} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#aaaaaa]">Hoặc Tải ảnh lên</label>
                    <input type="file" name="imageFile" accept="image/*" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none text-xs file:bg-transparent file:border-0 file:text-[#2dc275] file:font-bold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#aaaaaa]">Danh mục</label>
                  <select name="categoryId" defaultValue={editingEvent?.categoryId?._id || editingEvent?.categoryId} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none">
                    <option value="">Chọn danh mục</option>
                    {categoriesData.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Địa điểm</label>
                <input name="location" defaultValue={editingEvent?.location} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Trạng thái</label>
                <select name="status" defaultValue={editingEvent?.status || 'upcoming'} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none">
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowEventModal(false)} className="text-xs font-bold text-[#aaaaaa] hover:text-white transition-all">Hủy</button>
                <button type="submit" className="bg-[#2dc275] text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingTicket ? 'Chỉnh sửa Vé' : 'Thêm Vé mới'}</h3>
            <form onSubmit={handleSaveTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Sự kiện</label>
                <select name="eventId" defaultValue={editingTicket?.eventId?._id || editingTicket?.eventId} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none">
                  <option value="">Chọn sự kiện</option>
                  {eventsData.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Tên loại vé (Vip, Thường...)</label>
                <input name="ticketName" defaultValue={editingTicket?.ticketName} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#aaaaaa]">Giá (VNĐ)</label>
                  <input type="number" name="price" defaultValue={editingTicket?.price} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#aaaaaa]">Tổng số lượng</label>
                  <input type="number" name="quantity" defaultValue={editingTicket?.quantity} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowTicketModal(false)} className="text-xs font-bold text-[#aaaaaa] hover:text-white transition-all">Hủy</button>
                <button type="submit" className="bg-[#2dc275] text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Tên danh mục</label>
                <input name="name" defaultValue={editingCategory?.name} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#aaaaaa]">Mô tả</label>
                <input name="description" defaultValue={editingCategory?.description} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:border-[#2dc275] outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="text-xs font-bold text-[#aaaaaa] hover:text-white transition-all">Hủy</button>
                <button type="submit" className="bg-[#2dc275] text-black px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#26a664] transition-all">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
