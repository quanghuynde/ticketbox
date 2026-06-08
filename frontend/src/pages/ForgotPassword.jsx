import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ChevronLeft, Ticket } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        {/* Logo & Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2dc275]/10 rounded-2xl rotate-3 mb-2 border border-[#2dc275]/30">
            <Ticket className="text-[#2dc275] w-8 h-8 -rotate-3" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
          <p className="text-[#999999]">No worries, we'll send you reset instructions.</p>
        </div>

        {/* Card */}
        <div className="bg-[#27272a]/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl space-y-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#aaaaaa] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#aaaaaa] group-focus-within:text-[#2dc275] transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#555555] focus:outline-none focus:border-[#2dc275] focus:ring-1 focus:ring-[#2dc275] transition-all"
                />
              </div>
            </div>

            <button 
              className="w-full bg-[#2dc275] text-black font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] flex items-center justify-center gap-2"
              onClick={() => navigate('/login')}
            >
              Reset Password
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[#aaaaaa] text-sm">
          Remembered your password? {' '}
          <Link to="/login" className="text-[#2dc275] font-bold hover:underline">Try Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
