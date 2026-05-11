import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { createOffer } from '../../../services/firebaseService';
import { DriverSidebar } from './DriverSidebar';
import { LocationSearchInput } from '../LocationSearchInput';

interface CreateDeliveryOfferProps {
  onBack: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
}

export function CreateDeliveryOffer({
  onBack,
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
}: CreateDeliveryOfferProps) {
  const [fromCity, setFromCity] = useState('');
  const [fromArea, setFromArea] = useState('');
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCity, setToCity] = useState('');
  const [toArea, setToArea] = useState('');
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [serviceType, setServiceType] = useState('');
  const [priceType, setPriceType] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [availableTime, setAvailableTime] = useState('');

  const cities = ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'Isa Town', 'Sitra', 'Budaiya', 'Jidhafs', 'Sanabis', 'Tubli', 'Adliya', 'Seef', 'Amwaj Islands', 'Durrat Al Bahrain'];

  const serviceTypes = ['Private Driver', 'Private Bus', 'OnTheWay', 'Mandoob'];
  const priceTypes = ['Fixed', 'Per KM', 'Negotiable'];

  const handlePublishOffer = async () => {
    // Validate all fields are filled
    if (!fromCity || !fromArea || !toCity || !toArea || !serviceType || !priceType || !basePrice || !availableTime) {
      alert('Please fill all fields');
      return;
    }

    try {
      await createOffer({
        fromCity,
        fromArea,
        toCity,
        toArea,
        serviceType,
        priceType,
        basePrice,
        availableTime
      });
      alert('Offer Published Successfully!');
      onNavigateToMyOffers();
    } catch (error) {
      console.error("Failed to publish offer:", error);
      alert('Failed to publish offer. Please try again.');
    }
  };

  return (
    <div className="size-full flex bg-slate-50 text-slate-900">
      <DriverSidebar
        activePage="my-offers"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToMyOffers={onNavigateToMyOffers}
        onNavigateToIncomingRequests={onNavigateToIncomingRequests}
        onNavigateToActiveDeliveries={onNavigateToActiveDeliveries}
        onNavigateToEarnings={onNavigateToEarnings}
        onNavigateToReviews={onNavigateToReviews}
        onNavigateToProfile={onNavigateToProfile}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Delivery Offer</h1>
              <p className="text-slate-500 mt-1">Fill in the details to publish your offer</p>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* From City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From City *
                  </label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* From Area */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    From Area / Pickup Location *
                  </label>
                  <LocationSearchInput
                    value={fromArea}
                    placeholder="Search pickup area or address..."
                    colorScheme="purple"
                    onChange={val => setFromArea(val)}
                    onSelect={(addr, coords) => { setFromArea(addr); setFromCoords(coords); }}
                  />
                </div>

                {/* To City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To City *
                  </label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* To Area */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    To Area / Drop-off Location *
                  </label>
                  <LocationSearchInput
                    value={toArea}
                    placeholder="Search drop-off area or address..."
                    colorScheme="red"
                    onChange={val => setToArea(val)}
                    onSelect={(addr, coords) => { setToArea(addr); setToCoords(coords); }}
                  />
                  {fromCoords && toCoords && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      ✓ Both locations pinned on map
                    </p>
                  )}
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select service type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Type *
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select price type</option>
                    {priceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Price (BD) *
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Available Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={availableTime}
                    onChange={(e) => setAvailableTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onBack}
                  className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishOffer}
                  className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
                >
                  Publish Offer
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Offer Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Set competitive prices to attract more customers</li>
                <li>• Specify clear pickup and dropoff areas</li>
                <li>• Keep your availability schedule up to date</li>
                <li>• Respond to requests quickly to improve your rating</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
