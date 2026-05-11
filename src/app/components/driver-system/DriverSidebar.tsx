import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { Home, FileText, Inbox, Truck, DollarSign, Star, User, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

type DriverPage = 'dashboard' | 'my-offers' | 'incoming-requests' | 'active-deliveries' | 'earnings' | 'reviews' | 'profile';

interface DriverSidebarProps {
  activePage: DriverPage;
  onNavigateToDashboard: () => void;
  onNavigateToMyOffers: () => void;
  onNavigateToIncomingRequests: () => void;
  onNavigateToActiveDeliveries: () => void;
  onNavigateToEarnings: () => void;
  onNavigateToReviews: () => void;
  onNavigateToProfile: () => void;
  pendingRequestsCount?: number;
  activeDeliveriesCount?: number;
  driverName?: string;
  onLogout?: () => void;
}

export function DriverSidebar({
  activePage,
  onNavigateToDashboard,
  onNavigateToMyOffers,
  onNavigateToIncomingRequests,
  onNavigateToActiveDeliveries,
  onNavigateToEarnings,
  onNavigateToReviews,
  onNavigateToProfile,
  pendingRequestsCount = 0,
  activeDeliveriesCount = 0,
  driverName = 'Driver',
  onLogout,
}: DriverSidebarProps) {
  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard' as DriverPage,           label: 'Dashboard',        icon: Home,       onClick: onNavigateToDashboard,          badge: 0 },
    { id: 'my-offers' as DriverPage,           label: 'My Offers',        icon: FileText,   onClick: onNavigateToMyOffers,           badge: 0 },
    { id: 'incoming-requests' as DriverPage,   label: 'Incoming',         icon: Inbox,      onClick: onNavigateToIncomingRequests,   badge: pendingRequestsCount },
    { id: 'active-deliveries' as DriverPage,   label: 'Active Deliveries',icon: Truck,      onClick: onNavigateToActiveDeliveries,   badge: activeDeliveriesCount },
    { id: 'earnings' as DriverPage,            label: 'Earnings',         icon: DollarSign, onClick: onNavigateToEarnings,           badge: 0 },
    { id: 'reviews' as DriverPage,             label: 'Reviews',          icon: Star,       onClick: onNavigateToReviews,            badge: 0 },
    { id: 'profile' as DriverPage,             label: 'Profile',          icon: User,       onClick: onNavigateToProfile,            badge: 0 },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-purple-600 to-blue-600 text-white flex-shrink-0 flex flex-col relative transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-purple-600 hover:text-purple-800 hover:shadow-lg transition-all duration-200"
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4" />
          : <ChevronLeft className="w-4 h-4" />
        }
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-white/10 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <h2 className="font-bold text-lg whitespace-nowrap">Driver System</h2>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              title={collapsed ? item.label : undefined}
              className={`w-full py-3 flex items-center transition-all duration-200 relative group ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-6'
              } ${
                isActive
                  ? 'bg-white/10 border-l-4 border-white font-semibold'
                  : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`ml-auto text-white text-xs px-2 py-0.5 rounded-full ${
                      item.id === 'incoming-requests' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {/* Badge dot when collapsed */}
              {collapsed && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full" />
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  {item.label}
                  {item.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer — Profile + Logout */}
      {!collapsed ? (
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Driver info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Driver</p>
              <p className="text-xs text-white/70 truncate">{driverName}</p>
            </div>
          </div>
          {/* Logout button — always visible */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-300 hover:text-red-200 transition-all duration-200 border border-red-400/20"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2">
          {/* User avatar icon */}
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {/* Logout icon with tooltip */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="relative group w-9 h-9 rounded-xl bg-red-500/15 hover:bg-red-500/30 flex items-center justify-center transition-all duration-200"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
              Logout
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
