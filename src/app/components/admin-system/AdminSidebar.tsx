import { useState, useEffect } from 'react';
import { Home, Users, Car, Navigation, Package, CreditCard, MessageSquare, AlertTriangle, FileText, Bell, Settings, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface AdminSidebarProps {
  activePage: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings';
  onNavigate?: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('admin:toggle-sidebar', handleToggle);
    window.addEventListener('admin:close-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('admin:toggle-sidebar', handleToggle);
      window.removeEventListener('admin:close-sidebar', handleClose);
    };
  }, []);

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

  const handleItemClick = (id: typeof activePage) => {
    onNavigate?.(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`bg-white border-r border-gray-100 flex-shrink-0 flex flex-col shadow-sm transition-all duration-300 ease-in-out fixed lg:relative inset-y-0 left-0 z-[70] lg:z-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed ? 'lg:w-[72px]' : 'w-72 lg:w-64'
        }`}
      >
        {/* Toggle Button — floats on the right edge (Desktop only) */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-500 hover:text-[#6C5CE7] hover:border-[#6C5CE7] hover:shadow-lg transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="transition-opacity duration-200">
                <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">GOLOCAL</h1>
                <p className="text-xs text-gray-500 font-semibold tracking-wider">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full py-3.5 flex items-center transition-all duration-200 relative group ${
                  collapsed && !isMobileOpen ? 'justify-center px-0' : 'gap-4 px-6'
                } ${
                  isActive
                    ? 'bg-[#F4F2FF] text-[#6C5CE7] font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#6C5CE7]'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6C5CE7] rounded-r-full" />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-110' : ''} transition-transform`} />

                {(!collapsed || isMobileOpen) && (
                  <>
                    <span className="whitespace-nowrap text-[15px]">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Badge dot when collapsed */}
                {collapsed && !isMobileOpen && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}

                {/* Tooltip when collapsed */}
                {collapsed && !isMobileOpen && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl font-medium">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {(!collapsed || isMobileOpen) && (
          <div className="p-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">System Online</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}