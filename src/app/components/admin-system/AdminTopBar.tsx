import { Search, Bell, ChevronDown, User, Lock, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';

type AdminPage =
  | 'dashboard'
  | 'users'
  | 'drivers'
  | 'trips'
  | 'delivery'
  | 'payments'
  | 'complaints'
  | 'violations'
  | 'reports'
  | 'notifications'
  | 'settings';

export function AdminTopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notificationCount] = useState(3);

  const emitNavigate = (page: AdminPage) => {
    window.dispatchEvent(new CustomEvent('admin:navigate', { detail: page }));
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('admin:toggle-sidebar'));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Admin logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        {/* Burger Menu for Mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Global Search */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, drivers, trips, orders…"
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-gray-100 focus:border-[#6C5CE7] focus:outline-none transition-colors bg-gray-50/50"
            />
          </div>
        </div>
        
        {/* Mobile Search Button */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Search className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex items-center gap-2 lg:gap-4 ml-4">
        {/* Notification Icon with Badge */}
        <button
          onClick={() => emitNavigate('notifications')}
          className="relative p-2 hover:bg-[#EEF3FF] rounded-xl transition-colors"
          title="Open notifications"
        >
          <Bell className="w-6 h-6 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#E74C3C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 lg:gap-3 lg:pl-4 lg:border-l lg:border-gray-200 hover:bg-[#EEF3FF] rounded-xl px-2 lg:px-3 py-1.5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-md">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-xs text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-500">Manager</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    emitNavigate('settings');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F4F2FF] transition-colors text-left group"
                >
                  <User className="w-4 h-4 text-gray-400 group-hover:text-[#6C5CE7]" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#6C5CE7]">View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    emitNavigate('settings');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F4F2FF] transition-colors text-left group"
                >
                  <Lock className="w-4 h-4 text-gray-400 group-hover:text-[#6C5CE7]" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#6C5CE7]">Security</span>
                </button>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    void handleLogout();
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left group"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-500">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
