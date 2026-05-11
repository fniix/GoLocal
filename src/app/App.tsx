import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  createOrder,
  listenToUserProfile,
  updateUserProfile,
  setDriverOffline,
  listenOrderById,
} from '../services/firebaseService';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreenWithRoles } from './components/RegisterScreenWithRoles';
import { HomeScreen } from './components/HomeScreen';
import { ServiceSelectionScreen } from './components/ServiceSelectionScreen';
import { BookingDetailsScreen } from './components/BookingDetailsScreen';
import { DriverMatchingScreen } from './components/DriverMatchingScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import { SmartPaymentScreen } from './components/SmartPaymentScreen';
import { RatingScreen } from './components/RatingScreen';
import { RideHistoryScreen } from './components/RideHistoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchScreen } from './components/SearchScreen';
import { ActivityScreen } from './components/ActivityScreen';
import { DriverDashboard } from './components/DriverDashboard';
import { DriverProfile } from './components/DriverProfile';
import { DriverSystemApp } from './components/driver-system/DriverSystemApp';
import { AdminSystemApp } from './components/admin-system/AdminSystemApp';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'login' | 'register' | 'home' | 'search' | 'activity' | 'service-selection' | 'booking-details' | 'driver-matching' | 'live-tracking' | 'payment' | 'rating' | 'ride-history' | 'profile' | 'driver-dashboard' | 'driver-profile' | 'driver-system' | 'admin-system'>('splash');
  const [userName, setUserName] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [driverMatchMode, setDriverMatchMode] = useState<'ai' | 'manual'>('ai');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState({
    pickup: '',
    dropoff: '',
    pickupLocation: { lat: 26.0667, lng: 50.5577 },
    dropoffLocation: { lat: 26.0667, lng: 50.5577 },
  });
  const [selectedDestination, setSelectedDestination] = useState<{ location: string; area?: string } | null>(null);
  const [selectedDriverName, setSelectedDriverName] = useState<string>('Ahmed Al-Khalifa');
  
  // Driver-specific state
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');

  // AI chatbot widget (public/golocal-ai-chatbot.js) reads this for login / booking hints
  useEffect(() => {
    const hasActiveBooking =
      !!activeOrderId || ['driver-matching', 'live-tracking', 'payment'].includes(currentScreen);
    (window as Window & { GoLocalChatContext?: Record<string, unknown> }).GoLocalChatContext = {
      isLoggedIn: Boolean(currentUserId),
      hasActiveBooking,
      userName: userName || '',
    };
  }, [currentUserId, userName, activeOrderId, currentScreen]);

  // Check if user is already logged in
  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        profileUnsubscribe?.();
        profileUnsubscribe = listenToUserProfile(
          user.uid,
          (userData) => {
            if (!userData) {
              return;
            }
            const normalizedRole = String(userData.role ?? 'user').toLowerCase();
            setUserName(userData.name || '');
            setUserEmail(userData.email || '');
            setUserPhone(userData.phone || '');
            setUserCity(userData.city || '');

            if (normalizedRole === 'driver') {
              setIsDriver(true);
              setCurrentScreen('driver-system');
            } else if (normalizedRole === 'admin') {
              setCurrentScreen('admin-system');
            } else {
              setCurrentScreen('home');
            }
          },
          (error) => {
            console.error('Failed to listen user profile:', error);
          }
        );
      } else {
        setCurrentUserId('');
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        setUserCity('');
        setIsDriver(false);
        setVehicleType('');
        setVehiclePlate('');
        setActiveOrderId(null);
        setCurrentScreen('splash');
      }
    });

    return () => {
      profileUnsubscribe?.();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeOrderId) return;
    const unsubscribe = listenOrderById(activeOrderId, (order) => {
      if (!order) return;
      if (order.status === 'completed' && currentScreen !== 'payment') {
        setCurrentScreen('payment');
      }
      if (order.status === 'cancelled') {
        setActiveOrderId(null);
        setCurrentScreen('home');
      }
    }, (error) => {
      console.error('App: listenOrderById error:', error);
    });
    return unsubscribe;
  }, [activeOrderId, currentScreen]);

  const handleLogout = async () => {
    // Set driver offline if applicable
    if (isDriver && currentUserId) {
      try {
        await setDriverOffline(currentUserId);
      } catch (err) {
        console.error('Failed to set driver offline:', err);
      }
    }

    // Clear all user data
    setUserName('');
    setUserCity('');
    setUserPhone('');
    setUserEmail('');
    setCurrentUserId('');
    setActiveOrderId(null);
    setSelectedServiceType('');
    setSelectedService('');
    setBookingDetails({
      pickup: '',
      dropoff: '',
      pickupLocation: { lat: 26.0667, lng: 50.5577 },
      dropoffLocation: { lat: 26.0667, lng: 50.5577 },
    });
    setSelectedDestination(null);
    setIsDriver(false);
    setVehicleType('');
    setVehiclePlate('');
    // Navigate to splash screen
    setCurrentScreen('splash');
  };

  const handleUpdateProfile = async (name: string, phone: string, email: string) => {
    setUserName(name);
    setUserPhone(phone);
    setUserEmail(email);
    if (!currentUserId) return;
    try {
      await updateUserProfile(currentUserId, { name, phone, email });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (currentScreen === 'login') {
    return (
      <LoginScreen 
        onBack={() => {
          setUserName(''); // Reset to Guest mode
          setCurrentScreen('splash');
        }}
        onCreateAccount={() => setCurrentScreen('register')}
        onLogin={(userData) => {
          setUserName(userData.name || '');
          setUserEmail(userData.email);
          setUserPhone(userData.phone);
          setUserCity(userData.city);
          setCurrentScreen('home');
        }}
        onLoginAsAdmin={(userData) => {
          setUserName(userData.name);
          setUserEmail(userData.email);
          setCurrentScreen('admin-system');
        }}
        onLoginAsDriver={(userData) => {
          setUserName(userData.name);
          setUserEmail(userData.email);
          setUserPhone(userData.phone);
          setUserCity(userData.city);
          setVehicleType(userData.vehicleType);
          setVehiclePlate(userData.vehiclePlate);
          setIsDriver(true);
          setCurrentScreen('driver-system');
        }}
        onNavigateHomeAsGuest={() => {
          setUserName('');
          setCurrentScreen('home');
        }}
        onNavigateProfileAsGuest={() => {
          setUserName(''); // Ensure guest mode
          setCurrentScreen('profile');
        }}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreenWithRoles 
        onBack={() => {
          setUserName(''); // Reset to Guest mode
          setCurrentScreen('splash');
        }}
        onLogin={() => setCurrentScreen('login')}
        onRegisterPassenger={(name: string, city: string) => {
          setUserName(name);
          setUserCity(city);
          setIsDriver(false);
          setCurrentScreen('home');
        }}
        onRegisterDriver={(name: string, city: string, vehicleTypeValue: string, vehiclePlateValue: string, driverLicenseNumber: string, permitNumber: string) => {
          setUserName(name);
          setUserCity(city);
          setVehicleType(vehicleTypeValue);
          setVehiclePlate(vehiclePlateValue);
          setIsDriver(true);
          // Driver needs to wait for approval - show them a pending screen or redirect to login
          setCurrentScreen('login');
        }}
        onNavigateHome={() => {
          setUserName(''); // Ensure guest mode
          setCurrentScreen('home');
        }}
        onNavigateSettings={() => {
          setUserName(''); // Ensure guest mode
          setCurrentScreen('profile');
        }}
      />
    );
  }

  if (currentScreen === 'profile') {
    return (
      <ProfileScreen 
        onBack={() => setCurrentScreen('home')}
        userName={userName}
        userPhone={userPhone}
        userEmail={userEmail}
        onNavigateHome={() => setCurrentScreen('home')}
        onNavigateSearch={() => setCurrentScreen('search')}
        onNavigateHistory={() => setCurrentScreen('ride-history')}
        onNavigateActivity={() => setCurrentScreen('activity')}
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  if (currentScreen === 'ride-history') {
    return (
      <RideHistoryScreen 
        onBack={() => setCurrentScreen('home')}
        userName={userName}
        onNavigateHome={() => setCurrentScreen('home')}
        onNavigateSearch={() => setCurrentScreen('search')}
        onNavigateActivity={() => setCurrentScreen('activity')}
        onNavigateProfile={() => setCurrentScreen('profile')}
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onRebook={(pickup: string, dropoff: string, serviceType: string) => {
          setBookingDetails((prev) => ({ ...prev, pickup, dropoff }));
          setSelectedServiceType(serviceType);
          setCurrentScreen('booking-details');
        }}
      />
    );
  }

  if (currentScreen === 'rating') {
    return (
      <RatingScreen 
        onBack={() => setCurrentScreen('payment')}
        driverName={selectedDriverName}
        driverPhoto="👨‍💼"
        driverRating={4.9}
        pickupLocation={bookingDetails.pickup}
        dropoffLocation={bookingDetails.dropoff}
        fareAmount={7.36}
        onSubmit={() => setCurrentScreen('ride-history')}
      />
    );
  }

  if (currentScreen === 'payment') {
    return (
      <SmartPaymentScreen 
        onBack={() => setCurrentScreen('live-tracking')}
        orderId={activeOrderId}
        pickupLocation={bookingDetails.pickup}
        dropoffLocation={bookingDetails.dropoff}
        driverName={selectedDriverName}
        distance={5.2}
        duration={18}
        onPaymentComplete={() => setCurrentScreen('rating')}
      />
    );
  }

  if (currentScreen === 'live-tracking') {
    return (
      <LiveTrackingScreen 
        onBack={() => setCurrentScreen('driver-matching')}
        driverName={selectedDriverName}
        pickupLocation={bookingDetails.pickup}
        dropoffLocation={bookingDetails.dropoff}
        orderId={activeOrderId}
        onTripComplete={() => setCurrentScreen('payment')}
      />
    );
  }

  if (currentScreen === 'driver-matching') {
    return (
      <DriverMatchingScreen 
        onBack={() => setCurrentScreen('booking-details')}
        pickupLocation={bookingDetails.pickup}
        dropoffLocation={bookingDetails.dropoff}
        onDriverMatched={(name) => {
          if (name) setSelectedDriverName(name);
          setCurrentScreen('live-tracking');
        }}
        userCity={userCity}
        orderId={activeOrderId}
        matchingMode={driverMatchMode}
      />
    );
  }

  if (currentScreen === 'booking-details') {
    return (
      <BookingDetailsScreen 
        onBack={() => setCurrentScreen('service-selection')}
        serviceType={selectedServiceType}
        selectedService={selectedService}
        userName={userName}
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        initialPickup={bookingDetails.pickup}
        initialDropoff={bookingDetails.dropoff}
        onConfirm={(payload) => {
          setDriverMatchMode(payload.matchingMode);
          setBookingDetails({
            pickup: payload.pickupAddress,
            dropoff: payload.dropoffAddress,
            pickupLocation: payload.pickupLocation,
            dropoffLocation: payload.dropoffLocation,
          });
          const submitOrder = async () => {
            if (!currentUserId) {
              setCurrentScreen('driver-matching');
              return;
            }
            try {
              const newOrderId = await createOrder({
                pickupAddress: payload.pickupAddress,
                dropoffAddress: payload.dropoffAddress,
                pickupLocation: payload.pickupLocation,
                dropoffLocation: payload.dropoffLocation,
              });
              setActiveOrderId(newOrderId);
            } catch (error) {
              console.error('Failed to create order:', error);
            } finally {
              setCurrentScreen('driver-matching');
            }
          };
          void submitOrder();
        }}
      />
    );
  }

  if (currentScreen === 'service-selection') {
    return (
      <ServiceSelectionScreen 
        onBack={() => setCurrentScreen('home')}
        serviceType={selectedServiceType}
        onContinue={(service) => {
          setSelectedService(service);
          setCurrentScreen('booking-details');
        }}
        onNavigateHome={() => setCurrentScreen('home')}
        onNavigateProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen 
        onBack={() => setCurrentScreen('splash')}
        userName={userName}
        userCity={userCity}
        onSelectService={(serviceType) => {
          setSelectedServiceType(serviceType);
          setCurrentScreen('service-selection');
        }}
        onViewHistory={() => setCurrentScreen('ride-history')}
        onViewProfile={() => setCurrentScreen('profile')}
        onViewSearch={() => setCurrentScreen('search')}
        onViewActivity={() => setCurrentScreen('activity')}
        selectedDestination={selectedDestination}
      />
    );
  }

  if (currentScreen === 'search') {
    return (
      <SearchScreen 
        onBack={() => setCurrentScreen('home')}
        onNavigateHome={() => setCurrentScreen('home')}
        onNavigateHistory={() => setCurrentScreen('ride-history')}
        onNavigateProfile={() => setCurrentScreen('profile')}
        onNavigateActivity={() => setCurrentScreen('activity')}
        userName={userName}
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onLocationSelect={(location, area) => {
          // Set the selected location as dropoff and navigate to home
          // In a real app, this would update the map or booking form
          console.log('Selected location:', location, area);
          setSelectedDestination({ location, area });
        }}
      />
    );
  }

  if (currentScreen === 'activity') {
    return (
      <ActivityScreen 
        onBack={() => setCurrentScreen('home')}
        userName={userName}
        onNavigateHome={() => setCurrentScreen('home')}
        onNavigateSearch={() => setCurrentScreen('search')}
        onNavigateHistory={() => setCurrentScreen('ride-history')}
        onNavigateProfile={() => setCurrentScreen('profile')}
        onNavigateLogin={() => setCurrentScreen('login')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onRebook={(pickup, dropoff, serviceType) => {
          setSelectedServiceType(serviceType);
          setBookingDetails((prev) => ({ ...prev, pickup, dropoff }));
          setCurrentScreen('booking-details');
        }}
      />
    );
  }

  if (currentScreen === 'driver-dashboard') {
    return (
      <DriverDashboard 
        driverName={userName}
        vehicleType={vehicleType}
        vehiclePlate={vehiclePlate}
        onLogout={handleLogout}
        onViewProfile={() => setCurrentScreen('driver-profile')}
      />
    );
  }

  if (currentScreen === 'driver-profile') {
    return (
      <DriverProfile 
        driverName={userName}
        email={userEmail}
        phone={userPhone}
        city={userCity}
        vehicleType={vehicleType}
        vehiclePlate={vehiclePlate}
        onBack={() => setCurrentScreen('driver-dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'driver-system') {
    return <DriverSystemApp />;
  }

  if (currentScreen === 'admin-system') {
    return <AdminSystemApp />;
  }

  return (
    <SplashScreen 
      onLogin={() => setCurrentScreen('login')}
      onCreateAccount={() => setCurrentScreen('register')}
    />
  );
}