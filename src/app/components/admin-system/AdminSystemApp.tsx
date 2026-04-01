import { useEffect, useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminDrivers } from './AdminDrivers';
import { AdminTrips } from './AdminTrips';
import { AdminDelivery } from './AdminDelivery';
import { AdminPayments } from './AdminPayments';
import { AdminComplaints } from './AdminComplaints';
import { AdminViolations } from './AdminViolations';
import { AdminReports } from './AdminReports';
import { AdminNotifications } from './AdminNotifications';
import { AdminSettings } from './AdminSettings';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase';
import { listenToUserProfile } from '../../../services/firebaseService';

export function AdminSystemApp() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings'>('dashboard');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let unProfile: (() => void) | null = null;
    const unAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setIsAllowed(false);
        setCheckingAccess(false);
        window.location.href = '/';
        return;
      }

      unProfile = listenToUserProfile(
        firebaseUser.uid,
        (profile) => {
          const allowed = profile?.role === 'admin';
          setIsAllowed(allowed);
          setCheckingAccess(false);
          if (!allowed) {
            window.location.href = '/';
          }
        },
        () => {
          setIsAllowed(false);
          setCheckingAccess(false);
          window.location.href = '/';
        }
      );
    });

    return () => {
      unAuth();
      if (unProfile) unProfile();
    };
  }, []);

  useEffect(() => {
    const allowedPages = new Set([
      'dashboard',
      'users',
      'drivers',
      'trips',
      'delivery',
      'payments',
      'complaints',
      'violations',
      'reports',
      'notifications',
      'settings',
    ]);

    const handleTopBarNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const nextPage = customEvent.detail;
      if (typeof nextPage === 'string' && allowedPages.has(nextPage)) {
        setCurrentPage(nextPage as typeof currentPage);
      }
    };

    window.addEventListener('admin:navigate', handleTopBarNavigation as EventListener);
    return () => {
      window.removeEventListener('admin:navigate', handleTopBarNavigation as EventListener);
    };
  }, []);

  if (checkingAccess) {
    return <div className="size-full flex items-center justify-center text-gray-500">Checking admin access...</div>;
  }

  if (!isAllowed) {
    return <div className="size-full flex items-center justify-center text-gray-500">Redirecting...</div>;
  }

  // Navigate based on current page
  const handleNavigation = (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => {
    setCurrentPage(page);
  };

  // Dashboard
  if (currentPage === 'dashboard') {
    return <AdminDashboard onNavigate={handleNavigation} />;
  }

  // Users
  if (currentPage === 'users') {
    return <AdminUsers onNavigate={handleNavigation} />;
  }

  // Drivers
  if (currentPage === 'drivers') {
    return <AdminDrivers onNavigate={handleNavigation} />;
  }

  // Trips
  if (currentPage === 'trips') {
    return <AdminTrips onNavigate={handleNavigation} />;
  }

  // Delivery
  if (currentPage === 'delivery') {
    return <AdminDelivery onNavigate={handleNavigation} />;
  }

  // Payments
  if (currentPage === 'payments') {
    return <AdminPayments onNavigate={handleNavigation} />;
  }

  // Complaints
  if (currentPage === 'complaints') {
    return <AdminComplaints onNavigate={handleNavigation} />;
  }

  // Violations
  if (currentPage === 'violations') {
    return <AdminViolations onNavigate={handleNavigation} />;
  }

  // Reports
  if (currentPage === 'reports') {
    return <AdminReports onNavigate={handleNavigation} />;
  }

  // Notifications
  if (currentPage === 'notifications') {
    return <AdminNotifications onNavigate={handleNavigation} />;
  }

  // Settings
  if (currentPage === 'settings') {
    return <AdminSettings onNavigate={handleNavigation} />;
  }

  return <AdminDashboard onNavigate={handleNavigation} />;
}