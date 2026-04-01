import { Home, FileText, Inbox, Truck, DollarSign, Star, User, Clock } from 'lucide-react';

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
      {/* Fixed Left Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-600 to-blue-600 text-white flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Driver System</h2>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <button 
            onClick={onNavigateToDashboard}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={onNavigateToMyOffers}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <FileText className="w-5 h-5" />
            My Offers
          </button>
          
          <button 
            onClick={onNavigateToIncomingRequests}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Inbox className="w-5 h-5" />
            Incoming Requests
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </button>
          
          <button 
            onClick={onNavigateToActiveDeliveries}
            className="w-full px-6 py-3 flex items-center gap-3 bg-white/10 border-l-4 border-white text-white font-semibold"
          >
            <Truck className="w-5 h-5" />
            Active Deliveries
          </button>
          
          <button 
            onClick={onNavigateToEarnings}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <DollarSign className="w-5 h-5" />
            Earnings
          </button>
          
          <button 
            onClick={onNavigateToReviews}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <Star className="w-5 h-5" />
            Reviews
          </button>
          
          <button 
            onClick={onNavigateToProfile}
            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-white/90 hover:text-white"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Driver</p>
              <p className="text-xs text-white/70">Ahmed Al-Khalifa</p>
            </div>
          </div>
        </div>
      </aside>

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
