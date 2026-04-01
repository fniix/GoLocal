import { Home, FileText, Inbox, Truck, DollarSign, Star, User, Check, X, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { acceptOrder, listenPendingOrdersForDrivers, rejectOrder } from '../../../services/firebaseService';

interface IncomingRequestsProps {
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToCreateOffer: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
  driverStatus: 'available' | 'busy' | 'offline';
}

interface Request {
  id: string;
  customerName: string;
  fromCity: string;
  fromArea: string;
  toCity: string;
  toArea: string;
  description: string;
  suggestedPrice: number;
  timeRemaining: number;
  serviceType: string;
  customerRating: number;
}

export function IncomingRequests({
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToCreateOffer,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
  driverStatus,
}: IncomingRequestsProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = listenPendingOrdersForDrivers(
      (orders) => {
        const mappedRequests: Request[] = orders.map((order) => ({
          id: order.orderId,
          customerName: order.userName || 'User',
          fromCity: order.pickupAddress || 'Pickup',
          fromArea: `Lat ${order.pickupLocation.lat.toFixed(3)}, Lng ${order.pickupLocation.lng.toFixed(3)}`,
          toCity: order.dropoffAddress || 'Dropoff',
          toArea: `Lat ${order.dropoffLocation.lat.toFixed(3)}, Lng ${order.dropoffLocation.lng.toFixed(3)}`,
          description: `Order from ${order.userPhone} • ${order.createdAt ? 'Live now' : ''}`,
          suggestedPrice: 0,
          timeRemaining: 300,
          serviceType: 'Ride',
          customerRating: 5,
        }));
        setRequests(mappedRequests);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error loading pending orders:', snapshotError);
        setError('Unable to load incoming requests.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prevRequests =>
        prevRequests.map(req => ({
          ...req,
          timeRemaining: Math.max(0, req.timeRemaining - 1)
        })).filter(req => req.timeRemaining > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      try {
        await acceptOrder(id);
        alert(`Request accepted from ${request.customerName}.`);
      } catch (acceptError) {
        console.error('Failed to accept request:', acceptError);
        alert('Failed to accept request.');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      try {
        await rejectOrder(id);
      } catch (rejectError) {
        console.error('Failed to reject request:', rejectError);
      }
    }
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
          
          <button className="w-full px-6 py-3 flex items-center gap-3 bg-white/10 border-l-4 border-white text-white font-semibold">
            <Inbox className="w-5 h-5" />
            Incoming Requests
            {requests.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={onNavigateToActiveDeliveries}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Truck className="w-5 h-5" />
            Active Deliveries
            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">2</span>
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
              <p className="text-xs text-white/70">Ahmed Al-Khalifa</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Incoming Requests</h1>
              <p className="text-slate-500 mt-1">
                {driverStatus === 'available' 
                  ? `${requests.length} pending requests`
                  : 'Set status to Available to receive requests'}
              </p>
            </div>
            <div className={`px-5 py-2.5 rounded-full font-semibold ${
              driverStatus === 'available' ? 'bg-green-100 text-green-700' :
              driverStatus === 'busy' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {driverStatus === 'available' && '● Available'}
              {driverStatus === 'busy' && '⚠ Busy'}
              {driverStatus === 'offline' && '⚪ Offline'}
            </div>
          </div>
        </header>

        {/* Requests Content */}
        <div className="p-8">
          {/* Not Available Warning */}
          {driverStatus !== 'available' && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-900 text-lg mb-1">
                    You're currently {driverStatus}
                  </h3>
                  <p className="text-orange-800 text-sm">
                    Change your status to "Available" to start receiving ride requests from customers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requests List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading incoming requests...</h3>
              <p className="text-gray-500">Listening for pending orders in real-time.</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-red-900 text-lg mb-1">Failed to load requests</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          ) : driverStatus === 'available' && requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:border-purple-400/50 transition-all"
                >
                  {/* Timer Bar */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Time Remaining:</span>
                    </div>
                    <span className="text-white font-bold text-xl">
                      {formatTime(request.timeRemaining)}
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Customer Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-100">
                          <User className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {request.customerName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold text-slate-600">
                                {request.customerRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-slate-200">•</span>
                            <span className="text-sm text-slate-500">{request.serviceType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Suggested Price */}
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Suggested Price</p>
                        <p className="text-3xl font-bold text-green-600">
                          BD {request.suggestedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Route Information */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="mb-3">
                            <p className="text-xs text-slate-400 mb-1">Pickup Location</p>
                            <p className="font-semibold text-slate-800">
                              {request.fromCity} - {request.fromArea}
                            </p>
                          </div>
                          <div className="w-full h-px bg-slate-200 my-2"></div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Dropoff Location</p>
                            <p className="font-semibold text-slate-800">
                              {request.toCity} - {request.toArea}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-sm text-slate-400 mb-1">Description</p>
                      <p className="text-slate-600">{request.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-6 h-6" />
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-6 py-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 font-bold hover:bg-red-100 transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : driverStatus === 'available' && requests.length === 0 ? (
            /* Empty State - Available but No Requests */
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No incoming requests</h3>
              <p className="text-gray-500 mb-6">
                You're available! New requests will appear here automatically.
              </p>
              <button
                onClick={onNavigateToCreateOffer}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Create an Offer to Attract Customers
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
