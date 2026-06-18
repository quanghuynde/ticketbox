import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, DollarSign, Ticket, Calendar, TrendingUp, Search, 
  UserX, ShieldAlert, Award, Power, RefreshCw, Layers 
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

  // Tab State: 'overview' | 'users'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  
  // User Filtering States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('token');

  // Fetch Dashboard Stats & Users
  const fetchData = async () => {
    try {
      setLoadingData(true);
      setError('');

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsJson = await statsRes.json();
      
      if (!statsRes.ok) throw new Error(statsJson.message || 'Failed to load dashboard stats.');
      setStats(statsJson);

      // Fetch users
      await fetchUsers();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi tải dữ liệu admin.');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({
        page,
        limit: 8,
        search,
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter })
      });

      const usersRes = await fetch(`${API_URL}/admin/users?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersJson = await usersRes.json();

      if (!usersRes.ok) throw new Error(usersJson.message || 'Failed to load users list.');
      setUsersData(usersJson.users);
      setTotalPages(usersJson.totalPages);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi tải danh sách người dùng.');
    }
  };

  // Fetch initial data
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, page, roleFilter, statusFilter]);

  // Fetch users when search query changes (debounce search manually or basic trigger)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Update User Role/Status
  const handleUpdateUser = async (userId, updateFields) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateFields)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật người dùng.');
      
      // Refresh user lists and stats
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Soft-Delete (Deactivate) User
  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này không?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi vô hiệu hóa người dùng.');
      
      fetchData();
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
              Quản lý tài khoản người dùng, bán vé và theo dõi doanh thu tổng quan.
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
        <div className="flex border-b border-[#27272a] gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Tổng quan (Overview)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all duration-300 ${
              activeTab === 'users' 
                ? 'border-[#2dc275] text-[#2dc275]' 
                : 'border-transparent text-[#999999] hover:text-white'
            }`}
          >
            Quản lý Users ({stats?.summary?.totalUsers || 0})
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

        {/* Tab 2: USERS LIST */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-[#27272a]/10 border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
              <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] w-4 h-4 group-focus-within:text-[#2dc275] transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#2dc275] transition-all"
                />
              </form>

              <div className="flex w-full md:w-auto gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="bg-black/40 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2dc275]"
                >
                  <option value="">Tất cả Vai Trò</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="bg-black/40 border border-white/10 text-white rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#2dc275]"
                >
                  <option value="">Tất cả Trạng thái</option>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Bị vô hiệu hóa</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#27272a]/10 border border-white/5 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[#aaaaaa] text-xs uppercase font-semibold">
                      <th className="pb-3 pl-2">Người dùng</th>
                      <th className="pb-3">Vai Trò</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right pr-2">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]/40">
                    {loadingData ? (
                      [1, 2, 3].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-4 pl-2"><div className="h-4 bg-[#27272a] rounded w-32"></div></td>
                          <td className="py-4"><div className="h-4 bg-[#27272a] rounded w-16"></div></td>
                          <td className="py-4"><div className="h-4 bg-[#27272a] rounded w-12"></div></td>
                          <td className="py-4 text-right pr-2"><div className="h-8 bg-[#27272a] rounded w-20 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : usersData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-[#999999]">Không tìm thấy người dùng nào phù hợp.</td>
                      </tr>
                    ) : (
                      usersData.map((usr) => (
                        <tr key={usr._id} className="hover:bg-[#27272a]/20 transition-all">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#27272a] border border-white/5 flex items-center justify-center font-bold text-xs text-[#2dc275]">
                                {usr.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">{usr.fullName}</span>
                                <span className="text-xs text-[#999999]">{usr.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5">
                              {usr.role === 'admin' ? (
                                <span className="flex items-center gap-1 bg-[#2dc275]/10 text-[#2dc275] border border-[#2dc275]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  <Award className="w-3 h-3" />
                                  Admin
                                </span>
                              ) : (
                                <span className="bg-[#aaaaaa]/10 text-[#aaaaaa] border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                  Customer
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              usr.isActive 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {usr.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2 space-x-2">
                            {/* Deactivate/Reactivate Action */}
                            {usr._id !== user._id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(usr._id, { role: usr.role === 'admin' ? 'customer' : 'admin' })}
                                  className="text-xs bg-[#27272a] text-[#aaaaaa] hover:text-[#2dc275] hover:bg-white/5 px-3 py-1.5 rounded-xl transition-all"
                                  title="Thay đổi vai trò (Admin / Customer)"
                                >
                                  {usr.role === 'admin' ? 'Hạ cấp' : 'Thăng cấp'}
                                </button>
                                <button
                                  onClick={() => usr.isActive ? handleDeactivateUser(usr._id) : handleUpdateUser(usr._id, { isActive: true })}
                                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                                    usr.isActive
                                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                      : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black'
                                  }`}
                                  title={usr.isActive ? 'Vô hiệu hóa tài khoản (Soft-delete)' : 'Kích hoạt lại tài khoản'}
                                >
                                  {usr.isActive ? 'Khóa' : 'Mở khóa'}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-[#555555] font-mono italic pr-2">Chính bạn</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-[#27272a] mt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-[#27272a] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white/5 transition-all"
                  >
                    Trang trước
                  </button>
                  <span className="text-xs text-[#999999]">Trang <b className="text-white">{page}</b> / {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="bg-[#27272a] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-white/5 transition-all"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
