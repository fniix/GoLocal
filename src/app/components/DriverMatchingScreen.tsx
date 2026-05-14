import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, ArrowLeft, Search, Shield, Info, Loader2, Sparkles, AlertTriangle, CheckCircle2, Home } from 'lucide-react';
import { listenToDrivers, listenOrderById, DriverData, OrderData, updateOrder } from '../../services/firebaseService';
import { AISearchAnimation } from './AISearchAnimation';

const BAHRAIN_CENTER = { lat: 26.0667, lng: 50.5577 };

const DUMMY_DRIVERS: DriverData[] = [
  { driverId: 'dummy-1', name: 'Ahmed Al-Khalifa', phone: '', carType: 'Ride', status: 'available', available: true, online: true, rating: 4.9, area: 'Manama', currentLocation: { lat: 26.2285, lng: 50.5860 } },
  { driverId: 'dummy-2', name: 'Sara Yousif', phone: '', carType: 'Delivery', status: 'available', available: true, online: true, rating: 4.8, area: 'Muharraq', currentLocation: { lat: 26.2572, lng: 50.6107 } },
  { driverId: 'dummy-3', name: 'Mohamed Isa', phone: '', carType: 'Ride', status: 'available', available: true, online: true, rating: 4.7, area: 'Riffa', currentLocation: { lat: 26.1301, lng: 50.5500 } },
  { driverId: 'dummy-4', name: 'Fatima Jassim', phone: '', carType: 'Van', status: 'available', available: true, online: true, rating: 5.0, area: 'Seef', currentLocation: { lat: 26.2429, lng: 50.5436 } },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface DriverMatchingScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  pickupLocation: string;
  dropoffLocation: string;
  onDriverMatched: (driverName: string) => void;
  userCity: string;
  orderId: string | null;
  matchingMode: 'ai' | 'manual';
}

export function DriverMatchingScreen({
  onBack,
  onNavigateHome,
  pickupLocation,
  dropoffLocation,
  onDriverMatched,
  userCity,
  orderId,
  matchingMode,
}: DriverMatchingScreenProps) {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [matchedDriver, setMatchedDriver] = useState<DriverData | null>(null);
  const [searchStep, setSearchStep] = useState(0);
  const [liveOrder, setLiveOrder] = useState<OrderData | null>(null);
  const [areaFilter, setAreaFilter] = useState('');

  // AI Specific States
  const [aiSearching, setAiSearching] = useState(false);
  const [aiAlgorithmStats, setAiAlgorithmStats] = useState<any>(null);
  const [aiRecommendation, setAiRecommendation] = useState<DriverData[]>([]);
  const [aiSearchMessage, setAiSearchMessage] = useState('');
  const [aiSearchStepIndex, setAiSearchStepIndex] = useState(0);
  const [algorithmStats, setAlgorithmStats] = useState<any>(null);

  const [selectedServiceType, setSelectedServiceType] = useState<string>('Ride');

  const driversRef = useRef<DriverData[]>([]);
  const liveOrderRef = useRef<OrderData | null>(null);
  const selectedServiceTypeRef = useRef(selectedServiceType);
  driversRef.current = drivers;
  liveOrderRef.current = liveOrder;
  selectedServiceTypeRef.current = selectedServiceType;

  useEffect(() => {
    const unsubscribe = listenToDrivers(
      (items) => {
        setDrivers(items);
      },
      (error) => console.error('DriverMatching: listenToDrivers error:', error)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenOrderById(
      orderId,
      (order) => setLiveOrder(order),
      (error) => console.error('DriverMatching: listenOrderById error:', error)
    );
    return unsubscribe;
  }, [orderId]);

  const runRecommendation = useCallback(() => {
    let ignore = false;
    const timeouts: number[] = [];
    const searchSteps = [
      'Scanning map grid...',
      'Analyzing driver locations...',
      'Verifying availability in realtime...',
      'Finalizing nearest match...'
    ];

    const pickupLoc = liveOrderRef.current?.pickupLocation || BAHRAIN_CENTER;
    setAiSearching(true);
    setAiAlgorithmStats(null);
    setAiSearchStepIndex(0);
    setAiSearchMessage(searchSteps[0]);

    searchSteps.slice(1).forEach((message, index) => {
      timeouts.push(window.setTimeout(() => {
        if (!ignore) {
          setAiSearchStepIndex(index + 1);
          setAiSearchMessage(message);
        }
      }, (index + 1) * 800));
    });

    timeouts.push(window.setTimeout(() => {
      if (ignore) return;
      try {
        const visitedNodes = Math.floor(Math.random() * 8000) + 4500;
        const driversList = driversRef.current;
        const serviceType = selectedServiceTypeRef.current ?? 'Ride';
        const availableDrivers = driversList.filter(d => d.status === 'available');
        
        let candidateDrivers = availableDrivers;
        const isDelivery = serviceType.toLowerCase().includes('delivery') || serviceType.toLowerCase().includes('package');
        
        if (isDelivery) {
          const deliveryDrivers = availableDrivers.filter(d => 
            d.carType?.toLowerCase() === 'delivery' || 
            d.carType?.toLowerCase() === 'motorcycle' ||
            d.carType?.toLowerCase() === 'van'
          );
          if (deliveryDrivers.length > 0) candidateDrivers = deliveryDrivers;
        }

        if (candidateDrivers.length > 0) {
          const sorted = candidateDrivers
            .map(d => ({
              driver: d,
              distanceKm: calculateDistance(pickupLoc.lat, pickupLoc.lng, d.currentLocation?.lat || 26.2, d.currentLocation?.lng || 50.6)
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm);

          const best = sorted[0].driver;
          const dist = sorted[0].distanceKm;

          setAiRecommendation([best]);
          setAiAlgorithmStats({
            visitedNodes,
            distanceKm: dist,
            driverName: best.name,
            found: true,
          });
          setAiSearchMessage(`Nearest driver found: ${best.name} (${dist.toFixed(1)} km)`);
        } else {
          // Dummies fallback
          let finalDummies = DUMMY_DRIVERS;
          if (isDelivery) {
            const deliveryDummies = DUMMY_DRIVERS.filter(d => 
              d.carType?.toLowerCase() === 'delivery' || 
              d.carType?.toLowerCase() === 'motorcycle' ||
              d.carType?.toLowerCase() === 'van'
            );
            if (deliveryDummies.length > 0) finalDummies = deliveryDummies;
          }

          const dummyNearest = finalDummies
            .map((driver) => ({
              driver,
              distanceKm: calculateDistance(
                pickupLoc.lat,
                pickupLoc.lng,
                driver.currentLocation?.lat || 26.2,
                driver.currentLocation?.lng || 50.6,
              ),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm);

          if (dummyNearest.length > 0) {
            const best = dummyNearest[0].driver;
            const dist = dummyNearest[0].distanceKm;
            
            setAiRecommendation([best]);
            setAiAlgorithmStats({
              visitedNodes,
              distanceKm: dist,
              driverName: best.name,
              found: true,
            });
            setAiSearchMessage(`Using test driver: ${best.name} (${dist.toFixed(1)} km)`);
          } else {
            setAiRecommendation([]);
            setAiAlgorithmStats({ visitedNodes, distanceKm: null, found: false });
            setAiSearchMessage('No drivers available.');
          }
        }
      } catch (err) {
        console.error('AI Search Error:', err);
        setAiSearchMessage('Search error occurred.');
      } finally {
        if (!ignore) setAiSearching(false);
      }
    }, 3200));

    return () => {
      ignore = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (matchingMode !== 'ai') return;
    return runRecommendation();
  }, [matchingMode, runRecommendation]);

  const handleManualMatch = async (driver: DriverData) => {
    setMatchedDriver(driver);
    setIsSearching(false);
    if (orderId) {
      try {
        await updateOrder(orderId, {
          status: 'accepted',
          assignedDriverId: driver.driverId,
          assignedDriverName: driver.name,
        });
      } catch (error) {
        console.error('Failed to update order:', error);
      }
    }
    onDriverMatched(driver.name);
  };

  const handleAiConfirm = async () => {
    if (aiRecommendation.length > 0) {
      handleManualMatch(aiRecommendation[0]);
    }
  };

  return (
    <div className="size-full bg-white flex flex-col font-sans">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 pt-12 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">Finding Your Driver</h1>
            <p className="text-purple-100 text-sm opacity-90">Searching via {matchingMode === 'ai' ? 'AI Algorithm' : 'Manual Selection'}</p>
          </div>
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="p-2 hover:bg-white/10 rounded-full transition-all shrink-0"
              aria-label="Go to home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-3 border border-white/20 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">Pickup</p>
              <p className="text-sm font-medium truncate">{pickupLocation}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-400/20 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-purple-200 font-bold">Dropoff</p>
              <p className="text-sm font-medium truncate">{dropoffLocation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {matchingMode === 'ai' ? (
          <div className="size-full flex flex-col">
            <div className="flex-1 relative bg-slate-50">
              <AISearchAnimation 
                isSearching={aiSearching}
                algorithmStats={aiAlgorithmStats}
                searchMessage={aiSearchMessage}
              />
              
              <div className="absolute top-6 left-6 right-6 z-10">
                <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-4 border border-white flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${aiSearching ? 'bg-purple-100' : 'bg-green-100'}`}>
                    {aiSearching ? (
                      <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{aiSearching ? 'AI Analyzing Network' : 'Best Match Found!'}</h3>
                    <p className="text-xs text-slate-500 font-medium">{aiSearchMessage}</p>
                  </div>
                </div>
              </div>

              {!aiSearching && aiRecommendation.length > 0 && (
                <div className="absolute bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom duration-500">
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Recommendation Result</span>
                      </div>
                      <div className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold">
                        98% MATCH
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl border-2 border-slate-50 shadow-sm">
                          👨‍✈️
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-black text-slate-800 leading-tight">{aiRecommendation[0].name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                              {aiRecommendation[0].carType}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-orange-500">★</span>
                              <span className="text-xs font-bold text-slate-700">{aiRecommendation[0].rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-purple-600 leading-none">{aiAlgorithmStats?.distanceKm?.toFixed(1) || '0.8'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">km away</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleAiConfirm}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        Confirm AI Match
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="size-full flex flex-col bg-slate-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800">Available Drivers</h3>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase">
                  {drivers.length} online
                </div>
              </div>
              
              <div className="space-y-4">
                {drivers.map(driver => (
                  <div key={driver.driverId} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:border-purple-200 transition-all group">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-purple-50 transition-colors">
                      🚗
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{driver.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{driver.carType} • {driver.rating} ★</p>
                    </div>
                    <button 
                      onClick={() => handleManualMatch(driver)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700 rounded-xl font-bold text-sm transition-all"
                    >
                      Book
                    </button>
                  </div>
                ))}
                {drivers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Looking for nearby drivers...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-start gap-3 text-slate-400">
          <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] leading-relaxed">
            Safety first: all GoLocal drivers are verified and trips are tracked via GPS.
            Share your trip details with family for added security.
          </p>
        </div>
      </div>
    </div>
  );
}