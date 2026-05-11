import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { Eye, RefreshCw, ChevronDown, CheckCircle, XCircle, DollarSign, Clock, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';

interface Payment {
  id: string;
  user: string;
  amount: number;
  commission: number;
  driverAmount: number;
  status: 'Successful' | 'Failed' | 'Refunded' | 'Under Review';
  date: string;
  type: 'Trip' | 'Delivery';
  method: 'Credit Card' | 'Cash' | 'Apple Pay';
  driverName: string;
}

interface DriverPayout {
  id: string;
  name: string;
  pendingAmount: number;
  totalEarned: number;
  lastPayout: string;
  status: 'Ready' | 'Processed' | 'On Hold';
}

interface AdminPaymentsProps {
  onNavigate: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminPayments({ onNavigate }: AdminPaymentsProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');
  const [payments, setPayments] = useState<Payment[]>([
    { id: 'PAY001', user: 'Sara Ahmed', amount: 7.5, commission: 1.12, driverAmount: 6.38, status: 'Successful', date: '2024-01-15', type: 'Trip', method: 'Credit Card', driverName: 'Ahmed Hassan' },
    { id: 'PAY002', user: 'Mohammed Ali', amount: 12.3, commission: 1.85, driverAmount: 10.45, status: 'Successful', date: '2024-01-15', type: 'Delivery', method: 'Cash', driverName: 'Mohammed Saleh' },
    { id: 'PAY003', user: 'Noora Saleh', amount: 8.0, commission: 1.2, driverAmount: 6.8, status: 'Refunded', date: '2024-01-14', type: 'Trip', method: 'Apple Pay', driverName: 'Ali Hassan' },
    { id: 'PAY004', user: 'Khalid Ahmed', amount: 15.5, commission: 2.32, driverAmount: 13.18, status: 'Under Review', date: '2024-01-14', type: 'Delivery', method: 'Credit Card', driverName: 'Khalid Ahmed' },
    { id: 'PAY005', user: 'Fatima Hassan', amount: 5.2, commission: 0.78, driverAmount: 4.42, status: 'Successful', date: '2024-01-13', type: 'Trip', method: 'Cash', driverName: 'Youssef Ali' },
  ]);

  const [driverPayouts, setDriverPayouts] = useState<DriverPayout[]>([
    { id: 'DRV001', name: 'Ahmed Hassan', pendingAmount: 145.5, totalEarned: 1240.0, lastPayout: '2024-01-01', status: 'Ready' },
    { id: 'DRV002', name: 'Mohammed Saleh', pendingAmount: 89.2, totalEarned: 850.0, lastPayout: '2024-01-05', status: 'Processed' },
    { id: 'DRV003', name: 'Ali Hassan', pendingAmount: 210.0, totalEarned: 3420.0, lastPayout: '2023-12-28', status: 'On Hold' },
  ]);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Payment['status']>('Successful');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const totalRevenue = payments.filter(p => p.status === 'Successful').reduce((acc, p) => acc + p.amount, 0);
  const totalCommission = payments.filter(p => p.status === 'Successful').reduce((acc, p) => acc + p.commission, 0);
  const totalDriverEarnings = payments.filter(p => p.status === 'Successful').reduce((acc, p) => acc + p.driverAmount, 0);
  const cashPayments = payments.filter(p => p.status === 'Successful' && p.method === 'Cash').reduce((acc, p) => acc + p.amount, 0);

  const confirmRefund = () => {
    if (selectedPayment) {
      setPayments(payments.map(p => 
        p.id === selectedPayment.id ? { ...p, status: 'Refunded' } : p
      ));
      setShowRefundModal(false);
      setSuccessMessage('Payment refunded successfully');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    }
  };

  const confirmStatusChange = () => {
    if (selectedPayment) {
      setPayments(payments.map(p => 
        p.id === selectedPayment.id ? { ...p, status: newStatus } : p
      ));
      setShowStatusModal(false);
      setSuccessMessage('Payment status updated successfully');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    }
  };

  const handleProcessPayout = (driverId: string) => {
    setDriverPayouts(driverPayouts.map(d => 
      d.id === driverId ? { ...d, status: 'Processed', pendingAmount: 0, lastPayout: new Date().toISOString().split('T')[0] } : d
    ));
    setSuccessMessage('Payout processed successfully');
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  return (
    <div className="size-full flex bg-gradient-to-br from-gray-50 to-blue-50/30">
      <AdminSidebar activePage="payments" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Finance & Payouts</h1>
              <p className="text-gray-500 text-lg">Track revenue, commissions, and driver earnings</p>
            </div>
            <div className="flex bg-white rounded-2xl p-1 shadow-md border border-gray-100">
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Transactions
              </button>
              <button 
                onClick={() => setActiveTab('payouts')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'payouts' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Driver Payouts
              </button>
            </div>
          </div>

          {/* Revenue Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-16 h-16 text-green-600" />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalRevenue.toFixed(2)} BD</h3>
              <div className="mt-4 flex items-center gap-1 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-bold">+12.5% from last week</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Landmark className="w-16 h-16 text-purple-600" />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Platform Commission</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalCommission.toFixed(2)} BD</h3>
              <p className="text-[10px] text-gray-400 mt-4">Average 15% fee per trip</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet className="w-16 h-16 text-blue-600" />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Driver Net Earnings</p>
              <h3 className="text-2xl font-bold text-blue-600">{totalDriverEarnings.toFixed(2)} BD</h3>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <DollarSign className="w-16 h-16 text-orange-600" />
              </div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Cash to Collect</p>
              <h3 className="text-2xl font-bold text-orange-600">{cashPayments.toFixed(2)} BD</h3>
              <p className="text-[10px] text-orange-400 mt-4">Needs manual collection from drivers</p>
            </div>
          </div>

          {activeTab === 'transactions' ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Transaction</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Driver & Method</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Platform Fee</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Driver Net</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-800">{payment.id}</p>
                            <p className="text-xs text-gray-500">{payment.user} • {payment.date}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{payment.driverName}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              payment.method === 'Cash' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {payment.method}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">{payment.amount.toFixed(2)} BD</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-purple-600">-{payment.commission.toFixed(2)} BD</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-green-600">{payment.driverAmount.toFixed(2)} BD</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            payment.status === 'Successful' ? 'bg-green-100 text-green-600' : 
                            payment.status === 'Refunded' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => { setSelectedPayment(payment); setShowRefundModal(true); }}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {driverPayouts.map((payout) => (
                <div key={payout.id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">👨🏻‍✈️</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      payout.status === 'Ready' ? 'bg-green-100 text-green-600' : 
                      payout.status === 'On Hold' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{payout.name}</h3>
                  <p className="text-xs text-gray-500 mb-6">Last payout: {payout.lastPayout}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending Amount</span>
                      <span className="font-bold text-gray-800">{payout.pendingAmount.toFixed(2)} BD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lifetime Earnings</span>
                      <span className="font-bold text-purple-600">{payout.totalEarned.toFixed(2)} BD</span>
                    </div>
                  </div>

                  <button 
                    disabled={payout.status !== 'Ready'}
                    onClick={() => handleProcessPayout(payout.id)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Landmark className="w-4 h-4" />
                    Process Payout
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Process Refund?</h3>
            <p className="text-gray-500 text-center mb-8">
              You are about to refund <span className="font-bold text-gray-800">BD {selectedPayment?.amount.toFixed(2)}</span> to {selectedPayment?.user}. This action cannot be reversed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="font-bold">{successMessage}</p>
        </div>
      )}
    </div>
  );
}