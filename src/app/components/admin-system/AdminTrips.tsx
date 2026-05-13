import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { CheckCircle, ChevronDown, Trash2 } from 'lucide-react';
import { deleteOrder, listenForAllOrders, updateOrderByAdmin } from '../../../services/firebaseService';

interface Trip {
  id: string;
  userName: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';
  createdAt: string;
}

interface AdminTripsProps {
  onNavigate: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminTrips({ onNavigate }: AdminTripsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed' | 'cancelled'>('pending');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'accepted' | 'completed' | 'cancelled'>('pending');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenForAllOrders(
      (orders) => {
        const mappedTrips: Trip[] = orders.map((order) => ({
          id: order.orderId,
          userName: order.userName || 'User',
          driverName: order.assignedDriverName || 'Unassigned',
          pickup: order.pickupAddress || 'Pickup',
          dropoff: order.dropoffAddress || 'Dropoff',
          status: order.status,
          createdAt: (order.createdAt as any)?.toDate?.()?.toLocaleString?.() || 'N/A',
        }));
        setTrips(mappedTrips);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading trips:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'cancelled') return trip.status === 'cancelled' || trip.status === 'rejected';
    return trip.status === activeTab;
  });

  const pendingCount = trips.filter((t) => t.status === 'pending').length;
  const acceptedCount = trips.filter((t) => t.status === 'accepted').length;
  const completedCount = trips.filter((t) => t.status === 'completed').length;
  const cancelledCount = trips.filter((t) => t.status === 'cancelled' || t.status === 'rejected').length;

  const handleStatusChange = (trip: Trip) => {
    setSelectedTrip(trip);
    setNewStatus(trip.status === 'rejected' ? 'cancelled' : trip.status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedTrip) return;
    try {
      await updateOrderByAdmin(selectedTrip.id, { status: newStatus });
      setShowStatusModal(false);
      setSelectedTrip(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrder(tripId);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  return (
    <div className="size-full flex bg-[#F8FAFF]">
      <AdminSidebar activePage="trips" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">Trip Management</h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">Monitor and manage all system trips in real-time</p>
          </div>

          {/* Tabs - Scrollable on Mobile */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'accepted', label: 'Accepted', count: acceptedCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm lg:text-base ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                  }`}
              >
                {tab.label} <span className={`ml-1 opacity-70 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Trips Table */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Order Details</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Users</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Route</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
                          <p className="text-gray-500 font-medium">Loading orders...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-gray-400 font-medium italic">No orders found in this category.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm">#{trip.id.slice(-6)}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{trip.createdAt}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {trip.userName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {trip.driverName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[200px] space-y-1">
                          <p className="text-xs font-bold text-gray-700 truncate" title={trip.pickup}>
                            <span className="text-[#6C5CE7] font-black mr-1">A</span> {trip.pickup}
                          </p>
                          <p className="text-xs font-bold text-gray-500 truncate" title={trip.dropoff}>
                            <span className="text-orange-400 font-black mr-1">B</span> {trip.dropoff}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                          trip.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          trip.status === 'cancelled' || trip.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {trip.status === 'rejected' ? 'cancelled' : trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusChange(trip)}
                            className="p-2 text-gray-400 hover:text-[#6C5CE7] hover:bg-indigo-50 rounded-xl transition-all"
                            title="Edit Status"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Trip"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>


      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Change Trip Status</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Update status for order <span className="font-semibold">{selectedTrip?.id}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'pending' | 'accepted' | 'completed' | 'cancelled')}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-700 font-semibold"
              >
                <option value="pending">pending</option>
                <option value="accepted">accepted</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white font-semibold hover:shadow-lg transition-all"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
