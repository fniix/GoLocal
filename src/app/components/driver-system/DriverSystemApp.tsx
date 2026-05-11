import { useState } from 'react';
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
    </div>
  );
}
