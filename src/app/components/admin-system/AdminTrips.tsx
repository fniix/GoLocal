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
    <div className="size-full flex bg-[#EEF3FF]">
      <AdminSidebar activePage="trips" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Trip Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage all trips</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'pending'
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'accepted'
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Accepted ({acceptedCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'completed'
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'cancelled'
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              Cancelled ({cancelledCount})
            </button>
          </div>

          {/* Trips Table */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pickup
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dropoff
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading orders...</td>
                    </tr>
                  ) : filteredTrips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                    </tr>
                  ) : filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{trip.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-700">{trip.userName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-700">{trip.driverName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{trip.pickup}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{trip.dropoff}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {trip.status === 'rejected' ? 'cancelled' : trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{trip.createdAt}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusChange(trip)}
                            className="px-3 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ChevronDown className="w-3 h-3" />
                            Change Status
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
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
