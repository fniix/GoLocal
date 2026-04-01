import { Home, Users, Car, Navigation, Package, CreditCard, MessageSquare, AlertTriangle, FileText, Bell, Settings } from 'lucide-react';

interface AdminSidebarProps {
  activePage: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings';
  onNavigate?: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'drivers' as const, label: 'Drivers', icon: Car },
    { id: 'trips' as const, label: 'Trips', icon: Navigation },
    { id: 'delivery' as const, label: 'Delivery', icon: Package },
    { id: 'payments' as const, label: 'Payments', icon: CreditCard },
    { id: 'complaints' as const, label: 'Complaints', icon: MessageSquare },
    { id: 'violations' as const, label: 'Violations', icon: AlertTriangle },
    { id: 'reports' as const, label: 'Reports', icon: FileText },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, badge: 3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">GOLOCAL</h1>
            <p className="text-xs text-gray-500 font-semibold">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`w-full px-6 py-3 flex items-center gap-3 transition-all duration-200 relative group ${
                isActive
                  ? 'bg-[#A29BFE] text-[#6C5CE7] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#6C5CE7]'
              }`}
              style={isActive ? { borderRadius: '0 12px 12px 0', marginRight: '8px' } : {}}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}