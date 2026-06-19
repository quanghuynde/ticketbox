import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-[#000000] text-white selection:bg-[#2dc275]/30">
        <Navbar />
        
        <main className="pt-32 pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#27272a] bg-[#27272a]/20 py-12">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#2dc275] rounded flex items-center justify-center">
                  <span className="text-black font-bold text-xs">T</span>
                </div>
                <span className="font-bold text-xl">TicketBox</span>
              </div>
              <p className="text-[#999999] text-sm">
                Nền tảng giúp bạn kết nối với những sự kiện thú vị nhất.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Khám phá</h4>
              <ul className="text-[#999999] text-sm space-y-2">
                <li>Hòa nhạc</li>
                <li>Hội thảo</li>
                <li>Seminar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Hỗ trợ</h4>
              <ul className="text-[#999999] text-sm space-y-2">
                <li>Trung tâm trợ giúp</li>
                <li>Chính sách hoàn tiền</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kết nối</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center hover:bg-[#2dc275] transition-colors cursor-pointer">
                  <span className="text-xs">FB</span>
                </div>
                <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center hover:bg-[#2dc275] transition-colors cursor-pointer">
                  <span className="text-xs">IG</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-12 pt-8 border-t border-[#27272a] text-[#999999] text-xs">
            © 2026 TicketBox. Bảo lưu mọi quyền.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
