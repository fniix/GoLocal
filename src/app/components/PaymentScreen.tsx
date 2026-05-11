import { ArrowLeft, CheckCircle, CreditCard, Banknote, Shield, Check, Wallet } from 'lucide-react';
import React, { useState } from 'react';

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentComplete: () => void;
  driverName?: string;
  amount?: number;
  orderId?: string | null;
}

export function PaymentScreen({ onBack, onPaymentComplete, driverName = "Driver", amount = 3.5, orderId }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'benefit' | 'card' | 'apple'>('benefit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 2000);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-6">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 text-center text-lg">
          Thank you for riding with GoLocal.<br/>Your payment of <span className="font-bold text-green-700">BD {amount.toFixed(3)}</span> has been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-800 hover:bg-gray-100 rounded-full p-2 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Receipt Summary */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>
          
          <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1 relative z-10">Total Amount</h2>
          <div className="flex items-end gap-2 mb-6 relative z-10">
            <span className="text-5xl font-black">BD</span>
            <span className="text-5xl font-black">{amount.toFixed(3)}</span>
          </div>
          
          <div className="border-t border-white/20 pt-4 relative z-10">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Driver</span>
              <span className="font-semibold">{driverName}</span>
            </div>
            {orderId && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-white/80">Order ID</span>
                <span className="font-mono text-xs opacity-75">{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Select Payment Method</h3>
          
          {/* BenefitPay */}
          <div 
            onClick={() => setSelectedMethod('benefit')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-center justify-between ${selectedMethod === 'benefit' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-red-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800">BenefitPay</p>
                <p className="text-xs text-gray-500">Fast & Secure</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'benefit' ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
              {selectedMethod === 'benefit' && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          {/* Credit/Debit Card */}
          <div 
            onClick={() => setSelectedMethod('card')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-center justify-between ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Credit / Debit Card</p>
                <p className="text-xs text-gray-500">Visa, Mastercard</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
              {selectedMethod === 'card' && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          {/* Apple Pay */}
          <div 
            onClick={() => setSelectedMethod('apple')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-center justify-between ${selectedMethod === 'apple' ? 'border-gray-800 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Apple Pay</p>
                <p className="text-xs text-gray-500">Pay with your device</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'apple' ? 'border-gray-800 bg-gray-800' : 'border-gray-300'}`}>
              {selectedMethod === 'apple' && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          {/* Cash */}
          <div 
            onClick={() => setSelectedMethod('cash')}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-center justify-between ${selectedMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Cash</p>
                <p className="text-xs text-gray-500">Pay driver directly</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
              {selectedMethod === 'cash' && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 z-20">
        <button
          disabled={isProcessing}
          onClick={handlePay}
          className="w-full py-4 rounded-2xl text-lg font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2"
          style={{
            background: selectedMethod === 'benefit' ? '#ef4444' : 
                        selectedMethod === 'card' ? '#3b82f6' : 
                        selectedMethod === 'apple' ? '#1f2937' : '#22c55e',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            `Pay BD ${amount.toFixed(3)}`
          )}
        </button>
      </div>
    </div>
  );
}