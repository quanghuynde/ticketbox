import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Ticket, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Basic validation and transition to OTP screen
    if (!showOtpStep) {
      if (!fullName || !email || !password) {
        setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
        return;
      }
      if (password.length < 8) {
        setError('Mật khẩu phải chứa ít nhất 8 ký tự.');
        return;
      }
      setError('');
      setShowOtpStep(true);
      return;
    }

    // Step 2: OTP submission
    if (!otp) {
      setError('Vui lòng nhập mã OTP xác thực.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const registeredUser = await register(fullName, email, password, otp);
      if (registeredUser && registeredUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2dc275] rounded-2xl rotate-3 mb-2 shadow-[0_0_30px_rgba(45,194,117,0.3)]">
            <Ticket className="text-black w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-[#999999]">Join TicketBox to start booking events</p>
        </div>

        {/* Register Card */}
        <div className="bg-[#27272a]/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!showOtpStep ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#aaaaaa] ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#aaaaaa] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#aaaaaa] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#2dc275] text-black font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="text-center py-2">
                  <p className="text-xs text-[#999999] mb-4">
                    Vui lòng nhập mã xác thực OTP gửi tới email <b className="text-white">{email}</b> để hoàn tất đăng ký.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#aaaaaa] ml-1">Mã xác thực OTP</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Mã OTP mặc định: 123456"
                      maxLength={6}
                      required
                      autoFocus
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => { setShowOtpStep(false); setError(''); }}
                    className="flex-1 bg-[#27272a]/50 hover:bg-[#27272a] text-white border border-white/10 font-bold py-4 rounded-2xl transition-all"
                  >
                    Quay lại
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-[#2dc275] text-black font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? 'Đang xác thực...' : 'Xác thực & Đăng ký'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-[10px] text-center text-[#555555]">
            By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-[#aaaaaa] text-sm">
          Already have an account? {' '}
          <Link to="/login" id="to-login" className="text-[#2dc275] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
