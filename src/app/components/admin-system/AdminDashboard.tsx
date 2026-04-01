import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { AdminRealtimeMap } from './AdminRealtimeMap';
import { Users, Car, Navigation, Package, TrendingUp, TrendingDown, MapPin, User, Phone, X, CheckCircle, AlertTriangle, DollarSign, MessageSquare, Plus, Bell, Ban, Crosshair, ZoomIn, Clock, Wifi, CreditCard, Truck, Server, Activity, Globe, Zap, FileText, Moon, ChevronDown } from 'lucide-react';
import { listenForAllDrivers, listenForAllOrders, listenForAllUsers } from '../../../services/firebaseService';

interface AdminDashboardProps {
  onNavigate: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'driver' | 'user' | 'complaint';
  status?: 'available' | 'busy';
  name: string;
  phone?: string;
  info?: string;
  eta?: string;
  distance?: string;
}

interface ActivityItem {
  id: string;
  type: 'trip' | 'payment' | 'violation' | 'complaint' | 'user';
  message: string;
  time: string;
  userName: string;
  color: string;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [mapFilter, setMapFilter] = useState<'all' | 'available' | 'busy' | 'complaints' | 'nearest'>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalDriversCount, setTotalDriversCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const unUsers = listenForAllUsers((users) => setTotalUsersCount(users.length));
    const unDrivers = listenForAllDrivers((drivers) => setTotalDriversCount(drivers.length));
    const unOrders = listenForAllOrders((orders) => {
      setTotalOrdersCount(orders.length);
      setPendingOrdersCount(orders.filter((order) => order.status === 'pending').length);
    });
    return () => {
      unUsers();
      unDrivers();
      unOrders();
    };
  }, []);

  const stats = [
    { 
      title: 'Total Users', 
      value: String(totalUsersCount), 
      change: '+12%',
      trend: 'up',
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      miniData: [20, 35, 28, 45, 38, 50, 55]
    },
    { 
      title: 'Active Drivers', 
      value: String(totalDriversCount), 
      change: '+8%',
      trend: 'up',
      icon: Car, 
      gradient: 'from-green-500 to-green-600',
      miniData: [10, 15, 12, 20, 18, 25, 28]
    },
    { 
      title: 'Total Orders', 
      value: String(totalOrdersCount), 
      change: '+15%',
      trend: 'up',
      icon: Navigation, 
      gradient: 'from-[#5B4FE5] to-[#7C6FFF]',
      miniData: [40, 55, 48, 60, 52, 58, 65]
    },
    { 
      title: 'Pending Orders', 
      value: String(pendingOrdersCount), 
      change: '+15%',
      trend: 'up',
      icon: Package, 
      gradient: 'from-orange-500 to-orange-600',
      miniData: [15, 20, 18, 28, 25, 32, 35]
    },
  ];

  const markers: MapMarker[] = [
    { id: 'D1', lat: 26.2285, lng: 50.5860, type: 'driver', status: 'available', name: 'Ahmed Hassan', phone: '+973 3333 1111', eta: '6 min', distance: '2.4 km' },
    { id: 'D2', lat: 26.2385, lng: 50.5960, type: 'driver', status: 'busy', name: 'Mohammed Saleh', phone: '+973 3333 2222', eta: '12 min', distance: '4.1 km' },
    { id: 'D3', lat: 26.2185, lng: 50.5760, type: 'driver', status: 'available', name: 'Ali Hassan', phone: '+973 3333 3333', eta: '8 min', distance: '3.2 km' },
    { id: 'D4', lat: 26.2335, lng: 50.5710, type: 'driver', status: 'available', name: 'Khalid Ahmed', phone: '+973 3333 4444', eta: '5 min', distance: '1.8 km' },
    { id: 'D5', lat: 26.2220, lng: 50.5880, type: 'driver', status: 'busy', name: 'Youssef Ali', phone: '+973 3333 5555', eta: '10 min', distance: '3.5 km' },
    { id: 'U1', lat: 26.2335, lng: 50.5810, type: 'user', name: 'Sara Ahmed', phone: '+973 3444 1111', info: 'Waiting for ride' },
    { id: 'C1', lat: 26.2250, lng: 50.5920, type: 'complaint', name: 'Complaint C001', info: 'Service quality issue' },
    { id: 'C2', lat: 26.2300, lng: 50.5780, type: 'complaint', name: 'Complaint C002', info: 'Late arrival' },
  ];

  // Cluster markers that are close together
  const getClusteredMarkers = () => {
    const filtered = markers.filter(marker => {
      if (mapFilter === 'all') return true;
      if (mapFilter === 'available') return marker.type === 'driver' && marker.status === 'available';
      if (mapFilter === 'busy') return marker.type === 'driver' && marker.status === 'busy';
      if (mapFilter === 'complaints') return marker.type === 'complaint';
      if (mapFilter === 'nearest') {
        const nearest = markers
          .filter(m => m.type === 'driver' && m.status === 'available')
          .sort((a, b) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'))[0];
        return marker.id === nearest?.id;
      }
      return true;
    });

    // Simple clustering - group markers within 0.01 degrees
    const clusters: { markers: MapMarker[], lat: number, lng: number }[] = [];
    const processed = new Set<string>();

    filtered.forEach(marker => {
      if (processed.has(marker.id)) return;

      const nearby = filtered.filter(m => 
        !processed.has(m.id) &&
        Math.abs(m.lat - marker.lat) < 0.01 &&
        Math.abs(m.lng - marker.lng) < 0.01
      );

      if (nearby.length > 1) {
        clusters.push({
          markers: nearby,
          lat: nearby.reduce((sum, m) => sum + m.lat, 0) / nearby.length,
          lng: nearby.reduce((sum, m) => sum + m.lng, 0) / nearby.length
        });
        nearby.forEach(m => processed.add(m.id));
      }
    });

    return { individual: filtered.filter(m => !processed.has(m.id)), clusters };
  };

  const { individual, clusters } = getClusteredMarkers();

  const nearestDriver = markers
    .filter(m => m.type === 'driver' && m.status === 'available')
    .sort((a, b) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'))[0];

  const activities: ActivityItem[] = [
    { id: '1', type: 'trip', message: 'Trip completed successfully', time: '2 mins ago', userName: 'Ahmed Ali', color: 'text-green-600' },
    { id: '2', type: 'payment', message: 'Payment refunded to customer', time: '15 mins ago', userName: 'Sara Ahmed', color: 'text-purple-600' },
    { id: '3', type: 'violation', message: 'Warning sent to driver', time: '1 hour ago', userName: 'Ali Hassan', color: 'text-red-600' },
    { id: '4', type: 'complaint', message: 'New complaint submitted', time: '2 hours ago', userName: 'Noora Saleh', color: 'text-orange-600' },
    { id: '5', type: 'user', message: 'New user registered', time: '3 hours ago', userName: 'Mohammed Ali', color: 'text-blue-600' },
  ];

  const quickActions = [
    { icon: Plus, label: 'Create Trip', gradient: 'from-blue-500 to-blue-600', onClick: () => onNavigate('trips') },
    { icon: Car, label: 'Assign Driver', gradient: 'from-green-500 to-green-600', onClick: () => onNavigate('drivers') },
    { icon: MessageSquare, label: 'View Complaints', gradient: 'from-orange-500 to-orange-600', onClick: () => onNavigate('complaints') },
    { icon: FileText, label: 'Create Report', gradient: 'from-purple-500 to-purple-600', onClick: () => onNavigate('reports') },
  ];

  const systemHealth = [
    { icon: Server, label: 'Server Status', value: 'Online', status: 100, color: 'text-green-600', bg: 'bg-green-50', barColor: 'bg-green-500' },
    { icon: Zap, label: 'API Response', value: '45ms', status: 95, color: 'text-blue-600', bg: 'bg-blue-50', barColor: 'bg-blue-500' },
    { icon: Activity, label: 'Active Sessions', value: '234', status: 78, color: 'text-purple-600', bg: 'bg-purple-50', barColor: 'bg-purple-500' },
    { icon: AlertTriangle, label: 'Failed Requests', value: '3', status: 20, color: 'text-orange-600', bg: 'bg-orange-50', barColor: 'bg-orange-500' },
  ];

  const topLocations = [
    { city: 'Manama', metric: 'Most Active', value: '1,245 trips', icon: Navigation, color: 'from-blue-500 to-blue-600', percentage: 85 },
    { city: 'Muharraq', metric: 'Most Complaints', value: '12 issues', icon: MessageSquare, color: 'from-orange-500 to-orange-600', percentage: 25 },
    { city: 'Riffa', metric: 'Fastest Delivery', value: '18 min avg', icon: Zap, color: 'from-green-500 to-green-600', percentage: 95 },
    { city: 'Isa Town', metric: 'Avg Delivery Time', value: '22 min', icon: Clock, color: 'from-purple-500 to-purple-600', percentage: 70 },
  ];

  // Monthly performance data
  const monthlyData = [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 61 },
    { month: 'May', value: 58 },
    { month: 'Jun', value: 65 },
    { month: 'Jul', value: 70 },
  ];
  const monthlyMaxValue = Math.max(...monthlyData.map((d) => d.value));
  const monthlyLinePoints = monthlyData
    .map((d, idx) => {
      const x = monthlyData.length <= 1 ? 0 : (idx * 100) / (monthlyData.length - 1);
      const y = 100 - (d.value / monthlyMaxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const complaintsData = [
    { status: 'Resolved', count: 45, total: 60, color: 'text-green-600', bg: 'bg-green-500' },
    { status: 'In Progress', count: 12, total: 60, color: 'text-orange-600', bg: 'bg-orange-500' },
    { status: 'Pending', count: 3, total: 60, color: 'text-red-600', bg: 'bg-red-500' },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'trip': return <Navigation className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'violation': return <AlertTriangle className="w-4 h-4" />;
      case 'complaint': return <MessageSquare className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="size-full flex bg-gradient-to-br from-gray-50 to-blue-50/30">
      <AdminSidebar activePage="dashboard" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-500 text-lg font-normal">Welcome back, Admin GoLocal</p>
          </div>

          {/* Stats Cards with Sparklines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-[20px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
                      stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 animate-bounce-slow" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-xs font-bold">{stat.change}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-gray-500 text-sm font-semibold mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800 mb-3">{stat.value}</p>
                  
                  {/* Mini Sparkline */}
                  <div className="flex items-end gap-0.5 h-10">
                    {stat.miniData.map((value, i) => (
                      <div
                        key={i}
                        className={`flex-1 bg-gradient-to-t ${stat.gradient} rounded-t-sm opacity-40 group-hover:opacity-70 transition-all duration-300`}
                        style={{ 
                          height: `${(value / Math.max(...stat.miniData)) * 100}%`,
                          transitionDelay: `${i * 50}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-[20px] flex items-center justify-center p-4 pointer-events-none">
                  <p className="text-white text-sm text-center font-semibold">
                    {stat.trend === 'up' ? '📈 Increased' : '📉 Decreased'} {stat.change} from last month
                  </p>
                </div>
              </div>
            ))}
          </div>

          <AdminRealtimeMap />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Enhanced Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-lg rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Live Map</h2>
                  
                  {/* Enhanced Segmented Control */}
                  <div className="flex items-center gap-3">
                    <div className="inline-flex bg-gray-100/80 backdrop-blur rounded-2xl p-1.5 shadow-inner">
                      {(['all', 'available', 'busy', 'complaints', 'nearest'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setMapFilter(filter)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                            mapFilter === filter
                              ? 'bg-white text-gray-800 shadow-md scale-105'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Map Controls */}
                    <button className="w-10 h-10 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm transition-all hover:shadow-md">
                      <Crosshair className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm transition-all hover:shadow-md">
                      <ZoomIn className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Dark Toned Map Container */}
                <div className="relative h-[500px] bg-gradient-to-br from-gray-800 via-gray-700 to-blue-900 rounded-[20px] overflow-hidden border border-gray-600 shadow-inner">
                  {/* Blur Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-gray-900/30 backdrop-blur-sm"></div>
                  
                  {/* Subtle Grid Pattern */}
                  <div className="absolute inset-0 opacity-[0.08]">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  </div>

                  {/* Individual Markers */}
                  {individual.map((marker) => (
                    <div
                      key={marker.id}
                      onClick={() => setSelectedMarker(marker)}
                      onMouseEnter={() => setHoveredMarker(marker)}
                      onMouseLeave={() => setHoveredMarker(null)}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-10"
                      style={{
                        left: `${((marker.lng - 50.5) / 0.15) * 100}%`,
                        top: `${((26.25 - marker.lat) / 0.08) * 100}%`,
                      }}
                    >
                      {/* Marker Pin */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-125 transition-all duration-200 ${
                        marker.type === 'driver' && marker.status === 'available'
                          ? 'bg-gradient-to-br from-green-400 to-green-600 border-2 border-white'
                          : marker.type === 'driver' && marker.status === 'busy'
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white'
                          : marker.type === 'complaint'
                          ? 'bg-gradient-to-br from-red-400 to-red-600 border-4 border-white shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white'
                      }`}>
                        {marker.type === 'driver' ? <Car className="w-6 h-6 text-white" /> : 
                         marker.type === 'complaint' ? <AlertTriangle className="w-6 h-6 text-white" /> :
                         <User className="w-6 h-6 text-white" />}
                      </div>

                      {/* Pulsing Animation */}
                      {marker.type === 'driver' && marker.status === 'available' && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                          <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50"></div>
                        </>
                      )}

                      {/* Glow for Complaints */}
                      {marker.type === 'complaint' && (
                        <div className="absolute inset-0 rounded-full bg-red-500 blur-xl opacity-60 animate-pulse"></div>
                      )}

                      {/* Enhanced Hover Card */}
                      {hoveredMarker?.id === marker.id && (
                        <div className="absolute -top-36 left-1/2 -translate-x-1/2 z-20 animate-fadeIn">
                          <div className="bg-white rounded-2xl shadow-2xl p-4 w-56 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                marker.status === 'available' ? 'bg-green-100' : 
                                marker.status === 'busy' ? 'bg-orange-100' : 'bg-blue-100'
                              }`}>
                                {marker.type === 'driver' ? <Car className="w-5 h-5 text-gray-700" /> : 
                                 marker.type === 'complaint' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                                 <User className="w-5 h-5 text-blue-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">{marker.name}</p>
                                {marker.status && (
                                  <p className={`text-xs font-semibold ${
                                    marker.status === 'available' ? 'text-green-600' : 'text-orange-600'
                                  }`}>
                                    {marker.status === 'available' ? '🟢 Available' : '🟠 Busy'}
                                  </p>
                                )}
                              </div>
                            </div>
                            {marker.eta && (
                              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>ETA: {marker.eta}</span>
                                <span className="text-gray-400">•</span>
                                <MapPin className="w-3 h-3" />
                                <span>{marker.distance}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-3">
                              <button className="flex-1 px-3 py-2 bg-gradient-to-r from-[#5B4FE5] to-[#7C6FFF] text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all">
                                View
                              </button>
                              {marker.type === 'driver' && marker.status === 'available' && (
                                <button className="flex-1 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:shadow-lg transition-all">
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Cluster Markers */}
                  {clusters.map((cluster, idx) => (
                    <div
                      key={`cluster-${idx}`}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-10"
                      style={{
                        left: `${((cluster.lng - 50.5) / 0.15) * 100}%`,
                        top: `${((26.25 - cluster.lat) / 0.08) * 100}%`,
                      }}
                    >
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-4 border-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-lg">{cluster.markers.length}</span>
                        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-50"></div>
                      </div>
                    </div>
                  ))}

                  {/* Nearest Driver Card */}
                  {nearestDriver && mapFilter !== 'nearest' && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200 w-64 animate-slideInLeft">
                      <p className="text-xs font-bold text-gray-500 mb-2">NEAREST DRIVER</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                          <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{nearestDriver.name}</p>
                          <p className="text-xs text-gray-600">{nearestDriver.distance} • ETA {nearestDriver.eta}</p>
                        </div>
                      </div>
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-[#5B4FE5] to-[#7C6FFF] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all">
                        Assign Trip
                      </button>
                    </div>
                  )}

                  {/* Mini Legend */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 border border-white"></div>
                        <span className="text-xs font-semibold text-gray-700">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border border-white"></div>
                        <span className="text-xs font-semibold text-gray-700">Busy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-white"></div>
                        <span className="text-xs font-semibold text-gray-700">User</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 border border-white"></div>
                        <span className="text-xs font-semibold text-gray-700">Alert</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Activity Feed with Timeline */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3 group">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${
                          activity.type === 'trip' ? 'from-green-400 to-green-600' :
                          activity.type === 'payment' ? 'from-purple-400 to-purple-600' :
                          activity.type === 'violation' ? 'from-red-400 to-red-600' :
                          activity.type === 'user' ? 'from-blue-400 to-blue-600' :
                          'from-orange-400 to-orange-600'
                        }`}>
                          <div className="text-white">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        {index < activities.length - 1 && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent mt-2"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-gray-50 group-hover:bg-gray-100 rounded-2xl p-3 transition-all duration-150">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(activity.userName)}
                            </div>
                            <p className="text-xs font-bold text-gray-600">{activity.userName}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mb-1">{activity.message}</p>
                          <p className="text-xs text-gray-500 font-normal">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Performance & Support Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Performance with Line Chart */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Monthly Performance</h2>
                  <p className="text-sm text-gray-500 font-normal mt-1">Trip completion rate</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50">
                  <TrendingUp className="w-4 h-4 text-green-600 animate-bounce-slow" />
                  <span className="text-sm font-bold text-green-600">+15% vs last month</span>
                </div>
              </div>
              
              {/* Mini Line Chart */}
              <div className="relative h-48 flex items-end justify-between gap-2">
                {/* Single SVG line (no per-segment math, avoids NaN/slashes) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="monthlyLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5B4FE5" />
                      <stop offset="100%" stopColor="#7C6FFF" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={monthlyLinePoints}
                    fill="none"
                    stroke="url(#monthlyLineGradient)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>

                {monthlyData.map((data, idx) => {
                  const heightPercent = (data.value / monthlyMaxValue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div
                        className="w-full bg-gradient-to-t from-[#5B4FE5] to-[#7C6FFF] rounded-t-lg transition-all duration-300 group-hover:opacity-100 opacity-80 relative"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold">
                          {data.value}%
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support & Complaints with Progress Rings */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Support & Complaints</h2>
              
              <div className="space-y-6">
                {complaintsData.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('complaints')}
                    className="w-full flex items-center gap-4 group hover:bg-gray-50 p-3 rounded-2xl transition-all duration-150"
                  >
                    {/* Progress Ring */}
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        {/* Background circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#E5E7EB"
                          strokeWidth="6"
                          fill="none"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={item.bg.replace('bg-', '')}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${(item.count / item.total) * 175.93} 175.93`}
                          strokeLinecap="round"
                          className={`${item.bg} transition-all duration-500`}
                          style={{ stroke: item.bg.includes('green') ? '#22c55e' : item.bg.includes('orange') ? '#f97316' : '#ef4444' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-800">{item.status}</p>
                      <p className="text-sm text-gray-500 font-normal">{item.count} of {item.total} total</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full ${item.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${(item.count / item.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* New Sections: System Health & Top Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* System Health Panel */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">System Health</h2>
              
              <div className="space-y-4">
                {systemHealth.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                        <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${item.status}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations Analytics */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Locations</h2>
              
              <div className="space-y-4">
                {topLocations.map((location, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate('reports')}
                    className="w-full group hover:bg-gray-50 p-3 rounded-2xl transition-all duration-150 text-left"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${location.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <location.icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                              {location.city}
                            </span>
                            <span className="text-xs text-gray-500 font-normal">{location.metric}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-800">{location.value}</p>
                        </div>
                        
                        {/* Bar Indicator */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${location.color} rounded-full transition-all duration-500`}
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Quick Actions Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5B4FE5] to-[#7C6FFF] text-white shadow-[0_8px_30px_rgba(91,79,229,0.4)] hover:shadow-[0_12px_40px_rgba(91,79,229,0.6)] transition-all duration-300 flex items-center justify-center group"
        >
          <Plus className={`w-7 h-7 transition-transform duration-300 ${showQuickActions ? 'rotate-45' : ''}`} />
        </button>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <div className="absolute bottom-20 right-0 space-y-3 animate-fadeIn">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  setShowQuickActions(false);
                }}
                className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all group w-56 animate-slideInRight"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-800">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Slide-in Panel */}
      {selectedMarker && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setSelectedMarker(null)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 animate-slideInRight overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Details</h3>
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div className={`w-20 h-20 rounded-[20px] flex items-center justify-center shadow-lg mx-auto bg-gradient-to-br ${
                  selectedMarker.type === 'driver' && selectedMarker.status === 'available'
                    ? 'from-green-400 to-green-600'
                    : selectedMarker.type === 'driver' && selectedMarker.status === 'busy'
                    ? 'from-orange-400 to-orange-600'
                    : selectedMarker.type === 'complaint'
                    ? 'from-red-400 to-red-600'
                    : 'from-blue-400 to-blue-600'
                }`}>
                  {selectedMarker.type === 'driver' ? <Car className="w-10 h-10 text-white" /> : 
                   selectedMarker.type === 'complaint' ? <AlertTriangle className="w-10 h-10 text-white" /> :
                   <User className="w-10 h-10 text-white" />}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">ID</p>
                    <p className="text-lg font-bold text-gray-800">{selectedMarker.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Name</p>
                    <p className="text-lg font-bold text-gray-800">{selectedMarker.name}</p>
                  </div>
                  {selectedMarker.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700 font-normal">{selectedMarker.phone}</p>
                    </div>
                  )}
                  {selectedMarker.status && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        selectedMarker.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedMarker.status === 'available' ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  )}
                </div>

                {selectedMarker.type === 'driver' && (
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-[#5B4FE5] to-[#7C6FFF] text-white font-bold hover:shadow-lg transition-all">
                      Assign Trip
                    </button>
                    <button className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all">
                      View Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}