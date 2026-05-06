import { ArrowLeft, User, Phone, Mail, Edit, MapPin, CreditCard, Bell, Globe, LogOut, ChevronRight, Star, Award, Gift, Shield, HelpCircle, FileText, Share2, Settings, Heart, Zap, Home, Search, Clock, User as UserIcon, Camera, History } from 'lucide-react';
import { useState } from 'react';
import { EditProfileScreen } from './EditProfileScreen';
import { SavedLocationsScreen } from './SavedLocationsScreen';
import { PaymentMethodsScreen } from './PaymentMethodsScreen';
import { NotificationSettingsScreen } from './NotificationSettingsScreen';
import { LanguageScreen } from './LanguageScreen';
import { PrivacySecurityScreen } from './PrivacySecurityScreen';
import { HelpCenterScreen } from './HelpCenterScreen';
import { TermsPoliciesScreen } from './TermsPoliciesScreen';
import { AboutScreen } from './AboutScreen';
import { GiftVoucherScreen } from './GiftVoucherScreen';

interface ProfileScreenProps {
  onBack: () => void;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  onNavigateHome?: () => void;
  onNavigateSearch?: () => void;
  onNavigateHistory?: () => void;
  onNavigateActivity?: () => void;
  onNavigateLogin?: () => void;
  onNavigateRegister?: () => void;
  onLogout?: () => void;
  onUpdateProfile?: (name: string, phone: string, email: string) => void;
}

export function ProfileScreen({ onBack, userName, userPhone, userEmail, onNavigateHome, onNavigateSearch, onNavigateHistory, onNavigateActivity, onNavigateLogin, onNavigateRegister, onLogout, onUpdateProfile }: ProfileScreenProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  // Check if user is a guest (not logged in)
  const isGuest = userName === 'Guest User';

  // Items that require authentication
  const requiresAuth = ['edit-profile', 'saved-locations', 'payment-methods', 'notifications', 'privacy', 'gift-vouchers'];

  // Handle profile item click
  const handleItemClick = (itemId: string) => {
    // If guest user and item requires auth, show modal
    if (isGuest && requiresAuth.includes(itemId)) {
      setShowAuthModal(true);
      return;
    }

    // Otherwise, navigate to the screen
    setSelectedScreen(itemId);
  };

  // Render settings screen if selected
  if (selectedScreen) {
    switch (selectedScreen) {
      case 'edit-profile':
        return (
          <EditProfileScreen
            onBack={() => setSelectedScreen(null)}
            userName={userName}
            userPhone={userPhone || ''}
            userEmail={userEmail || ''}
            onSave={(name, phone, email) => {
              if (onUpdateProfile) {
                onUpdateProfile(name, phone, email);
              }
              setSelectedScreen(null);
            }}
          />
        );
      case 'saved-locations':
        return (
          <SavedLocationsScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'payment-methods':
        return (
          <PaymentMethodsScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'language':
        return (
          <LanguageScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'privacy':
        return (
          <PrivacySecurityScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'help':
        return (
          <HelpCenterScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'terms':
        return (
          <TermsPoliciesScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'about':
        return (
          <AboutScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      case 'gift-vouchers':
        return (
          <GiftVoucherScreen
            onBack={() => setSelectedScreen(null)}
          />
        );
      default:
        return null;
    }
  }

  // Mock user stats
  const userStats = {
    totalRides: 47,
    rating: 4.8,
    memberSince: 'Jan 2024',
    savedLocations: 5,
    referrals: 3
  };

  const accountSettings = [
    {
      id: 'edit-profile',
      icon: <Edit className="w-5 h-5" />,
      label: 'Edit Profile',
      description: 'Update your personal information',
      color: 'purple',
      badge: null
    },
    {
      id: 'saved-locations',
      icon: <MapPin className="w-5 h-5" />,
      label: 'Saved Locations',
      description: `${userStats.savedLocations} locations saved`,
      color: 'blue',
      badge: userStats.savedLocations.toString()
    },
    {
      id: 'payment-methods',
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Payment Methods',
      description: 'Manage cards and wallets',
      color: 'green',
      badge: null
    },
    {
      id: 'gift-vouchers',
      icon: <Gift className="w-5 h-5" />,
      label: 'Gift Vouchers',
      description: 'Create and share gift codes',
      color: 'pink',
      badge: null
    }
  ];

  const appSettings = [
    {
      id: 'notifications',
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      description: 'Push notifications & alerts',
      color: 'orange',
      badge: null
    },
    {
      id: 'language',
      icon: <Globe className="w-5 h-5" />,
      label: 'Language',
      description: 'English (US)',
      color: 'indigo',
      badge: null
    },
    {
      id: 'privacy',
      icon: <Shield className="w-5 h-5" />,
      label: 'Privacy & Security',
      description: 'Control your data',
      color: 'red',
      badge: null
    }
  ];

  const supportSettings = [
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help Center',
      description: 'FAQs and support',
      color: 'teal',
      badge: null
    },
    {
      id: 'terms',
      icon: <FileText className="w-5 h-5" />,
      label: 'Terms & Policies',
      description: 'Legal information',
      color: 'gray',
      badge: null
    },
    {
      id: 'about',
      icon: <Settings className="w-5 h-5" />,
      label: 'About GoLocal',
      description: 'Version 2.1.0',
      color: 'purple',
      badge: null
    }
  ];

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">Profile</h1>
            <p className="text-white/90 text-sm">Manage your account</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {isGuest ? (
            // Guest User View
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4">
                G
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Guest User</h2>
              <p className="text-gray-600 mb-6">
                Sign in to view your profile details and access all features
              </p>
              <div className="space-y-3">
                <button
                  onClick={onNavigateLogin}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={onNavigateRegister}
                  className="w-full py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            // Logged-in User View
            <>
              <div className="flex items-center gap-4 mb-4">
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* User Details */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{userName}</h2>
                  <div className="space-y-1">
                    {userPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-sm">{userPhone}</span>
                      </div>
                    )}
                    {userEmail && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="text-sm">{userEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button className="w-10 h-10 bg-purple-50 hover:bg-purple-100 rounded-full flex items-center justify-center transition-colors">
                  <Edit className="w-5 h-5 text-purple-600" />
                </button>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500">Rides</p>
                  <p className="text-lg font-bold text-gray-800">{userStats.totalRides}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-gray-800">{userStats.rating}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500">Member</p>
                  <p className="text-lg font-bold text-gray-800">{userStats.memberSince}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Referral Banner - Only show for logged-in users */}
        {!isGuest && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Gift className="w-32 h-32" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-white" />
                <h3 className="text-white font-bold text-lg">Refer & Earn</h3>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Invite friends and get BD 5.00 for each successful referral!
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white text-purple-600 py-2.5 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Code
                </button>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl flex items-center">
                  <span className="text-white font-bold text-sm">{userStats.referrals} referred</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 px-1">Account</h3>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {accountSettings.map((setting, index) => (
              <button
                key={setting.id}
                onClick={() => handleItemClick(setting.id)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== accountSettings.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-11 h-11 bg-${setting.color}-50 rounded-xl flex items-center justify-center text-${setting.color}-600`}>
                  {setting.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                {setting.badge && (
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">
                    {setting.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* App Settings Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 px-1">App Settings</h3>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {appSettings.map((setting, index) => (
              <button
                key={setting.id}
                onClick={() => handleItemClick(setting.id)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== appSettings.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-11 h-11 bg-${setting.color}-50 rounded-xl flex items-center justify-center text-${setting.color}-600`}>
                  {setting.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 px-1">Support</h3>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {supportSettings.map((setting, index) => (
              <button
                key={setting.id}
                onClick={() => handleItemClick(setting.id)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  index !== supportSettings.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className={`w-11 h-11 bg-${setting.color}-50 rounded-xl flex items-center justify-center text-${setting.color}-600`}>
                  {setting.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Rate App */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-1">Enjoying GoLocal?</h3>
              <p className="text-sm text-gray-600">Rate us on the App Store</p>
            </div>
            <button 
              onClick={() => {
                // Simulate app store redirect
                alert('Redirecting to App Store... Thank you for your support!');
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Rate
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white border-2 border-red-500 rounded-2xl shadow-md p-4 flex items-center justify-center gap-3 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-red-600">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Logout</h3>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    onBack();
                  }
                }}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
              <p className="text-gray-600">You need to sign in to access this feature.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onNavigateLogin}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={onNavigateHome}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>

          <button 
            onClick={onNavigateSearch}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs">Search</span>
          </button>

          <button 
            onClick={onNavigateHistory}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-xs">History</span>
          </button>

          <button 
            onClick={onNavigateActivity}
            className="flex flex-col items-center text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs">Activity</span>
          </button>

          <button className="flex flex-col items-center text-purple-600 transition-colors">
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}