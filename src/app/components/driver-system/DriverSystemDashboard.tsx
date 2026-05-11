import { Home, FileText, Inbox, Truck, DollarSign, Star, User, Lock, TrendingUp, CreditCard, BarChart3, ChevronLeft, ChevronRight, LogOut, MapPin, Check, Navigation } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../../../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  listenForDriverOrders,
  listenForPendingOrders,
  listenForAllDrivers,
  listenForAssignedPendingOrders,
  listenToUserProfile,
  updateDriverStatus,
  updateTripStatus,
  recordPayment,
} from '../../../services/firebaseService';
import {
  enableDemoSafeMode,
  startDemoMovement,
  startDriverLocationUpdates,
  stopDemoMovement,
} from '../../../services/googleMapsService';
import { Footer } from '../Footer';

interface DriverSystemDashboardProps {
  onNavigateToCreateOffer: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
}

export function DriverSystemDashboard({
  onNavigateToCreateOffer,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
}: DriverSystemDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline' | 'pending' | 'approved'>('offline');
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [driverName, setDriverName] = useState('Driver');
  const [rating, setRating] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [activeDeliveriesCount, setActiveDeliveriesCount] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Array<{ action: string; route: string; time: string; type: 'request' | 'completed' | 'offer' | 'payment' }>>([]);
  const [activeOrderForDemo, setActiveOrderForDemo] = useState<{
    orderId: string;
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
  } | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [newDirectRequest, setNewDirectRequest] = useState<any | null>(null);

  const userId = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!userId) return;

    const unProfile = listenToUserProfile(userId, (profile) => {
      if (!profile) return;
      setDriverName(profile.name || 'Driver');
    });

    const unDrivers = listenForAllDrivers((drivers) => {
      const me = drivers.find((driver) => driver.driverId === userId);
      if (me) {
        setDriverStatus(me.status as any);
        setApprovalStatus((me.status === 'pending' || me.status === 'approved') ? (me.status as any) : 'approved');
        setRating(me.rating || 0);
      }
    });

    const unPending = listenForPendingOrders((orders) => {
      setPendingRequestsCount(orders.length);
      setRecentActivities((previous) => {
        const pendingActivities = orders.slice(0, 4).map((order) => ({
          action: 'New request received',
          route: `${order.pickupAddress || 'Pickup'} -> ${order.dropoffAddress || 'Dropoff'}`,
          time: 'Live',
          type: 'request' as const,
        }));
        if (pendingActivities.length > 0) return pendingActivities;
        return previous;
      });
    });

    const unAssigned = listenForDriverOrders(userId, (orders) => {
      try {
        const active = orders.filter((order) => order.status === 'accepted').length;
        const completed = orders.filter((order) => order.status === 'completed').length;
        setActiveDeliveriesCount(active);
        setCompletedCount(completed);
        setTodayEarnings(completed * 2.5);

        const assignedActivities = orders.slice(0, 4).map((order) => ({
          action:
            order.status === 'completed'
              ? 'Delivery completed'
              : order.status === 'accepted'
              ? 'Trip assigned'
              : 'Order update',
          route: `${order.pickupAddress || 'Pickup'} -> ${order.dropoffAddress || 'Dropoff'}`,
          time: 'Live',
          type: order.status === 'completed' ? ('completed' as const) : ('offer' as const),
        }));
        if (assignedActivities.length > 0) {
          setRecentActivities(assignedActivities);
        }

        const firstActive = orders.find((order) => order.status === 'accepted');
        if (firstActive) {
          setActiveOrderForDemo({
            orderId: firstActive.orderId,
            pickup: firstActive.pickupLocation || { lat: 0, lng: 0 },
            dropoff: firstActive.dropoffLocation || { lat: 0, lng: 0 },
          });
        } else {
          setActiveOrderForDemo(null);
        }
      } catch (err) {
        console.error('DriverDashboard: Error processing orders:', err);
      }
    }, (error) => {
      console.error('DriverDashboard: listenForDriverOrders error:', error);
    });

    const unPrivate = listenForAssignedPendingOrders(userId, (orders) => {
      try {
        if (orders && orders.length > 0) {
          setNewDirectRequest(orders[0]);
        } else {
          setNewDirectRequest(null);
        }
      } catch (err) {
        console.error('DriverDashboard: Error processing assigned orders:', err);
      }
    }, (error) => {
      console.error('DriverDashboard: listenForAssignedPendingOrders error:', error);
    });

    return () => {
      unProfile();
      unDrivers();
      unPending();
      unAssigned();
      unPrivate();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (driverStatus === 'offline') return;
    const stopUpdates = startDriverLocationUpdates(userId, { intervalMs: 5000 });
    return () => stopUpdates();
  }, [userId, driverStatus]);

  useEffect(() => {
    if (!userId) return;
    const checkDriverDoc = async () => {
      const docRef = doc(db, "drivers", userId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        console.warn("Driver document MISSING in 'drivers' collection!");
        // attempt to auto-create if missing
        try {
          const userSnap = await getDoc(doc(db, "users", userId));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            await setDoc(docRef, {
              driverId: userId,
              name: userData.name || "Driver",
              phone: userData.phone || "",
              carType: userData.vehicleType || "sedan",
              area: userData.city || "amwaj",
              status: "available",
              currentLocation: { lat: 26.2235, lng: 50.5876 },
              rating: 5,
              totalTrips: 0,
              createdAt: serverTimestamp()
            });
            alert("Fixed! Your driver profile was missing in the 'drivers' collection and has been recreated. Please refresh the passenger app.");
          }
        } catch (e) {
          console.error("Auto-fix failed", e);
        }
      }
    };
    checkDriverDoc();
  }, [userId]);

  useEffect(() => {
    return () => {
      stopDemoMovement();
    };
  }, []);

  const completionRate = useMemo(() => {
    const total = completedCount + activeDeliveriesCount;
    if (total === 0) return 0;
    return Math.round((completedCount / total) * 100);
  }, [completedCount, activeDeliveriesCount]);

  const handleStatusChange = async (nextStatus: 'available' | 'busy' | 'offline') => {
    if (approvalStatus === 'pending') {
      alert("Your account is still pending approval. You cannot go online yet.");
      return;
    }
    setDriverStatus(nextStatus);
    if (!userId) return;
    try {
      await updateDriverStatus(userId, nextStatus);
    } catch (error) {
      console.error('Failed to update driver status:', error);
    }
  };

  const handleStartDemoMovement = async () => {
    if (!userId || !activeOrderForDemo) {
      alert('No active accepted order to simulate.');
      return;
    }
    try {
      enableDemoSafeMode();
      await startDemoMovement(
        activeOrderForDemo.orderId,
        userId,
        activeOrderForDemo.pickup,
        activeOrderForDemo.dropoff,
      );
      setDemoRunning(true);
    } catch (error) {
      console.error('Failed to start demo movement:', error);
      alert('Failed to start demo movement.');
    }
  };

  const handleStopDemoMovement = () => {
    stopDemoMovement();
    setDemoRunning(false);
  };

  return (
    <div className="size-full flex bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Collapsible Left Sidebar */}
      <aside
        className={`bg-gradient-to-b from-purple-600 to-blue-600 text-white flex-shrink-0 flex flex-col relative transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-purple-600 hover:text-purple-800 hover:shadow-lg transition-all duration-200"
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-white/10 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {!sidebarCollapsed && (
              <h2 className="font-bold text-lg whitespace-nowrap">Driver System</h2>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
          {[
            { label: 'Dashboard', icon: Home, onClick: undefined, active: true, badge: 0 },
            { label: 'My Offers', icon: FileText, onClick: onNavigateToMyOffers, active: false, badge: 0 },
            { label: 'Incoming', icon: Inbox, onClick: onNavigateToIncomingRequests, active: false, badge: pendingRequestsCount },
            { label: 'Active Deliveries', icon: Truck, onClick: onNavigateToActiveDeliveries, active: false, badge: activeDeliveriesCount },
            { label: 'Earnings', icon: DollarSign, onClick: onNavigateToEarnings, active: false, badge: 0 },
            { label: 'Reviews', icon: Star, onClick: onNavigateToReviews, active: false, badge: 0 },
            { label: 'Profile', icon: User, onClick: onNavigateToProfile, active: false, badge: 0 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full py-3 flex items-center transition-all duration-200 relative group ${
                sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-6'
              } ${
                item.active
                  ? 'bg-white/10 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`ml-auto text-white text-xs px-2 py-0.5 rounded-full ${
                      item.label === 'Incoming' ? 'bg-red-500' : 'bg-green-500'
                    }`}>{item.badge}</span>
                  )}
                </>
              )}
              {/* Badge dot when collapsed */}
              {sidebarCollapsed && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" />
              )}
              {/* Tooltip when collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer — Profile + Logout */}
        {!sidebarCollapsed ? (
          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Driver</p>
                <p className="text-xs text-white/70 truncate">{driverName}</p>
              </div>
            </div>
            <button
              onClick={() => signOut(auth).catch(console.error)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-200 transition-all duration-200 border border-red-400/20"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={() => signOut(auth).catch(console.error)}
              title="Logout"
              className="relative group w-9 h-9 rounded-xl bg-red-500/15 hover:bg-red-500/30 flex items-center justify-center transition-all duration-200"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                Logout
              </div>
            </button>
          </div>
        )}
      </aside>

      {newDirectRequest && (
        <div className="fixed bottom-24 right-8 bg-white border-2 border-purple-500 rounded-2xl shadow-2xl p-6 z-[100] animate-bounce max-w-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600 fill-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">New Direct Request!</h3>
              <p className="text-sm text-slate-500">{newDirectRequest.userName} picked you specifically.</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToIncomingRequests}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            View Request
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome, {driverName}</h1>
                <p className="text-slate-500 mt-1">Manage your deliveries and earnings</p>
              </div>

              {approvalStatus === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold text-sm">Account Pending Approval</span>
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => handleStatusChange('available')}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  driverStatus === 'available'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-200/50'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => handleStatusChange('busy')}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  driverStatus === 'busy'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-200/50'
                }`}
              >
                Busy
              </button>
              <button
                onClick={() => handleStatusChange('offline')}
                className={`px-5 py-2 rounded-full font-semibold transition-all ${
                  driverStatus === 'offline'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                    : 'text-slate-500 hover:bg-slate-200/50'
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Active Trip Controls */}
          {activeOrderForDemo && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 shadow-xl text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Active Trip Management</h2>
                  <p className="text-purple-100">Order ID: {activeOrderForDemo.orderId}</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30 animate-pulse">
                  <span className="font-bold">LIVE TRACKING ACTIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <button
                  onClick={handleStartDemoMovement}
                  disabled={demoRunning}
                  className="bg-white text-purple-700 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-all disabled:opacity-50"
                >
                  <Navigation className="w-6 h-6" />
                  {demoRunning ? 'Moving...' : 'Start Driving'}
                </button>

                <button
                  onClick={async () => {
                    try {
                      await updateTripStatus(activeOrderForDemo.orderId, 'driver_arrived', 'driver');
                      alert('Status updated: Arrived at pickup!');
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="bg-purple-500/30 border-2 border-white/50 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                >
                  <MapPin className="w-6 h-6" />
                  Arrived at Pickup
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Complete this trip and request payment?')) {
                      try {
                        await recordPayment(activeOrderForDemo.orderId, 'cash', 5.0);
                        alert('Trip completed!');
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }}
                  className="bg-green-500 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg"
                >
                  <Check className="w-6 h-6" />
                  Complete Trip
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            {/* Active Offers */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1 font-medium">Active Offers</p>
              <p className="text-3xl font-bold text-slate-900">0</p>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Inbox className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1 font-medium">Pending Requests</p>
              <p className="text-3xl font-bold text-slate-900">{pendingRequestsCount}</p>
            </div>

            {/* Today's Earnings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-green-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1 font-medium">Today's Earnings</p>
              <p className="text-3xl font-bold text-slate-900">BD {todayEarnings.toFixed(2)}</p>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-yellow-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1 font-medium">Rating</p>
              <div className="flex items-center gap-1">
                <p className="text-3xl font-bold text-slate-900">{rating.toFixed(1)}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
            </div>
          </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={onNavigateToCreateOffer}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all hover:scale-[1.02] border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Create New Offer</p>
                  <p className="text-sm text-white/80">Publish delivery offer</p>
                </div>
              </div>
            </button>

            <button
              onClick={onNavigateToMyOffers}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-purple-400/30 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-slate-900">View My Offers</p>
                  <p className="text-sm text-slate-500">Manage your live offers</p>
                </div>
              </div>
            </button>

            <button
              onClick={onNavigateToIncomingRequests}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-blue-400/30 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Inbox className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg text-slate-900">Check Requests</p>
                  <p className="text-sm text-slate-500">{pendingRequestsCount} pending requests</p>
                </div>
              </div>
            </button>
          </div>
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <button
              onClick={handleStartDemoMovement}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all shadow-md"
            >
              Start Demo Movement
            </button>
            <button
              onClick={handleStopDemoMovement}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Stop Demo Movement
            </button>
            <span className={`text-sm font-semibold ${demoRunning ? 'text-green-600' : 'text-slate-400'}`}>
              {demoRunning ? 'Demo mode running' : 'Demo mode idle'}
            </span>
          </div>
        </div>

          {/* Future Features Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Future Features</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* Live Tracking */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-md opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Live Tracking</p>
                    <p className="text-xs text-gray-500">Real-time GPS tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1.5 rounded-full w-fit">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 font-semibold text-xs">Coming Soon 🔒</span>
                </div>
              </div>

              {/* Payments */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-md opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Payments</p>
                    <p className="text-xs text-gray-500">Direct payment processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1.5 rounded-full w-fit">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 font-semibold text-xs">Coming Soon 🔒</span>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-md opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">Analytics</p>
                    <p className="text-xs text-gray-500">Performance insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-200 px-3 py-1.5 rounded-full w-fit">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 font-semibold text-xs">Coming Soon 🔒</span>
                </div>
              </div>
            </div>
          </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentActivities.length === 0 ? (
                <div className="p-5 text-sm text-slate-400">No recent order activity yet.</div>
              ) : recentActivities.map((activity, index) => (
                <div key={index} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        activity.type === 'request' ? 'bg-blue-50 border-blue-100' :
                        activity.type === 'completed' ? 'bg-green-50 border-green-100' :
                        activity.type === 'offer' ? 'bg-purple-50 border-purple-100' :
                        'bg-yellow-50 border-yellow-100'
                      }`}>
                        {activity.type === 'request' && <Inbox className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'completed' && <Truck className="w-5 h-5 text-green-600" />}
                        {activity.type === 'offer' && <FileText className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-500">{activity.route}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer for Driver */}
      <Footer
        role="driver"
        onNavigate={(screen) => {
          if (screen === 'dashboard') return;
          if (screen === 'my-offers') onNavigateToMyOffers();
          else if (screen === 'earnings') onNavigateToEarnings();
          else if (screen === 'reviews') onNavigateToReviews();
          else if (screen === 'incoming-requests') onNavigateToIncomingRequests();
        }}
      />
    </main>
    </div>
  );
}
