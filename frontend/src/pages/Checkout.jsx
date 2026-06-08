import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, CheckCircle2, ChevronRight, Lock, ChevronLeft } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('sepay');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#aaaaaa] hover:text-[#2dc275] mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#2dc275]' : 'text-[#999999]'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-[#2dc275]' : 'border-[#999999]'}`}>1</div>
          <span className="text-sm font-medium">Payment</span>
        </div>
        <div className="w-12 h-[1px] bg-[#27272a]"></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#2dc275]' : 'text-[#999999]'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-[#2dc275]' : 'border-[#999999]'}`}>2</div>
          <span className="text-sm font-medium">Confirmation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Payment Methods */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Payment Method</h2>
            <p className="text-[#aaaaaa] text-sm">Select your preferred payment method to complete the transaction.</p>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => setPaymentMethod('sepay')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                paymentMethod === 'sepay' ? 'border-[#2dc275] bg-[#2dc275]/5' : 'border-[#27272a] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  <span className="text-black font-black italic">SePay</span>
                </div>
                <div>
                  <h4 className="font-bold">Banking Scan (SePay)</h4>
                  <p className="text-xs text-[#999999]">Instant confirmation via QR</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'sepay' ? 'border-[#2dc275]' : 'border-[#27272a]'}`}>
                {paymentMethod === 'sepay' && <div className="w-3 h-3 rounded-full bg-[#2dc275]"></div>}
              </div>
            </div>

            <div 
              onClick={() => setPaymentMethod('momo')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
                paymentMethod === 'momo' ? 'border-[#2dc275] bg-[#2dc275]/5' : 'border-[#27272a] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#af196e] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs uppercase">MoMo</span>
                </div>
                <div>
                  <h4 className="font-bold">MoMo Wallet</h4>
                  <p className="text-xs text-[#999999]">Pay with MoMo app</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'momo' ? 'border-[#2dc275]' : 'border-[#27272a]'}`}>
                {paymentMethod === 'momo' && <div className="w-3 h-3 rounded-full bg-[#2dc275]"></div>}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#27272a]/30 border border-white/5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#2dc275] shrink-0" />
            <p className="text-[#999999] text-xs leading-relaxed">
              Your transaction is secured with SSL encryption. Personal data will be handled according to our privacy policy.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-[#27272a] rounded-3xl p-8 border border-white/5 h-fit space-y-6">
          <h3 className="text-xl font-bold">Order Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm">FPT Music Festival 2026</h4>
                <p className="text-xs text-[#999999]">2 x VIP Ticket</p>
              </div>
              <span className="font-bold text-sm">1,000,000đ</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#999999] text-sm">Processing Fee</span>
              <span className="font-medium text-sm">20,000đ</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="font-bold text-2xl text-[#2dc275]">1,020,000đ</span>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-[#2dc275] text-black font-bold text-lg hover:scale-[1.02] transition-all duration-300 shadow-[0_10px_30px_rgba(45,194,117,0.3)] flex items-center justify-center gap-2"
          >
            Pay Now
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
