import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, DollarSign, Shield, CheckCircle, Lock, Eye, EyeOff, X, Home } from 'lucide-react';
import { recordPayment } from '../../services/firebaseService';

interface SmartPaymentScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  orderId?: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  driverName: string;
  distance: number;
  duration: number;
  onPaymentComplete?: () => void;
}

type Step = 'summary' | 'card-form' | 'otp' | 'processing' | 'success';

const baseFare = 2.50;

export function SmartPaymentScreen({
  onBack, onNavigateHome, orderId, pickupLocation, dropoffLocation,
  driverName, distance, duration, onPaymentComplete,
}: SmartPaymentScreenProps) {
  const [method, setMethod] = useState<'card' | 'wallet' | 'cash'>('card');
  const [step, setStep] = useState<Step>('summary');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [tip, setTip] = useState(0);
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('Connecting to payment gateway...');
  const [dots, setDots] = useState('');

  const distFare = distance * 0.80;
  const timeFare = duration * 0.15;
  const subtotal = baseFare + distFare + timeFare;
  const discount = promoApplied ? 1.50 : 0;
  const total = subtotal - discount + tip;
  const totalStr = `BD ${total.toFixed(2)}`;

  // Animate dots
  useEffect(() => {
    if (step !== 'processing') return;
    const msgs = [
      'Connecting to payment gateway...',
      'Verifying your card...',
      'Processing transaction...',
      'Almost done...',
    ];
    let i = 0;
    const t1 = setInterval(() => { i = (i + 1) % msgs.length; setProcessingMsg(msgs[i]); }, 1200);
    const t2 = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    const done = setTimeout(() => {
      clearInterval(t1); clearInterval(t2);
      if (orderId) recordPayment(orderId, method, total).catch(() => {});
      setStep('success');
    }, 4000);
    return () => { clearInterval(t1); clearInterval(t2); clearTimeout(done); };
  }, [step]);

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    setOtpError(false);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const code = otp.join('');
    if (code === '123456') { setStep('processing'); }
    else { setOtpError(true); setOtp(['', '', '', '', '', '']); document.getElementById('otp-0')?.focus(); }
  };

  const handlePay = () => {
    if (method === 'cash') {
      setStep('processing');
    } else if (method === 'wallet') {
      setStep('processing');
    } else {
      setStep('card-form');
    }
  };

  const handleCardSubmit = () => {
    if (!cardNum || !cardName || !expiry || !cvv) return;
    setStep('otp');
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex flex-col items-center justify-center px-6 py-12 relative">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        )}
        <style>{`
          @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .pop { animation: pop 0.5s ease-out both; }
          .fadeUp { animation: fadeUp 0.5s ease-out both; }
        `}</style>

        <div className="pop w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <div className="fadeUp text-center mb-8" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl font-bold text-white mb-1">Payment Successful!</h1>
          <p className="text-white/80">Thank you for riding with GoLocal</p>
        </div>

        {/* Receipt Card */}
        <div className="fadeUp w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ animationDelay: '0.4s' }}>
          {/* Receipt header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-5 text-white">
            <p className="text-sm opacity-80">Amount Paid</p>
            <p className="text-4xl font-bold">{totalStr}</p>
            <p className="text-sm opacity-80 mt-1">{method === 'card' ? '💳 Card' : method === 'wallet' ? '👛 Wallet' : '💵 Cash'}</p>
          </div>

          {/* Dotted separator */}
          <div className="flex items-center px-6 py-2">
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            <div className="-mt-1 mx-3 w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          </div>

          {/* Details */}
          <div className="px-6 pb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Driver</span>
              <span className="font-semibold text-gray-800">{driverName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Distance</span>
              <span className="font-semibold text-gray-800">{distance.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-semibold text-gray-800">{duration} min</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Promo ({promoCode})</span>
                <span className="font-semibold text-green-600">-BD {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-purple-600">{totalStr}</span>
            </div>
          </div>

          <button
            onClick={() => onPaymentComplete?.()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg"
          >
            Rate Your Trip →
          </button>
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── PROCESSING SCREEN ───────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        )}
        <div className="relative w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
          <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{processingMsg}</h2>
        <p className="text-gray-400 text-sm">Please do not close this screen{dots}</p>
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-center gap-3 max-w-xs">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Your payment is protected by 256-bit SSL encryption</p>
        </div>
      </div>
    );
  }

  // ── OTP SCREEN ──────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStep('card-form')} className="text-white hover:bg-white/10 rounded-full p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {onNavigateHome && (
              <button type="button" onClick={onNavigateHome} className="text-white hover:bg-white/10 rounded-full p-2" aria-label="Go to home">
                <Home className="w-6 h-6" />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Payment</h1>
          <p className="text-white/80 text-sm mt-1">Enter the 6-digit OTP sent to your phone</p>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <p className="text-center text-gray-600 mb-1 text-sm">OTP sent to <strong>+973 *** **** 47</strong></p>
            <p className="text-center text-purple-600 text-xs mb-6">Hint: use 123456</p>

            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                    otpError ? 'border-red-400 bg-red-50' :
                    digit ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>

            {otpError && <p className="text-center text-red-500 text-sm mb-4">❌ Incorrect OTP. Try again.</p>}

            <button
              onClick={handleOtpSubmit}
              disabled={otp.join('').length < 6}
              className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${
                otp.join('').length === 6
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Verify & Pay {totalStr}
            </button>

            <p className="text-center text-gray-400 text-sm mt-4">
              Didn't receive? <button className="text-purple-600 font-semibold">Resend</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── CARD FORM ───────────────────────────────────────────────────────────────
  if (step === 'card-form') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStep('summary')} className="text-white hover:bg-white/10 rounded-full p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {onNavigateHome && (
              <button type="button" onClick={onNavigateHome} className="text-white hover:bg-white/10 rounded-full p-2" aria-label="Go to home">
                <Home className="w-6 h-6" />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Card Details</h1>
          <p className="text-white/80 text-sm">Secure & encrypted payment</p>
        </div>

        {/* Visual Card */}
        <div className="px-6 -mt-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-7 bg-yellow-400 rounded-md opacity-90" />
              <span className="text-white/60 text-sm">GoLocal Pay</span>
            </div>
            <p className="text-xl font-mono tracking-widest mb-4">
              {cardNum || '**** **** **** ****'}
            </p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-white/50 text-xs">CARD HOLDER</p>
                <p className="font-semibold">{cardName || 'YOUR NAME'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-xs">EXPIRES</p>
                <p className="font-semibold">{expiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-4 pb-8">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
            <input
              type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
              value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
            <input
              type="text" placeholder="Name on card"
              value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry Date</label>
              <input
                type="text" inputMode="numeric" placeholder="MM/YY"
                value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">CVV</label>
              <div className="relative">
                <input
                  type={showCvv ? 'text' : 'password'} inputMode="numeric" placeholder="•••"
                  value={cvv} maxLength={4} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white pr-10"
                />
                <button onClick={() => setShowCvv(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-3">
            <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700">Your card data is encrypted with 256-bit SSL</p>
          </div>

          <button
            onClick={handleCardSubmit}
            disabled={!cardNum || !cardName || !expiry || !cvv}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${
              cardNum && cardName && expiry && cvv
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg hover:shadow-xl active:scale-[0.98]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue → OTP Verification
          </button>
        </div>
      </div>
    );
  }

  // ── SUMMARY SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-2xl font-bold">Payment</h1>
            <p className="text-white/80 text-sm">Complete your transaction</p>
          </div>
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors shrink-0"
              aria-label="Go to home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full shrink-0">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-semibold">Secure</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-4">
        {/* Fare breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">Fare Breakdown</h2>
          <div className="space-y-2.5 text-sm">
            {[
              { label: 'Base Fare', val: baseFare },
              { label: `Distance (${distance.toFixed(1)} km × 0.80)`, val: distFare },
              { label: `Time (${duration} min × 0.15)`, val: timeFare },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-gray-800">BD {r.val.toFixed(2)}</span>
              </div>
            ))}
            {promoApplied && (
              <div className="flex justify-between text-green-600">
                <span>Promo ({promoCode}) 🎉</span>
                <span className="font-semibold">-BD {discount.toFixed(2)}</span>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tip for driver 🎁</span>
                <span className="font-medium text-gray-800">BD {tip.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2.5 flex justify-between">
              <span className="font-bold text-gray-800 text-base">Total</span>
              <span className="font-bold text-purple-600 text-xl">{totalStr}</span>
            </div>
          </div>
        </div>

        {/* Promo */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Promo Code</h2>
          {promoApplied ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800 text-sm">{promoCode} applied!</p>
                  <p className="text-xs text-green-600">Saved BD {discount.toFixed(2)}</p>
                </div>
              </div>
              <button onClick={() => { setPromoApplied(false); setPromoCode(''); }} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text" placeholder="Enter promo code"
                value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => { if (['GOLOCAL10', 'FIRST20'].includes(promoCode)) setPromoApplied(true); }}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700"
              >Apply</button>
            </div>
          )}
          {!promoApplied && (
            <div className="flex gap-2 mt-2">
              {['GOLOCAL10', 'FIRST20'].map(c => (
                <button key={c} onClick={() => setPromoCode(c)}
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold hover:bg-purple-100">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Tip for Driver <span className="text-gray-400 text-sm font-normal">(Optional)</span></h2>
          <div className="grid grid-cols-4 gap-2">
            {[0, 0.5, 1, 2].map(t => (
              <button key={t} onClick={() => setTip(t)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tip === t ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow' : 'bg-gray-100 text-gray-700'
                }`}>
                {t === 0 ? 'None' : `BD ${t.toFixed(2)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">Payment Method</h2>
          <div className="space-y-2.5">
            {[
              { id: 'card' as const, label: 'Credit / Debit Card', sub: '**** **** **** 4532', icon: <CreditCard className="w-5 h-5" />, badge: 'Most Used' },
              { id: 'wallet' as const, label: 'GoLocal Wallet', sub: 'Balance: BD 25.50', icon: <Wallet className="w-5 h-5" />, badge: 'Instant' },
              { id: 'cash' as const, label: 'Cash', sub: 'Pay driver directly', icon: <DollarSign className="w-5 h-5" />, badge: null },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                  method === m.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {m.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                    {m.badge && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{m.badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === m.id ? 'border-purple-600' : 'border-gray-300'}`}>
                  {method === m.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-2xl">
        <button onClick={handlePay}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />
          {method === 'cash' ? 'Complete Trip' : `Pay ${totalStr}`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          {method === 'cash' ? '💵 Pay the driver directly in cash' : '🔒 Secured by GoLocal Payment Gateway'}
        </p>
      </div>
    </div>
  );
}
