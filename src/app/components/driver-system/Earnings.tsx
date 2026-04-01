import { Home, FileText, Inbox, Truck, DollarSign, Star, User, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

interface EarningsProps {
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
}

interface DeliveryRecord {
  id: string;
  date: string;
  time: string;
  customer: string;
  route: string;
  serviceType: string;
  amount: number;
  status: 'completed' | 'pending';
}

export function Earnings({
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToReviews,
  onNavigateToProfile,
}: EarningsProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');

  const todayDeliveries: DeliveryRecord[] = [
    { id: '1', date: 'Jan 18, 2026', time: '2:30 PM', customer: 'Sara Ahmed', route: 'Manama → Riffa', serviceType: 'Private Driver', amount: 8.5, status: 'completed' },
    { id: '2', date: 'Jan 18, 2026', time: '1:15 PM', customer: 'Mohammed Ali', route: 'Muharraq → Seef', serviceType: 'OnTheWay', amount: 12.0, status: 'completed' },
    { id: '3', date: 'Jan 18, 2026', time: '11:45 AM', customer: 'Fatima Hassan', route: 'Adliya → Juffair', serviceType: 'Private Driver', amount: 4.5, status: 'completed' },
    { id: '4', date: 'Jan 18, 2026', time: '10:20 AM', customer: 'Ali Khan', route: 'Sitra → Manama', serviceType: 'Mandoob', amount: 6.8, status: 'completed' },
    { id: '5', date: 'Jan 18, 2026', time: '9:00 AM', customer: 'Noora Saleh', route: 'Hamad Town → Riffa', serviceType: 'Private Driver', amount: 5.2, status: 'completed' },
  ];

  const weekDeliveries: DeliveryRecord[] = [
    ...todayDeliveries,
    { id: '6', date: 'Jan 17, 2026', time: '6:45 PM', customer: 'Khalid Ahmed', route: 'Budaiya → Manama', serviceType: 'Private Driver', amount: 11.5, status: 'completed' },
    { id: '7', date: 'Jan 17, 2026', time: '3:30 PM', customer: 'Maryam Ali', route: 'Seef → Airport', serviceType: 'Private Driver', amount: 15.0, status: 'completed' },
    { id: '8', date: 'Jan 16, 2026', time: '5:15 PM', customer: 'Ahmed Hassan', route: 'Jidhafs → Tubli', serviceType: 'OnTheWay', amount: 7.2, status: 'completed' },
  ];

  const monthDeliveries: DeliveryRecord[] = [
    ...weekDeliveries,
    { id: '9', date: 'Jan 15, 2026', time: '4:00 PM', customer: 'Layla Mohammed', route: 'Sanabis → Adliya', serviceType: 'Mandoob', amount: 3.8, status: 'completed' },
    { id: '10', date: 'Jan 14, 2026', time: '2:45 PM', customer: 'Omar Khalifa', route: 'Amwaj → Seef', serviceType: 'Private Driver', amount: 18.5, status: 'completed' },
  ];

  const getDeliveries = () => {
    if (activeTab === 'today') return todayDeliveries;
    if (activeTab === 'week') return weekDeliveries;
    return monthDeliveries;
  };

  const getTotalEarnings = () => {
    return getDeliveries().reduce((sum, d) => sum + d.amount, 0);
  };

  const getCompletedCount = () => {
    return getDeliveries().filter(d => d.status === 'completed').length;
  };

  const getAverageEarnings = () => {
    const total = getTotalEarnings();
    const count = getCompletedCount();
    return count > 0 ? total / count : 0;
  };

  return (
    <div className="size-full flex bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Fixed Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-600 to-blue-600 text-white flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Driver System</h2>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <button 
            onClick={onNavigateToDashboard}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={onNavigateToMyOffers}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <FileText className="w-5 h-5" />
            My Offers
          </button>
          
          <button 
            onClick={onNavigateToIncomingRequests}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Inbox className="w-5 h-5" />
            Incoming Requests
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </button>
          
          <button 
            onClick={onNavigateToActiveDeliveries}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Truck className="w-5 h-5" />
            Active Deliveries
            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
          </button>
          
          <button className="w-full px-6 py-3 flex items-center gap-3 bg-white/10 border-l-4 border-white text-white font-semibold">
            <DollarSign className="w-5 h-5" />
            Earnings
          </button>
          
          <button 
            onClick={onNavigateToReviews}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Star className="w-5 h-5" />
            Reviews
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Driver</p>
              <p className="text-xs text-white/70">Ahmed Al-Khalifa</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Earnings</h1>
            <p className="text-slate-500 mt-1">Track your earnings and delivery history</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 shadow-md mb-8 w-fit">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'week'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'month'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-800">BD {getTotalEarnings().toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Completed Deliveries</p>
              <p className="text-3xl font-bold text-gray-800">{getCompletedCount()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">Average per Delivery</p>
              <p className="text-3xl font-bold text-gray-800">BD {getAverageEarnings().toFixed(2)}</p>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Delivery History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getDeliveries().map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{delivery.date}</p>
                            <p className="text-xs text-gray-500">{delivery.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-800">{delivery.customer}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-700">{delivery.route}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {delivery.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          delivery.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {delivery.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <p className="text-sm font-bold text-green-600">BD {delivery.amount.toFixed(2)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
