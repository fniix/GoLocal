import { ArrowLeft, MapPin, Navigation, Clock, DollarSign, Truck, Car, ShoppingBag, Users, Home, Search, History, Bell, User } from 'lucide-react';
import { useState } from 'react';

interface HomeScreenProps {
  onBack: () => void;
  userName?: string;
  userCity?: string;
  onSelectService: (serviceType: string) => void;
  onViewHistory: () => void;
  onViewProfile: () => void;
  onViewSearch: () => void;
  onViewActivity: () => void;
  selectedDestination?: { location: string; area?: string } | null;
}

export function HomeScreen({ onBack, userName, userCity = 'manama', onSelectService, onViewHistory, onViewProfile, onViewSearch, onViewActivity, selectedDestination }: HomeScreenProps) {
  // Check if user is a guest (not logged in)
  const isGuest = !userName || userName === '';

  // Zoom state (1 = default, 2 = zoomed in, 0.5 = zoomed out)
  const [zoomLevel, setZoomLevel] = useState(1);

  // Bahrain regions with approximate coordinates and city keys
  const bahrainRegions = [
    { name: 'Manama', key: 'manama', lat: 26.2285, lng: 50.5860 },
    { name: 'Muharraq', key: 'muharraq', lat: 26.2572, lng: 50.6119 },
    { name: 'Riffa', key: 'riffa', lat: 26.1300, lng: 50.5550 },
    { name: 'Hamad Town', key: 'hamad-town', lat: 26.1146, lng: 50.4914 },
    { name: 'Isa Town', key: 'isa-town', lat: 26.1736, lng: 50.5478 },
    { name: 'Sitra', key: 'sitra', lat: 26.1500, lng: 50.6167 },
    { name: 'Budaiya', key: 'budaiya', lat: 26.2050, lng: 50.4480 },
    { name: 'Jidhafs', key: 'jidhafs', lat: 26.2100, lng: 50.5200 },
    { name: 'Sanabis', key: 'sanabis', lat: 26.2236, lng: 50.5678 },
    { name: 'Tubli', key: 'tubli', lat: 26.2100, lng: 50.5900 },
    { name: 'Adliya', key: 'adliya', lat: 26.2158, lng: 50.5789 },
    { name: 'Seef', key: 'seef', lat: 26.2361, lng: 50.5325 },
    { name: 'Amwaj Islands', key: 'amwaj', lat: 26.2850, lng: 50.6580 },
    { name: 'Durrat Al Bahrain', key: 'durrat-al-bahrain', lat: 25.8167, lng: 50.5833 },
  ];

  // Find the current location based on userCity, default to Manama
  const currentRegion = bahrainRegions.find(region => region.key === userCity) || bahrainRegions[0];
  const [currentLocation] = useState(currentRegion);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleResetLocation = () => {
    setZoomLevel(1);
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get display name - show "Guest" for unauthenticated users
  const displayName = isGuest ? 'Guest' : (userName.split(' ')[0] || 'User');

  // Handle service selection - allow all users to browse services
  const handleServiceClick = (serviceType: string) => {
    onSelectService(serviceType);
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Profile Avatar with Guest Badge */}
          <div className="flex items-center gap-2">
            {!userName && (
              <span className="text-sm bg-white/20 px-3 py-1.5 rounded-full text-white font-medium">
                Guest
              </span>
            )}
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-purple-600 font-bold text-lg">
                {userName ? userName[0].toUpperCase() : 'G'}
              </span>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-white text-3xl font-bold">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-white/90 text-sm mt-1">Where would you like to go today?</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Map Section */}
        <div className="px-6 -mt-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-64 relative">
            {/* Mock Map with Grid Pattern */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            >
              {/* Grid lines to simulate map */}
              <svg className="w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Current Location Marker (Manama) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                    <Navigation className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rotate-45"></div>
                  {/* Current Location Label */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-purple-600 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-white">
                      📍 Your Location
                      <div className="text-[10px] font-normal opacity-90">{currentLocation.name}, Bahrain</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bahrain Regions Markers */}
              {bahrainRegions.filter(region => region.key !== userCity).map((region, index) => {
                // Position based on index for demo purposes
                const positions = [
                  { top: '20%', left: '65%' }, // Muharraq
                  { top: '65%', left: '55%' }, // Riffa
                  { top: '70%', left: '35%' }, // Hamad Town
                  { top: '40%', left: '40%' }, // Isa Town
                  { top: '55%', left: '70%' }, // Sitra
                  { top: '30%', left: '20%' }, // Budaiya
                  { top: '25%', left: '50%' }, // Jidhafs
                  { top: '20%', left: '55%' }, // Sanabis
                  { top: '25%', left: '60%' }, // Tubli
                  { top: '30%', left: '55%' }, // Adliya
                  { top: '25%', left: '50%' }, // Seef
                  { top: '15%', left: '70%' }, // Amwaj Islands
                  { top: '50%', left: '30%' }, // Durrat Al Bahrain
                ];
                const position = positions[index] || { top: '30%', left: '30%' };

                return (
                  <div
                    key={region.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: position.top, left: position.left }}
                  >
                    <div className="relative group cursor-pointer">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
                      {/* Region Label - shows on hover */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white px-2 py-1 rounded-lg shadow-md text-xs font-semibold text-gray-800 border border-blue-200">
                          {region.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Selected Destination Marker */}
              {selectedDestination && (
                <div className="absolute top-1/4 right-1/3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45"></div>
                    {/* Location Label */}
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-red-600 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-white">
                        🎯 {selectedDestination.location}
                        {selectedDestination.area && (
                          <div className="text-[10px] font-normal opacity-90">{selectedDestination.area}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional area markers (neighborhoods/landmarks) */}
              <div className="absolute top-1/4 right-1/4">
                <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-pulse"></div>
              </div>
              <div className="absolute bottom-1/3 left-1/4">
                <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg animate-pulse"></div>
              </div>
              <div className="absolute top-1/3 left-2/3">
                <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
              </div>
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
              <div className="text-xs font-semibold text-gray-700">
                Zoom: {zoomLevel.toFixed(1)}x
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
              >
                <span className="text-gray-700 text-xl font-bold">+</span>
              </button>
              <button
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <span className="text-gray-700 text-xl font-bold">−</span>
              </button>
            </div>

            {/* Current Location Button */}
            <button
              className="absolute bottom-4 right-4 w-12 h-12 bg-purple-600 rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all"
              onClick={handleResetLocation}
            >
              <Navigation className="w-6 h-6 text-white" />
            </button>

            {/* Region Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Regions</span>
                </div>
                {selectedDestination && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Destination</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="px-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Services</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Private Driver Card */}
            <button
              onClick={() => handleServiceClick('private-driver')}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all active:scale-95"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-3">
                <Car className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-left">Private Driver</h3>
              <p className="text-xs text-gray-500 mt-1 text-left">Quick rides</p>
            </button>

            {/* Private Bus Card */}
            <button
              onClick={() => handleServiceClick('private-bus')}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all active:scale-95"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-3">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-left">Private Bus</h3>
              <p className="text-xs text-gray-500 mt-1 text-left">Group travel</p>
            </button>

            {/* OnTheWay Card */}
            <button
              onClick={() => handleServiceClick('ontheway')}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all active:scale-95"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-3">
                <MapPin className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-800 text-left">OnTheWay</h3>
              <p className="text-xs text-gray-500 mt-1 text-left">Share rides</p>
            </button>

            {/* Mandoob Card */}
            <button
              onClick={() => handleServiceClick('mandoob')}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all active:scale-95"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-left">Mandoob</h3>
              <p className="text-xs text-gray-500 mt-1 text-left">Delivery</p>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button className="flex flex-col items-center text-purple-600 transition-colors">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={onViewSearch}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>

          <button
            onClick={onViewHistory}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Clock className="w-6 h-6 mb-1" />
            <span className="text-xs">History</span>
          </button>

          <button
            onClick={onViewActivity}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>

          <button
            onClick={onViewProfile}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}