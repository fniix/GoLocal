import { useState } from 'react';
import { ChevronDown, ChevronUp, LogOut, User } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { DriverLandingPage } from './DriverLandingPage';
import { DriverSystemDashboard } from './DriverSystemDashboard';
import { CreateDeliveryOffer } from './CreateDeliveryOffer';
import { MyOffers } from './MyOffers';
import { IncomingRequests } from './IncomingRequests';
import { DeliveryCompleted } from './DeliveryCompleted';
import { Earnings } from './Earnings';
import { Reviews } from './Reviews';
import { DriverSystemProfile } from './DriverSystemProfile';

export function DriverSystemApp() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard' | 'create-offer' | 'my-offers' | 'incoming-requests' | 'active-deliveries' | 'delivery-completed' | 'earnings' | 'reviews' | 'profile'>('landing');
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // Landing Page
  if (currentPage === 'landing') {
    return (
      <DriverLandingPage
        onEnterSystem={() => setCurrentPage('dashboard')}
      />
    );
  }

  let currentView: any = null;

  // Dashboard
  if (currentPage === 'dashboard') {
    currentView = (
      <DriverSystemDashboard
        onNavigateToCreateOffer={() => setCurrentPage('create-offer')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // Create Delivery Offer
  if (currentPage === 'create-offer') {
    currentView = (
      <CreateDeliveryOffer
        onBack={() => setCurrentPage('dashboard')}
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // My Offers
  if (currentPage === 'my-offers') {
    currentView = (
      <MyOffers
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToCreateOffer={() => setCurrentPage('create-offer')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // Incoming Requests
  if (currentPage === 'incoming-requests') {
    currentView = (
      <IncomingRequests
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToCreateOffer={() => setCurrentPage('create-offer')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
        driverStatus={driverStatus}
      />
    );
  }

  // Delivery Completed
  if (currentPage === 'delivery-completed') {
    currentView = (
      <DeliveryCompleted
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // Earnings
  if (currentPage === 'earnings') {
    currentView = (
      <Earnings
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // Reviews
  if (currentPage === 'reviews') {
    currentView = (
      <Reviews
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  // Profile
  if (currentPage === 'profile') {
    currentView = (
      <DriverSystemProfile
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
      />
    );
  }

  // Active Deliveries - placeholder for now
  if (currentPage === 'active-deliveries') {
    currentView = (
      <DeliveryCompleted
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToMyOffers={() => setCurrentPage('my-offers')}
        onNavigateToIncomingRequests={() => setCurrentPage('incoming-requests')}
        onNavigateToActiveDeliveries={() => setCurrentPage('active-deliveries')}
        onNavigateToEarnings={() => setCurrentPage('earnings')}
        onNavigateToReviews={() => setCurrentPage('reviews')}
        onNavigateToProfile={() => setCurrentPage('profile')}
      />
    );
  }

  if (!currentView) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white text-slate-900">
      {currentView}
        <div className="fixed bottom-0 left-0 z-50 w-64 border-t border-white/10 px-6 py-4 bg-white/5 backdrop-blur-xl">
          <button
            onClick={() => setShowAccountMenu((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg shadow-black/20"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Driver</p>
              <p className="text-xs text-white/60">Account</p>
            </div>
            {showAccountMenu ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
          </button>
        </div>

        {showAccountMenu && (
          <div className="fixed bottom-24 left-4 z-[60] w-56 rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-4 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
    </div>
  );
}
