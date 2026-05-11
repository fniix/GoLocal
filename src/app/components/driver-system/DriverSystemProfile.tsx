import { User, Phone, Mail, MapPin, Car, Shield, Lock, TrendingUp, CreditCard, BarChart3, FileText, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { auth } from '../../../firebase';
import { listenForDriverOrders, listenForPendingOrders, listenToDrivers, listenToUserProfile } from '../../../services/firebaseService';
import { DriverSidebar } from './DriverSidebar';

interface DriverSystemProfileProps {
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
}

export function DriverSystemProfile({
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
}: DriverSystemProfileProps) {
  const [driverName, setDriverName] = useState('Driver');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [carType, setCarType] = useState('');
  const [rating, setRating] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const userId = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!userId) return;

    const unProfile = listenToUserProfile(userId, (profile) => {
      if (!profile) return;
      setDriverName(profile.name || 'Driver');
      setPhone(profile.phone || '');
      setEmail(profile.email || '');
      setCity(profile.city || '');
    });

    const unDrivers = listenToDrivers((drivers) => {
      const me = drivers.find((driver) => driver.driverId === userId);
      if (!me) return;
      setCarType(me.carType || '');
      setRating(me.rating || 0);
    });

    const unOrders = listenForDriverOrders(userId, (orders) => {
      const completed = orders.filter((order) => order.status === 'completed').length;
      const active = orders.filter((order) => order.status === 'accepted').length;
      setCompletedDeliveries(completed);
      setActiveDeliveriesCount(active);
    });

    const unPending = listenForPendingOrders((orders) => {
      setPendingRequestsCount(orders.length);
    });

    return () => {
      unProfile();
      unDrivers();
      unOrders();
      unPending();
    };
  }, [userId]);

  const initials = useMemo(() => {
    if (!driverName) return 'D';
    return driverName.charAt(0).toUpperCase();
  }, [driverName]);

  return (
    <div className="size-full flex bg-gray-50">
      <DriverSidebar
        activePage="profile"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToMyOffers={onNavigateToMyOffers}
        onNavigateToIncomingRequests={onNavigateToIncomingRequests}
        onNavigateToActiveDeliveries={onNavigateToActiveDeliveries}
        onNavigateToEarnings={onNavigateToEarnings}
        onNavigateToReviews={onNavigateToReviews}
        onNavigateToProfile={() => {}}
        pendingRequestsCount={pendingRequestsCount}
        activeDeliveriesCount={activeDeliveriesCount}
        driverName={driverName}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Driver Profile</h1>
            <p className="text-gray-500 mt-1">View your profile information</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-8 mb-6 shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <span className="text-purple-600 font-bold text-4xl">{initials}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{driverName}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                      <span className="text-white font-semibold">{rating.toFixed(1)} Rating</span>
                    </div>
                    <div className="bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-white font-semibold">{completedDeliveries} Deliveries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">{driverName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">{phone || '-'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">{email || '-'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">City</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">{city || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-purple-600" />
                Vehicle Information
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Vehicle Type</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Car className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">{carType || '-'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Plate Number</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-800 font-semibold">ABC 1234</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                Account Status
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Managed by GoLocal System</p>
                    <p className="text-sm text-gray-600">Your account is centrally managed for security</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-semibold text-sm">Active</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Profile information is read-only. To update your details, please contact GoLocal support.
                </p>
              </div>
            </div>

            {/* Future Features - Locked Cards */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Future Features</h3>
              
              <div className="space-y-3">
                {/* Live Tracking */}
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Live Tracking</p>
                        <p className="text-sm text-gray-500">Real-time GPS tracking for deliveries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 font-semibold text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Payments</p>
                        <p className="text-sm text-gray-500">Direct payment processing & payouts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 font-semibold text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Analytics</p>
                        <p className="text-sm text-gray-500">Detailed performance insights & reports</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 font-semibold text-sm">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
