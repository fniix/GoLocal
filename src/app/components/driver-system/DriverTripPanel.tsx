import { useState } from 'react';
import { MapPin, User, Phone, CheckCircle, Navigation, Car, Flag, Loader } from 'lucide-react';
import { updateTripStatus, type TripStatus, type OrderData } from '../../../services/firebaseService';

interface DriverTripPanelProps {
  order: OrderData;
  onDismiss?: () => void;
}

const STEPS: { status: TripStatus; label: string; subLabel: string; icon: React.ReactNode; color: string }[] = [
  { status: 'driver_heading',    label: 'Heading to Pickup',    subLabel: 'On my way to passenger', icon: <Navigation className="w-5 h-5" />, color: 'blue' },
  { status: 'driver_arrived',   label: 'Arrived at Pickup',    subLabel: "I'm at the pickup location", icon: <MapPin className="w-5 h-5" />, color: 'yellow' },
  { status: 'passenger_boarded',label: 'Passenger Boarded',    subLabel: 'Passenger is in the car', icon: <User className="w-5 h-5" />, color: 'purple' },
  { status: 'in_progress',      label: 'Trip in Progress',     subLabel: 'Driving to destination', icon: <Car className="w-5 h-5" />, color: 'indigo' },
  { status: 'completed',        label: 'Arrived at Destination', subLabel: 'Trip completed!', icon: <Flag className="w-5 h-5" />, color: 'green' },
];

const STATUS_ORDER: TripStatus[] = ['pending', 'driver_heading', 'driver_arrived', 'passenger_boarded', 'in_progress', 'completed', 'paid'];

function getStepIndex(s: TripStatus) { return STATUS_ORDER.indexOf(s); }

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-600 text-white',
  yellow: 'bg-yellow-500 text-white',
  purple: 'bg-purple-600 text-white',
  indigo: 'bg-indigo-600 text-white',
  green: 'bg-green-600 text-white',
};
const LIGHT_MAP: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  green: 'bg-green-50 border-green-200 text-green-700',
};

export function DriverTripPanel({ order, onDismiss }: DriverTripPanelProps) {
  const [loading, setLoading] = useState<TripStatus | null>(null);

  const current = order.tripStatus ?? 'pending';
  const currentIdx = getStepIndex(current);
  const isCompleted = current === 'completed' || current === 'paid';

  const handleUpdate = async (status: TripStatus) => {
    setLoading(status);
    try {
      await updateTripStatus(order.orderId, status, 'driver');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  // Next step button
  const nextStep = STEPS.find(s => getStepIndex(s.status) > currentIdx);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Active Trip</p>
            <h3 className="text-white font-bold text-lg">{order.userName || 'Passenger'}</h3>
          </div>
          {order.userPhone && (
            <a href={`tel:${order.userPhone}`}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Phone className="w-5 h-5 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <div className="w-0.5 flex-1 bg-gray-200 min-h-[24px]" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-gray-400">Pickup</p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{order.pickupAddress || 'Pickup location'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Drop-off</p>
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{order.dropoffAddress || 'Drop-off location'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Trip Progress</p>
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const stepIdx = getStepIndex(step.status);
            const done = stepIdx < currentIdx || (current === step.status && isCompleted);
            const active = step.status === current;
            return (
              <div key={step.status} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                active ? `border ${LIGHT_MAP[step.color]}` : done ? 'opacity-60' : 'opacity-30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-green-100 text-green-600' : active ? COLOR_MAP[step.color] : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${active ? '' : 'text-gray-600'}`}>{step.label}</p>
                  {active && <p className="text-xs text-gray-500">{step.subLabel}</p>}
                </div>
                {active && <div className="w-2 h-2 rounded-full bg-current animate-pulse" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-5 py-4">
        {isCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold text-green-800">Trip Completed!</p>
              <p className="text-xs text-green-600">Waiting for passenger payment</p>
            </div>
          </div>
        ) : nextStep ? (
          <button
            onClick={() => handleUpdate(nextStep.status)}
            disabled={!!loading}
            className={`w-full py-4 rounded-2xl font-bold text-white text-base transition-all flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : `${COLOR_MAP[nextStep.color].replace('text-white', '')} shadow-lg hover:shadow-xl active:scale-[0.98]`
            }`}
          >
            {loading === nextStep.status ? (
              <><Loader className="w-5 h-5 animate-spin" /> Updating...</>
            ) : (
              <>{nextStep.icon} {nextStep.label}</>
            )}
          </button>
        ) : (
          <div className="text-center text-gray-400 text-sm">Start the trip by pressing "Heading to Pickup"</div>
        )}

        {current === 'pending' && (
          <button
            onClick={() => handleUpdate('driver_heading')}
            disabled={!!loading}
            className="w-full mt-3 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading === 'driver_heading' ? <Loader className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            I'm Heading to Pickup
          </button>
        )}
      </div>
    </div>
  );
}
