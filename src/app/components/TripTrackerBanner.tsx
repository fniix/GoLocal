import { useEffect, useState } from 'react';
import { Phone, Car, CheckCircle, MapPin, Navigation, User, Flag } from 'lucide-react';
import { listenOrderTripStatus, type OrderData, type TripStatus } from '../../services/firebaseService';

interface TripTrackerBannerProps {
  orderId: string;
  driverName: string;
  driverPhone?: string;
  onTripComplete?: () => void;
}

const STEPS: { status: TripStatus; passengerLabel: string; emoji: string; color: string; bg: string }[] = [
  { status: 'pending',           passengerLabel: 'Looking for your driver...',    emoji: '🔍', color: 'text-gray-600',   bg: 'bg-gray-100' },
  { status: 'driver_heading',    passengerLabel: 'Driver is on the way to you',   emoji: '🚗', color: 'text-blue-600',   bg: 'bg-blue-50' },
  { status: 'driver_arrived',    passengerLabel: 'Driver has arrived! 📍',         emoji: '📍', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { status: 'passenger_boarded', passengerLabel: 'Trip started — enjoy your ride!', emoji: '🙌', color: 'text-purple-600', bg: 'bg-purple-50' },
  { status: 'in_progress',       passengerLabel: 'On the way to your destination', emoji: '🛣️', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { status: 'completed',         passengerLabel: 'You have arrived! 🎉',           emoji: '🏁', color: 'text-green-600',  bg: 'bg-green-50' },
  { status: 'paid',              passengerLabel: 'Payment confirmed ✅',            emoji: '✅', color: 'text-green-600',  bg: 'bg-green-50' },
];

const STATUS_ORDER: TripStatus[] = ['pending', 'driver_heading', 'driver_arrived', 'passenger_boarded', 'in_progress', 'completed', 'paid'];
function idx(s: TripStatus) { return STATUS_ORDER.indexOf(s); }

// Simulated ETA countdown
function useETA(status: TripStatus) {
  const [eta, setEta] = useState<number | null>(null);
  useEffect(() => {
    if (status === 'driver_heading') setEta(7);
    else if (status === 'in_progress') setEta(12);
    else { setEta(null); return; }
    const t = setInterval(() => setEta(e => e !== null && e > 1 ? e - 1 : e), 60000);
    return () => clearInterval(t);
  }, [status]);
  return eta;
}

export function TripTrackerBanner({ orderId, driverName, driverPhone, onTripComplete }: TripTrackerBannerProps) {
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const unsub = listenOrderTripStatus(orderId, (o) => {
      setOrder(o);
      if (o?.tripStatus === 'completed' || o?.tripStatus === 'paid') {
        setTimeout(() => onTripComplete?.(), 2500);
      }
    });
    return unsub;
  }, [orderId]);

  const currentStatus: TripStatus = order?.tripStatus ?? 'pending';
  const currentStep = STEPS.find(s => s.status === currentStatus) ?? STEPS[0];
  const currentIdx = idx(currentStatus);
  const eta = useETA(currentStatus);

  return (
    <div className={`rounded-2xl border shadow-lg overflow-hidden transition-all ${currentStep.bg} border-${currentStep.color.split('-')[1]}-200`}>
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.3} } .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }`}</style>

      {/* Status Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-2xl">{currentStep.emoji}</div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${currentStep.color}`}>{currentStep.passengerLabel}</p>
          {eta && (
            <p className="text-xs text-gray-500 mt-0.5">
              ⏱ Estimated time: <strong>{eta} min</strong>
            </p>
          )}
        </div>
        {currentStatus !== 'pending' && currentStatus !== 'completed' && currentStatus !== 'paid' && (
          <div className="flex items-center gap-1">
            <span className="pulse-dot w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-1">
        <div className="flex items-center gap-0.5">
          {STATUS_ORDER.slice(0, 6).map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= currentIdx ? 'bg-purple-500' : 'bg-gray-200'
            }`} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Booking</span>
          <span className="text-xs text-gray-400">Arrived</span>
        </div>
      </div>

      {/* Step Timeline */}
      <div className="px-4 py-3 space-y-2">
        {STEPS.filter(s => s.status !== 'paid').map(step => {
          const si = idx(step.status);
          const done = si < currentIdx;
          const active = step.status === currentStatus;
          if (si > currentIdx + 1) return null;
          return (
            <div key={step.status} className={`flex items-center gap-2.5 transition-all ${
              active ? 'opacity-100' : done ? 'opacity-50' : 'opacity-20'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                done ? 'bg-green-500 text-white' : active ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                {done ? '✓' : step.emoji}
              </div>
              <span className={`text-sm ${active ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                {step.passengerLabel}
              </span>
              {active && <span className="pulse-dot ml-auto w-2 h-2 rounded-full bg-purple-500" />}
            </div>
          );
        })}
      </div>

      {/* Driver Info */}
      {driverName && currentStatus !== 'pending' && (
        <div className="mx-4 mb-4 bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 text-sm">{driverName}</p>
            <p className="text-xs text-gray-400">Your driver</p>
          </div>
          {driverPhone && (
            <a href={`tel:${driverPhone}`}
              className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
              <Phone className="w-4 h-4 text-purple-600" />
            </a>
          )}
        </div>
      )}

      {/* Driver Arrived Alert */}
      {currentStatus === 'driver_arrived' && (
        <div className="mx-4 mb-4 bg-yellow-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <p className="font-bold text-yellow-900 text-sm">Your driver is waiting for you!</p>
        </div>
      )}
    </div>
  );
}
