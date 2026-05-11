import { Clock } from 'lucide-react';
import { DriverSidebar } from './DriverSidebar';

interface DeliveryCompletedProps {
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
  customerName?: string;
  route?: string;
  amount?: number;
}

export function DeliveryCompleted({
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
  customerName = 'Sara Ahmed',
  route = 'Manama → Riffa',
  amount = 8.5,
}: DeliveryCompletedProps) {
  return (
    <div className="size-full flex bg-gray-50">
      <DriverSidebar
        activePage="active-deliveries"
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToMyOffers={onNavigateToMyOffers}
        onNavigateToIncomingRequests={onNavigateToIncomingRequests}
        onNavigateToActiveDeliveries={() => {}}
        onNavigateToEarnings={onNavigateToEarnings}
        onNavigateToReviews={onNavigateToReviews}
        onNavigateToProfile={onNavigateToProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center">
        <div className="max-w-2xl w-full px-8">
          {/* Completion Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            {/* Success Icon */}
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Main Message */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Delivery Completed!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Waiting for customer review
            </p>

            {/* Delivery Details */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-800">{customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Route</p>
                  <p className="font-semibold text-gray-800">{route}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount</p>
                  <p className="font-semibold text-green-600">BD {amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Waiting Animation */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-purple-600 animate-pulse" />
              <p className="text-gray-500">Customer will receive a review prompt shortly</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateToActiveDeliveries}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                View Active Deliveries
              </button>
              <button
                onClick={onNavigateToDashboard}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-blue-800">
              💡 Your earnings will be updated once the customer completes their review
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
