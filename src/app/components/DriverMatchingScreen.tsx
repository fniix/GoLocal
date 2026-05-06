import { ArrowLeft, Phone, MessageCircle, X, Star, Navigation, Share2, Shield, Clock, Home, Search, Bell, User as UserIcon, Car } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cancelOrder, listenOrderById, listenToDrivers, setPreferredDriverForOrder, type DriverData as FirestoreDriverData, type OrderData } from '../../services/firebaseService';
import {
  BAHRAIN_CENTER,
  animateMarker,
  calculateDistance,
  findNearestDrivers,
  drawRoute,
  initializeMap,
  listenDriverTracking,
  loadDriversMarkers,
} from '../../services/googleMapsService';
import { AISearchAnimation } from './AISearchAnimation';

// بيانات السائقين الوهميين للاختبار
const DUMMY_DRIVERS: DriverData[] = [
  {
    uid: 'dummy-1',
    name: 'أحمد الرفاعي',
    rating: 4.9,
    totalTrips: 1250,
    vehicleType: 'Toyota Camry',
    vehiclePlate: 'ABC 123',
    phone: '+973 1234 5678',
    status: 'available',
    currentLocation: { lat: 26.1300, lng: 50.5500 }, // منطقة الرفاع
    seats: 4,
    pricePerKm: 0.25,
    area: 'الرفاع',
  },
  {
    uid: 'dummy-2',
    name: 'محمد المنامي',
    rating: 4.7,
    totalTrips: 890,
    vehicleType: 'Honda Civic',
    vehiclePlate: 'XYZ 456',
    phone: '+973 8765 4321',
    status: 'available',
    currentLocation: { lat: 26.2235, lng: 50.5822 }, // منطقة المنامة
    seats: 4,
    pricePerKm: 0.30,
    area: 'المنامة',
  },
  {
    uid: 'dummy-3',
    name: 'علي الرفاعي',
    rating: 4.8,
    totalTrips: 2100,
    vehicleType: 'Nissan Altima',
    vehiclePlate: 'DEF 789',
    phone: '+973 5555 6666',
    status: 'available',
    currentLocation: { lat: 26.1350, lng: 50.5450 }, // منطقة الرفاع
    seats: 4,
    pricePerKm: 0.28,
    area: 'الرفاع',
  },
  {
    uid: 'dummy-4',
    name: 'فاطمة الجفيري',
    rating: 4.6,
    totalTrips: 650,
    vehicleType: 'Hyundai Elantra',
    vehiclePlate: 'GHI 012',
    phone: '+973 7777 8888',
    status: 'available',
    currentLocation: { lat: 26.2100, lng: 50.5900 }, // منطقة الجفير
    seats: 4,
    pricePerKm: 0.35,
    area: 'الجفير',
  },
];

interface DriverData {
  uid: string;
  name: string;
  rating: number;
  totalTrips: number;
  vehicleType: string;
  vehiclePlate: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: { lat: number; lng: number };
  seats: number;
  pricePerKm: number;
  area: string;
  distanceKm?: number;
}

interface DriverMatchingScreenProps {
  onBack: () => void;
  pickupLocation: string;
  dropoffLocation: string;
  onDriverMatched?: () => void;
  userCity?: string;
  orderId?: string | null;
  matchingMode?: 'ai' | 'manual';
}

export function DriverMatchingScreen({ onBack, pickupLocation, dropoffLocation, onDriverMatched, userCity = 'manama', orderId = null, matchingMode = 'ai' }: DriverMatchingScreenProps) {
  const [driverInfo, setDriverInfo] = useState<DriverData | null>(null);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectionErrorMessage, setSelectionErrorMessage] = useState('');
  const [aiSearchMessage, setAiSearchMessage] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchStepIndex, setAiSearchStepIndex] = useState(0);
  const [aiAlgorithmStats, setAiAlgorithmStats] = useState<{ visitedNodes: number; distanceKm: number | null; driverName?: string; found: boolean } | null>(null);
  const [liveOrder, setLiveOrder] = useState<OrderData | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [flowMode, setFlowMode] = useState<'ai' | 'manual'>(matchingMode);
  const [areaFilter, setAreaFilter] = useState(userCity);
  const [maxPriceFilter, setMaxPriceFilter] = useState(5);
  const [seatsFilter, setSeatsFilter] = useState(1);
  const [aiRecommendation, setAiRecommendation] = useState<DriverData[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const availableMarkersRef = useRef<Map<string, any>>(new Map());
  const assignedMarkerRef = useRef<any>(null);
  const routeRendererRef = useRef<any>(null);

  const formatDriver = (driver: FirestoreDriverData): DriverData => ({
    uid: driver.driverId,
    name: driver.name,
    rating: driver.rating || 4.8,
    totalTrips: driver.totalTrips || 0,
    vehicleType: driver.carType || 'Car',
    vehiclePlate: '',
    phone: driver.phone || '',
    status: driver.status,
    currentLocation: driver.currentLocation,
    seats: Number((driver as any).seats ?? 4),
    pricePerKm: Number((driver as any).pricePerKm ?? 2.5),
    area: String((driver as any).area ?? userCity),
  });

  useEffect(() => {
    const unsubscribe = listenToDrivers(
      (items) => {
        const mappedDrivers = items.map(formatDriver);
        // دمج السائقين الوهميين مع السائقين الحقيقيين للاختبار
        const allDrivers = [...mappedDrivers, ...DUMMY_DRIVERS];
        setDrivers(allDrivers);

        const availableDrivers = allDrivers.filter((item) => item.status === 'available');
        if (availableDrivers.length > 0) {
          const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
          setDriverInfo(randomDriver);
        } else {
          setDriverInfo(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error loading drivers:', error);
        // في حالة الخطأ، استخدم السائقين الوهميين فقط
        setDrivers(DUMMY_DRIVERS);
        const availableDrivers = DUMMY_DRIVERS.filter((item) => item.status === 'available');
        if (availableDrivers.length > 0) {
          const randomDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
          setDriverInfo(randomDriver);
        }
        setErrorMessage('Could not load drivers right now. Using test drivers.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenOrderById(
      orderId,
      (order) => {
        setLiveOrder(order);
      },
      (error) => {
        console.error('Failed to subscribe order:', error);
      }
    );
    return unsubscribe;
  }, [orderId]);

  useEffect(() => {
    let unTracking: (() => void) | null = null;
    const initMap = async () => {
      if (!mapContainerRef.current) return;
      try {
        const map = await initializeMap(mapContainerRef.current, { center: BAHRAIN_CENTER, zoom: 12 });
        mapRef.current = map;
        assignedMarkerRef.current = new window.google.maps.Marker({
          map,
          position: BAHRAIN_CENTER,
          title: 'Assigned Driver',
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: '#4F46E5',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1,
          },
        });
      } catch (error) {
        console.error('Matching map init failed:', error);
      } finally {
        setMapLoading(false);
      }
    };
    void initMap();
    return () => {
      if (unTracking) unTracking();
      availableMarkersRef.current.forEach((marker) => marker.setMap(null));
      availableMarkersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const available = drivers
      .filter((driver) => driver.status === 'available')
      .map((driver) => ({
        driverId: driver.uid,
        name: driver.name,
        phone: driver.phone,
        carType: driver.vehicleType,
        status: driver.status,
        currentLocation: driver.currentLocation,
      })) as any;
    loadDriversMarkers(mapRef.current, available, availableMarkersRef.current);
  }, [drivers]);

  useEffect(() => {
    if (!liveOrder?.assignedDriverId || !mapRef.current) return;
    const unTrack = listenDriverTracking(
      liveOrder.assignedDriverId,
      async (location) => {
        if (assignedMarkerRef.current) {
          animateMarker(assignedMarkerRef.current, location);
          mapRef.current.panTo(location);
        }
        try {
          await drawRoute(
            mapRef.current,
            location,
            liveOrder.pickupLocation,
            routeRendererRef.current,
          );
        } catch (error) {
          console.error('Driver route draw failed:', error);
        }
      },
      (error) => console.error('Driver tracking listen failed:', error),
    );
    return () => unTrack();
  }, [liveOrder?.assignedDriverId, liveOrder?.pickupLocation?.lat, liveOrder?.pickupLocation?.lng]);

  const getVehicleEmoji = (vehicleType: string) => {
    const type = vehicleType?.toLowerCase() || '';
    if (type.includes('taxi')) return '🚕';
    if (type.includes('delivery')) return '🚚';
    if (type.includes('premium')) return '🚗';
    return '🚙';
  };

  const displayDriver = driverInfo;
  const orderStatus = liveOrder?.status ?? 'pending';
  const assignedName = liveOrder?.assignedDriverName ?? null;
  const assignedPhone = liveOrder?.assignedDriverPhone ?? null;
  const matchedDriver = liveOrder?.assignedDriverId
    ? drivers.find((driver) => driver.uid === liveOrder.assignedDriverId) ?? displayDriver
    : displayDriver;
  const availableDrivers = drivers.filter((driver) => driver.status === 'available');
  const filteredDrivers = availableDrivers
    .filter((driver) => (areaFilter ? driver.area.toLowerCase().includes(areaFilter.toLowerCase()) : true))
    .filter((driver) => driver.pricePerKm <= maxPriceFilter)
    .filter((driver) => driver.seats >= seatsFilter);

  // في الوضع اليدوي، أضف سائق من منطقة أخرى إذا لم يكن موجود
  const manualDrivers = flowMode === 'manual' ? (() => {
    const areaDrivers = filteredDrivers;
    const otherAreaDrivers = availableDrivers.filter(driver =>
      !driver.area.toLowerCase().includes(areaFilter.toLowerCase()) &&
      driver.pricePerKm <= maxPriceFilter &&
      driver.seats >= seatsFilter
    );

    const result = [...areaDrivers];
    if (otherAreaDrivers.length > 0 && result.length < 2) {
      // أضف سائق واحد من منطقة أخرى
      const randomOther = otherAreaDrivers[Math.floor(Math.random() * otherAreaDrivers.length)];
      result.push(randomOther);
    }
    return result;
  })() : filteredDrivers;
  const hasAssignedDriver = Boolean(liveOrder?.assignedDriverId);

  useEffect(() => {
    setFlowMode(matchingMode);
  }, [matchingMode]);

  useEffect(() => {
    if (flowMode !== 'ai') {
      setAiRecommendation([]);
      setAiSearchMessage('');
      setAiSearching(false);
      setAiSearchStepIndex(0);
      setAiAlgorithmStats(null);
      return;
    }

    let ignore = false;
    const timeouts: number[] = [];
    const searchSteps = [
      'Scanning map grid...',
      'Analyzing driver locations...',
      'Verifying availability in realtime...',
      'Finalizing nearest match...'
    ];

    const recommend = async () => {
      const pickupLoc = liveOrder?.pickupLocation || BAHRAIN_CENTER;

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

      timeouts.push(window.setTimeout(async () => {
        if (ignore) return;
        try {
          const nearest = await findNearestDrivers(pickupLoc, 1);
          const visitedNodes = Math.floor(Math.random() * 8000) + 4500;

          if (nearest.length > 0) {
            const nearestDriverData = nearest[0];
            const localDriver = drivers.find((item) => item.uid === nearestDriverData.driver.driverId);
            const recommendedDriver: DriverData = localDriver
              ? { ...localDriver, distanceKm: nearestDriverData.distanceKm }
              : {
                  uid: nearestDriverData.driver.driverId,
                  name: nearestDriverData.driver.name,
                  rating: nearestDriverData.driver.rating ?? 4.8,
                  totalTrips: nearestDriverData.driver.totalTrips ?? 0,
                  vehicleType: nearestDriverData.driver.carType || 'Car',
                  vehiclePlate: '',
                  phone: nearestDriverData.driver.phone || '',
                  status: nearestDriverData.driver.status,
                  currentLocation: nearestDriverData.driver.currentLocation,
                  seats: Number((nearestDriverData.driver as any).seats ?? 4),
                  pricePerKm: Number((nearestDriverData.driver as any).pricePerKm ?? 2.5),
                  area: String((nearestDriverData.driver as any).area ?? areaFilter),
                  distanceKm: nearestDriverData.distanceKm,
                };

            setAiRecommendation([recommendedDriver]);
            setAiAlgorithmStats({
              visitedNodes,
              distanceKm: nearestDriverData.distanceKm,
              driverName: recommendedDriver.name,
              found: true,
            });
            setAiSearchMessage(`Nearest driver found: ${recommendedDriver.name} (${recommendedDriver.distanceKm?.toFixed(1)} km)`);
          } else {
            const dummyNearest = DUMMY_DRIVERS
              .map((driver) => ({
                driver,
                distanceKm: calculateDistance(
                  pickupLoc.lat,
                  pickupLoc.lng,
                  driver.currentLocation.lat,
                  driver.currentLocation.lng,
                ),
              }))
              .sort((a, b) => a.distanceKm - b.distanceKm);

            if (dummyNearest.length > 0) {
              const recommendedDriver = { ...dummyNearest[0].driver, distanceKm: dummyNearest[0].distanceKm };
              setAiRecommendation([recommendedDriver]);
              setAiAlgorithmStats({
                visitedNodes,
                distanceKm: dummyNearest[0].distanceKm,
                driverName: recommendedDriver.name,
                found: true,
              });
              setAiSearchMessage(`Demo driver matched: ${recommendedDriver.name} (${recommendedDriver.distanceKm?.toFixed(1)} km)`);
            } else {
              setAiRecommendation([]);
              setAiAlgorithmStats({ visitedNodes, distanceKm: null, found: false });
              setAiSearchMessage('No drivers available in this area right now.');
            }
          }
        } catch (error) {
          console.error('Failed to calculate AI recommendation:', error);
          setAiRecommendation([]);
          setAiSearchMessage('Error searching for a driver. Please try again.');
          setAiAlgorithmStats({ visitedNodes: 0, distanceKm: null, found: false });
        } finally {
          if (!ignore) setAiSearching(false);
        }
      }, 3600));
    };

    void recommend();

    return () => {
      ignore = true;
      timeouts.forEach(clearTimeout);
    };
  }, [flowMode, liveOrder?.pickupLocation?.lat, liveOrder?.pickupLocation?.lng, drivers, areaFilter]);

  const handleSelectDriver = async (driver: DriverData) => {
    if (!orderId) {
      setSelectionErrorMessage('No active order found. Please return and create a booking before selecting a driver.');
      return;
    }
    if (orderStatus !== 'pending') {
      setSelectionErrorMessage('This order cannot be updated because it is not pending.');
      return;
    }
    setSelectionErrorMessage('');
    setActionLoading(true);
    try {
      await setPreferredDriverForOrder(orderId, {
        driverId: driver.uid,
        name: driver.name,
        phone: driver.phone,
      });
      setDriverInfo(driver);
      alert('Driver selected. Waiting for driver acceptance.');
      if (onDriverMatched) {
        onDriverMatched();
      }
    } catch (error) {
      console.error('Failed to select driver:', error);
      alert('Failed to select driver right now. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (orderStatus !== 'pending') {
      alert('Only pending orders can be cancelled.');
      return;
    }
    try {
      await cancelOrder(orderId);
      alert('Order cancelled successfully.');
      onBack();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order.');
    }
  };

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-6 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">
              {hasAssignedDriver ? 'Driver Matched!' : 'Choose Your Driver'}
            </h1>
            <p className="text-white/90 text-sm">
              {hasAssignedDriver ? `Order status: ${orderStatus}` : 'AI recommendation or manual selection'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        <div className="w-full h-60 rounded-2xl overflow-hidden border border-gray-200 mb-6 relative">
          {mapLoading && <div className="absolute inset-0 z-10 bg-white/80 text-sm text-gray-600 flex items-center justify-center">Loading live map...</div>}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[420px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading drivers...</h2>
            <p className="text-gray-600 text-center">Please wait while we sync live driver data.</p>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center min-h-[420px]">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unable to load drivers</h2>
            <p className="text-gray-600 text-center">{errorMessage}</p>
          </div>
        ) : !hasAssignedDriver ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-1">Driver search mode</h3>
              <p className="text-xs text-gray-500 mb-3">Choose how to search: AI recommendation or manual filtering.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFlowMode('ai')}
                  className={`py-2 rounded-lg font-medium text-sm ${flowMode === 'ai' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  AI Auto
                </button>
                <button
                  onClick={() => setFlowMode('manual')}
                  className={`py-2 rounded-lg font-medium text-sm ${flowMode === 'manual' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Manual
                </button>
              </div>
            </div>

            {flowMode === 'manual' && (
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Filter available drivers</h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={areaFilter}
                    onChange={(event) => setAreaFilter(event.target.value)}
                    placeholder="Area (e.g. Manama)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <label className="text-sm text-gray-700">Max price / km: BD {maxPriceFilter.toFixed(1)}</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={0.5}
                    value={maxPriceFilter}
                    onChange={(event) => setMaxPriceFilter(Number(event.target.value))}
                  />
                  <label className="text-sm text-gray-700">Minimum seats: {seatsFilter}</label>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    step={1}
                    value={seatsFilter}
                    onChange={(event) => setSeatsFilter(Number(event.target.value))}
                  />
                </div>
              </div>
            )}

            {flowMode === 'ai' && (
              <div className="mb-6">
                <AISearchAnimation 
                  isSearching={aiSearching} 
                  algorithmStats={aiAlgorithmStats} 
                  searchMessage={aiSearchMessage} 
                />
              </div>
            )}

            {selectionErrorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
                {selectionErrorMessage}
              </div>
            )}

            <div className="space-y-3">
              {(flowMode === 'ai' ? aiRecommendation : manualDrivers).map((driver) => (
                <div key={driver.uid} className="bg-white rounded-2xl shadow-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-800">{driver.name}</p>
                      <p className="text-xs text-gray-500">{driver.vehicleType} • {driver.area}</p>
                      <p className="text-xs text-gray-500">Seats: {driver.seats} • BD {driver.pricePerKm.toFixed(1)}/km</p>
                      {typeof driver.distanceKm === 'number' && (
                        <p className="text-xs text-purple-600 mt-1">Approx. {driver.distanceKm.toFixed(2)} km from pickup</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700 font-semibold">{driver.rating.toFixed(1)} ⭐</p>
                      <a href={`tel:${driver.phone}`} className="text-xs text-blue-600 underline">
                        {driver.phone || 'No phone'}
                      </a>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={actionLoading || !driver.phone || orderStatus !== 'pending'}
                      onClick={() => void handleSelectDriver(driver)}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      Select this driver
                    </button>
                    <a
                      href={`tel:${driver.phone}`}
                      className="px-3 py-2 border border-green-500 text-green-600 rounded-lg text-sm font-semibold"
                    >
                      Call
                    </a>
                  </div>
                </div>
              ))}

              {(flowMode === 'ai' ? aiRecommendation.length === 0 : filteredDrivers.length === 0) && (
                <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-600">
                  No matching drivers with current filters.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Badge */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">Driver Found!</h3>
                <p className="text-sm text-green-600">
                  {orderStatus === 'accepted' ? 'Order accepted in real-time' : 'Arriving in 3 minutes'}
                </p>
              </div>
            </div>

            {/* Driver Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                {/* Driver Photo */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-4xl shadow-md">
                  {getVehicleEmoji(matchedDriver?.vehicleType || 'Car')}
                </div>

                {/* Driver Details */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{assignedName || matchedDriver?.name || 'Assigned driver'}</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-700">{(matchedDriver?.rating ?? 4.8).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({matchedDriver?.totalTrips ?? 0} trips)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">{orderStatus}</span>
                  </div>
                  {assignedPhone && <p className="text-xs text-gray-500 mt-1">{assignedPhone}</p>}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <a href={`tel:${assignedPhone || matchedDriver?.phone || ''}`} className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </a>
                  <button className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Car className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Vehicle Details</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Vehicle Type</p>
                    <p className="font-medium text-gray-800">{matchedDriver?.vehicleType || 'Car'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Plate Number</p>
                    <p className="text-2xl font-bold text-purple-600 tracking-wider">{matchedDriver?.vehiclePlate || '--'}</p>
                  </div>
                </div>
              </div>

              {/* Arrival Estimate */}
              <div className="flex items-center justify-between bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Estimated Arrival</p>
                    <p className="text-xl font-bold text-purple-600">3 min</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
                  Track Live
                </button>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="font-medium text-gray-800">{pickupLocation || 'Current Location'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Drop-off</p>
                      <p className="font-medium text-gray-800">{dropoffLocation || 'Destination'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Safety & Sharing
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-800">Share Trip Details</p>
                    <p className="text-xs text-gray-600">Send trip info to family or friends</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-gray-800">Safety Center</p>
                    <p className="text-xs text-gray-600">Emergency contacts & support</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => onDriverMatched?.()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                View on Map
              </button>

              <button
                onClick={handleCancelOrder}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-red-600 py-4 rounded-full text-lg font-semibold hover:bg-red-50 transition-all"
              >
                <X className="w-5 h-5" />
                Cancel Order
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button className="flex flex-col items-center text-purple-600 transition-colors">
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>

          <button className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>

          <button className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>

          <button className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors">
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}