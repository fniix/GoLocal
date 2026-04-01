import { Search, Bell, ChevronDown, User, Lock, LogOut } from 'lucide-react';
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
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Global Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, drivers, trips, orders…"
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#6C5CE7] focus:outline-none transition-colors bg-[#EEF3FF]/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        {/* Notification Icon with Badge */}
        <button
          onClick={() => emitNavigate('notifications')}
          className="relative p-2 hover:bg-[#EEF3FF] rounded-xl transition-colors"
          title="Open notifications"
        >
          <Bell className="w-6 h-6 text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E74C3C] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-[#EEF3FF] rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="font-semibold text-sm text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">System Manager</p>
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
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    emitNavigate('settings');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#EEF3FF] transition-colors text-left"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    emitNavigate('settings');
                    alert('Go to Settings to update password.');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#EEF3FF] transition-colors text-left"
                >
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">Change Password</span>
                </button>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    void handleLogout();
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-[#E74C3C]" />
                  <span className="text-sm font-semibold text-[#E74C3C]">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
