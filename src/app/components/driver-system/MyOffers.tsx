import { Home, FileText, Inbox, Truck, DollarSign, Star, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase';
import { listenDriverAssignedOrders, type OrderData } from '../../../services/firebaseService';

interface CreateDeliveryOfferProps {
  onNavigateToDashboard: () => void;
  onNavigateToCreateOffer: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
}

export function MyOffers({
  onNavigateToDashboard,
  onNavigateToCreateOffer,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
}: CreateDeliveryOfferProps) {
  const [assignedOrders, setAssignedOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const driverUid = auth.currentUser?.uid;
    if (!driverUid) {
      setAssignedOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = listenDriverAssignedOrders(
      driverUid,
      (orders) => {
        setAssignedOrders(orders);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Failed to load assigned orders:', snapshotError);
        setError('Unable to load your assigned orders.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
          
          <button className="w-full px-6 py-3 flex items-center gap-3 bg-white/10 border-l-4 border-white text-white font-semibold">
            <FileText className="w-5 h-5" />
            My Offers
          </button>
          
          <button 
            onClick={onNavigateToIncomingRequests}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Inbox className="w-5 h-5" />
            Incoming Requests
          </button>
          
          <button 
            onClick={onNavigateToActiveDeliveries}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Truck className="w-5 h-5" />
            Active Deliveries
          </button>
          
          <button 
            onClick={onNavigateToEarnings}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
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
              <p className="text-xs text-white/70">Real-time Orders</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Assigned Orders</h1>
              <p className="text-slate-500 mt-1">Live orders assigned to you</p>
            </div>
          </div>
        </header>

        {/* Offers Content */}
        <div className="p-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1 font-medium">Total Assigned</p>
              <p className="text-3xl font-bold text-slate-900">{assignedOrders.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1 font-medium">Accepted</p>
              <p className="text-3xl font-bold text-green-600">
                {assignedOrders.filter((order) => order.status === 'accepted').length}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm mb-1 font-medium">Completed</p>
              <p className="text-3xl font-bold text-blue-600">
                {assignedOrders.filter((order) => order.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading assigned orders...</h3>
              <p className="text-gray-500">Listening for your orders in real-time.</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-red-500/5">
              <h3 className="text-lg font-bold text-red-400 mb-2">Failed to load orders</h3>
              <p className="text-red-300/80">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order ID</p>
                      <p className="font-bold text-gray-800">{order.orderId}</p>
                      <p className="text-sm text-gray-600 mt-2">{order.pickupAddress || 'Pickup'} → {order.dropoffAddress || 'Dropoff'}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'accepted'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : order.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Passenger</p>
                      <p className="text-sm font-semibold text-gray-800">{order.userName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm font-semibold text-gray-800">{order.userPhone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {(order.createdAt as any)?.toDate?.()?.toLocaleString?.() || 'Live'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && assignedOrders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No assigned orders</h3>
              <p className="text-gray-500 mb-6">Accepted orders will appear here instantly.</p>
              <button
                onClick={onNavigateToIncomingRequests}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                View Pending Orders
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
