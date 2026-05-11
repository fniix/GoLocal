import { useState } from 'react';
import { Home, Users, Car, Navigation, Package, CreditCard, MessageSquare, AlertTriangle, FileText, Bell, Settings, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface AdminSidebarProps {
  activePage: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings';
  onNavigate?: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
    <aside
      className={`bg-white border-r border-gray-100 flex-shrink-0 flex flex-col shadow-sm transition-all duration-300 ease-in-out relative ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Toggle Button — floats on the right edge */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-[#6C5CE7] hover:border-[#6C5CE7] hover:shadow-lg transition-all duration-200"
      >
        {collapsed
          ? <ChevronRight className="w-4 h-4" />
          : <ChevronLeft className="w-4 h-4" />
        }
      </button>

      {/* Logo */}
      <div className="p-4 border-b border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">GOLOCAL</h1>
              <p className="text-xs text-gray-500 font-semibold">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full py-3 flex items-center transition-all duration-200 relative group ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-6'
              } ${
                isActive
                  ? 'bg-[#A29BFE] text-[#6C5CE7] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#6C5CE7]'
              }`}
              style={isActive && !collapsed ? { borderRadius: '0 12px 12px 0', marginRight: '8px' } : {}}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />

              {!collapsed && (
                <>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Badge dot when collapsed */}
              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse hint at bottom */}
      {!collapsed && (
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#6C5CE7] transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Collapse sidebar</span>
          </button>
        </div>
      )}
    </aside>
  );
}