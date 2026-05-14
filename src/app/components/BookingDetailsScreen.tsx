import { ArrowLeft, MapPin, Plus, Clock, Calendar, Users, CreditCard, Navigation, Home, Search, Bell, User as UserIcon } from 'lucide-react';
import { LocationSearchInput } from './LocationSearchInput';
import { useEffect, useRef, useState } from 'react';
import {
  BAHRAIN_BOUNDS,
  BAHRAIN_CENTER,
  getUserLocation,
  initializeMap,
  listenDriversLive,
  loadDriversMarkers,
  loadGoogleMapsScript,
  selectDropoff,
  selectPickup,
  createMarker,
  geocode,
  reverseGeocode,
} from '../../services/googleMapsService';
import { type DriverData } from '../../services/firebaseService';

export interface BookingConfirmPayload {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLocation: { lat: number; lng: number };
  dropoffLocation: { lat: number; lng: number };
  matchingMode: 'ai' | 'manual';
}

interface BookingDetailsScreenProps {
  onBack: () => void;
  onNavigateHome?: () => void;
  onNavigateSearch?: () => void;
  onNavigateActivity?: () => void;
  onNavigateProfile?: () => void;
  serviceType: string;
  selectedService: string;
  userName?: string;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onConfirm?: (payload: BookingConfirmPayload) => void;
  initialPickup?: string;
  initialDropoff?: string;
}

export function BookingDetailsScreen({ onBack, onNavigateHome, onNavigateSearch, onNavigateActivity, onNavigateProfile, serviceType, selectedService, userName, onNavigateLogin, onNavigateRegister, onConfirm, initialPickup, initialDropoff }: BookingDetailsScreenProps) {
  const [rideTime, setRideTime] = useState<'now' | 'schedule'>('now');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [pickupLocation, setPickupLocation] = useState(initialPickup || '');
  const [dropoffLocation, setDropoffLocation] = useState(initialDropoff || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [additionalStops, setAdditionalStops] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [notes, setNotes] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mapLoading, setMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const driversMarkersRef = useRef<Map<string, any>>(new Map());
  const hasPickupRef = useRef(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMatchingModeModal, setShowMatchingModeModal] = useState(false);
  const pendingCoordsRef = useRef<{ pickup: { lat: number; lng: number }; dropoff: { lat: number; lng: number } } | null>(null);

  // Check if user is a guest (not logged in)
  const isGuest = !userName || userName === '' || userName === 'Guest User';

  const resolveInputCoordsIfNeeded = async () => {
    if (!mapInstanceRef.current) return { pickup: pickupCoords, dropoff: dropoffCoords };
    
    const geocodeAddress = async (address: string) => {
      return await geocode(address);
    };

    let pickup = pickupCoords;
    let dropoff = dropoffCoords;
    if (!pickup && pickupLocation.trim()) {
      pickup = await geocodeAddress(pickupLocation.trim());
      if (pickup) {
        setPickupCoords(pickup);
        selectPickup(pickupMarkerRef.current, mapInstanceRef.current, pickup);
      }
    }
    if (!dropoff && dropoffLocation.trim()) {
      dropoff = await geocodeAddress(dropoffLocation.trim());
      if (dropoff) {
        setDropoffCoords(dropoff);
        selectDropoff(dropoffMarkerRef.current, mapInstanceRef.current, dropoff);
      }
    }
    return { pickup, dropoff };
  };

  const handleConfirmBooking = async () => {
    if (!pickupLocation || !dropoffLocation) return;
    const { pickup, dropoff } = await resolveInputCoordsIfNeeded();
    if (!pickup || !dropoff) {
      setLocationError('Please select valid Bahrain pickup/drop-off locations from map or suggestions.');
      return;
    }
    pendingCoordsRef.current = { pickup, dropoff };
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    setShowMatchingModeModal(true);
  };

  const handleSelectMatchingMode = (mode: 'ai' | 'manual') => {
    if (!onConfirm || !pendingCoordsRef.current) return;
    onConfirm({
      pickupAddress: pickupLocation,
      dropoffAddress: dropoffLocation,
      pickupLocation: pendingCoordsRef.current.pickup,
      dropoffLocation: pendingCoordsRef.current.dropoff,
      matchingMode: mode,
    });
    setShowMatchingModeModal(false);
    pendingCoordsRef.current = null;
  };

  useEffect(() => {
    let unDrivers: (() => void) | null = null;

    const initMap = async () => {
      if (!mapRef.current) return;
      try {
        const map = await initializeMap(mapRef.current, { center: BAHRAIN_CENTER, zoom: 12 });
        mapInstanceRef.current = map;
        pickupMarkerRef.current = createMarker('#22c55e'); // Green
        dropoffMarkerRef.current = createMarker('#ef4444'); // Red

        map.on("click", async (event: any) => {
          const point = {
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          };
          const address = await reverseGeocode(point.lat, point.lng);
          
          if (!hasPickupRef.current) {
            hasPickupRef.current = true;
            setPickupCoords(point);
            setPickupLocation(address);
            selectPickup(pickupMarkerRef.current, map, point);
          } else {
            setDropoffCoords(point);
            setDropoffLocation(address);
            selectDropoff(dropoffMarkerRef.current, map, point);
          }
        });

        unDrivers = listenDriversLive(
          (drivers: DriverData[]) => {
            loadDriversMarkers(map, drivers, driversMarkersRef.current);
          },
          (error) => {
            console.error("Drivers live listen failed:", error);
          },
        );
      } catch (error) {
        console.error("Map init failed:", error);
        setLocationError("Google Maps could not load.");
      } finally {
        setMapLoading(false);
      }
    };

    void initMap();

    return () => {
      if (unDrivers) unDrivers();
      const map = mapInstanceRef.current;
      driversMarkersRef.current.forEach((marker) => {
        try {
          if (marker && typeof marker.remove === "function") {
            marker.remove();
          } else if (map && marker) {
            map.removeLayer(marker);
          }
        } catch {
          /* ignore */
        }
      });
      driversMarkersRef.current.clear();
      try {
        if (map) {
          const pickup = pickupMarkerRef.current;
          const dropoff = dropoffMarkerRef.current;
          if (pickup && map.hasLayer(pickup)) map.removeLayer(pickup);
          if (dropoff && map.hasLayer(dropoff)) map.removeLayer(dropoff);
          map.remove();
        }
      } catch {
        /* ignore */
      }
      mapInstanceRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
    };
  }, []);

  const centerOnUserLocation = async () => {
    if (!mapInstanceRef.current) return;
    try {
      const location = await getUserLocation();
      mapInstanceRef.current.panTo([location.lat, location.lng]);
      mapInstanceRef.current.setZoom(14);
      setLocationError("");
      if (!pickupCoords) {
        hasPickupRef.current = true;
        setPickupCoords(location);
        setPickupLocation("My current location");
        selectPickup(pickupMarkerRef.current, mapInstanceRef.current, location);
      }
    } catch (error) {
      console.error("User location failed:", error);
      setLocationError("Location access denied. Using Bahrain center.");
      mapInstanceRef.current.panTo([BAHRAIN_CENTER.lat, BAHRAIN_CENTER.lng]);
      mapInstanceRef.current.setZoom(11);
    }
  };

  const favoriteLocations = [
    { name: 'Home', address: 'Seef District, Manama', icon: '🏠' },
    { name: 'Work', address: 'Diplomatic Area, Manama', icon: '💼' },
    { name: 'Mall', address: 'City Centre Bahrain', icon: '🛍️' }
  ];

  const addStop = () => {
    if (additionalStops.length < 3) {
      setAdditionalStops([...additionalStops, '']);
    }
  };

  const removeStop = (index: number) => {
    setAdditionalStops(additionalStops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...additionalStops];
    newStops[index] = value;
    setAdditionalStops(newStops);
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
          
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-2xl font-bold">Booking Details</h1>
            <p className="text-white/90 text-sm capitalize">{selectedService} - {serviceType}</p>
          </div>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors shrink-0"
              aria-label="Go to home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-44">
        {/* Location Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Location Details
          </h2>

          {/* Pickup Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              Pickup Location
            </label>
            <LocationSearchInput
              value={pickupLocation}
              placeholder="Search for pickup location..."
              colorScheme="purple"
              showCurrentLocation
              onCurrentLocation={centerOnUserLocation}
              onChange={(val) => setPickupLocation(val)}
              onSelect={(addr, coords) => {
                setPickupLocation(addr);
                setPickupCoords(coords);
                hasPickupRef.current = true;
                selectPickup(pickupMarkerRef.current, mapInstanceRef.current, coords);
                mapInstanceRef.current?.panTo([coords.lat, coords.lng]);
              }}
            />
          </div>

          {/* Favorite Locations */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {favoriteLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => setPickupLocation(location.address)}
                className="flex-shrink-0 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg text-xs transition-colors"
              >
                <span className="mr-1">{location.icon}</span>
                <span className="font-medium text-gray-700">{location.name}</span>
              </button>
            ))}
          </div>

          {/* Additional Stops */}
          {additionalStops.map((stop, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop {index + 1}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <input
                  type="text"
                  placeholder="Enter stop location"
                  value={stop}
                  onChange={(e) => updateStop(index, e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button 
                  onClick={() => removeStop(index)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Drop-off Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Drop-off Location
            </label>
            <LocationSearchInput
              value={dropoffLocation}
              placeholder="Search for drop-off location..."
              colorScheme="red"
              onChange={(val) => setDropoffLocation(val)}
              onSelect={(addr, coords) => {
                setDropoffLocation(addr);
                setDropoffCoords(coords);
                selectDropoff(dropoffMarkerRef.current, mapInstanceRef.current, coords);
                mapInstanceRef.current?.panTo([coords.lat, coords.lng]);
              }}
            />
          </div>

          {/* Add Stop Button */}
          {additionalStops.length < 3 && (
            <button
              onClick={addStop}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Stop</span>
            </button>
          )}
          <div className="mt-4">
            <div className="h-64 rounded-xl border border-gray-200 overflow-hidden relative">
              {mapLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-sm text-gray-600 z-10">
                  Loading Bahrain map...
                </div>
              )}
              <div ref={mapRef} className="w-full h-full" />
            </div>
            {locationError && <p className="text-xs text-red-600 mt-2">{locationError}</p>}
          </div>
        </div>

        {/* Ride Time Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Ride Time
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setRideTime('now')}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                rideTime === 'now'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Now</span>
            </button>

            <button
              onClick={() => {
                setRideTime('schedule');
                setShowDatePicker(true);
              }}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                rideTime === 'schedule'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>

          {rideTime === 'schedule' && (
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Passengers Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Passengers
          </h2>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <span className="text-gray-700 font-medium">Number of passengers</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                className="w-8 h-8 rounded-full bg-white border-2 border-purple-500 text-purple-600 font-bold hover:bg-purple-50 transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-8 text-center">{passengerCount}</span>
              <button
                onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}
                className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Payment Method
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedPayment('cash')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedPayment === 'cash'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'cash' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {selectedPayment === 'cash' && (
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                )}
              </div>
              <span className="text-2xl">💵</span>
              <span className="font-medium text-gray-700">Cash</span>
            </button>

            <button
              onClick={() => setSelectedPayment('card')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedPayment === 'card'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'card' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {selectedPayment === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                )}
              </div>
              <CreditCard className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-gray-700">Credit/Debit Card</span>
            </button>

            <button
              onClick={() => setSelectedPayment('wallet')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                selectedPayment === 'wallet'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPayment === 'wallet' ? 'border-purple-600' : 'border-gray-300'
              }`}>
                {selectedPayment === 'wallet' && (
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                )}
              </div>
              <span className="text-2xl">👛</span>
              <span className="font-medium text-gray-700">Wallet</span>
              <span className="ml-auto text-sm text-purple-600 font-semibold">BD 25.50</span>
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Notes for Driver</h2>
          <textarea
            placeholder="Add any special instructions or notes for your driver..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">Optional: Landmark, special requests, etc.</p>
        </div>
      </div>

      {/* Fixed Confirm Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg z-[1001]">
        <button
          disabled={!pickupLocation || !dropoffLocation}
          onClick={() => void handleConfirmBooking()}
          className={`w-full py-4 rounded-full text-lg font-semibold shadow-lg transition-all ${
            pickupLocation && dropoffLocation
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-xl active:scale-[0.98]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirm Booking
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          {pickupLocation && dropoffLocation
            ? 'You can pin on map or type address then choose AI/Manual'
            : 'Please enter pickup and drop-off locations'}
        </p>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-[1001]">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            type="button"
            onClick={() => onNavigateHome?.()}
            className="flex flex-col items-center text-purple-600 transition-colors"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSearch?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateActivity?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateProfile?.()}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sign In Required</h3>
              <p className="text-gray-600">
                Please sign in to complete your booking
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={onNavigateLogin}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {showMatchingModeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Search Mode</h3>
            <p className="text-gray-600 text-sm mb-5">Do you want AI recommendation or manual driver selection?</p>
            <div className="space-y-3">
              <button
                onClick={() => handleSelectMatchingMode('ai')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-semibold"
              >
                AI Auto Recommendation
              </button>
              <button
                onClick={() => handleSelectMatchingMode('manual')}
                className="w-full py-3 border-2 border-purple-500 text-purple-700 rounded-full font-semibold hover:bg-purple-50"
              >
                Manual Search
              </button>
              <button
                onClick={() => setShowMatchingModeModal(false)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}