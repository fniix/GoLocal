import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { CheckCircle, Pencil, Search, Trash2, FileText, ShieldCheck, XCircle, AlertCircle, Image as ImageIcon, UserCheck, ChevronRight } from 'lucide-react';
import { deleteDriver, listenForAllDrivers, updateDriverByAdmin, updateDriverStatus } from '../../../services/firebaseService';

interface Driver {
  id: string;
  name: string;
  phone: string;
  carType: string;
  status: 'available' | 'busy' | 'offline' | 'pending' | 'approved' | 'rejected';
  location: string;
  joinDate: string;
  rejectionReason?: string;
}

interface AdminDriversProps {
  onNavigate: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminDrivers({ onNavigate }: AdminDriversProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [reviewingDriver, setReviewingDriver] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    carType: '',
    status: 'offline' as any,
    lat: '',
    lng: '',
  });

  useEffect(() => {
    const unsubscribe = listenForAllDrivers(
      (items) => {
        const mapped: Driver[] = items.map((item) => {
          let dateStr = '2024-01-01';
          if (item.createdAt) {
            // Handle Firebase Timestamp or Date
            const date = (item.createdAt as any).toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt as any);
            dateStr = date.toLocaleDateString();
          }
          
          return {
            id: item.driverId || '',
            name: item.name || 'Unknown',
            phone: item.phone || '',
            carType: item.carType || '',
            status: item.status as any || 'pending',
            location: `${item.currentLocation?.lat ?? 'N/A'}, ${item.currentLocation?.lng ?? 'N/A'}`,
            joinDate: dateStr,
            rejectionReason: item.rejectionReason
          };
        });
        setDrivers(mapped);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading drivers:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const pendingDrivers = drivers.filter(d => d.status === 'pending');
  const activeDrivers = drivers.filter(d => d.status !== 'pending');

  const filteredList = (activeTab === 'active' ? activeDrivers : pendingDrivers).filter((driver) => {
    const q = searchQuery.toLowerCase();
    const name = driver.name || '';
    const id = driver.id || '';
    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
  });

  const handleApproveDriver = async (driverId: string) => {
    try {
      await updateDriverByAdmin(driverId, { status: 'approved', rejectionReason: null });
      setReviewingDriver(null);
      setSuccessMessage('Driver approved and activated!');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    if (!rejectionReason) {
      setShowRejectInput(true);
      return;
    }
    try {
      await updateDriverByAdmin(driverId, { status: 'rejected', rejectionReason });
      setReviewingDriver(null);
      setShowRejectInput(false);
      setRejectionReason('');
      setSuccessMessage('Driver application rejected.');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const openEditModal = (driver: Driver) => {
    const [lat, lng] = driver.location.split(',').map((v) => v.trim());
    setEditingDriver(driver);
    setEditForm({
      name: driver.name,
      phone: driver.phone,
      carType: driver.carType,
      status: driver.status,
      lat: lat === 'N/A' ? '' : lat,
      lng: lng === 'N/A' ? '' : lng,
    });
  };

  const handleUpdateDriver = async () => {
    if (!editingDriver) return;
    try {
      await updateDriverByAdmin(editingDriver.id, {
        name: editForm.name,
        phone: editForm.phone,
        carType: editForm.carType,
        status: editForm.status,
        currentLocation: {
          lat: Number(editForm.lat) || 0,
          lng: Number(editForm.lng) || 0,
        },
      });
      setEditingDriver(null);
      setSuccessMessage('Driver updated successfully');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    if (!confirm(`Delete driver ${driver.name}?`)) return;
    try {
      await deleteDriver(driver.id);
      setSuccessMessage('Driver deleted');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="size-full flex bg-gradient-to-br from-gray-50 to-blue-50/30">
      <AdminSidebar activePage="drivers" onNavigate={onNavigate} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Driver Verification</h1>
              <p className="text-gray-500 text-lg">Manage registrations and document approval</p>
            </div>
            
            <div className="flex bg-white rounded-2xl p-1 shadow-md border border-gray-100">
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <UserCheck className="w-4 h-4" />
                Active Drivers
              </button>
              <button 
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                Pending Requests
                {pendingDrivers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
                    {pendingDrivers.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, or phone..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Driver Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Car Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 animate-pulse">Fetching driver records...</td></tr>
                  ) : filteredList.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No {activeTab} drivers found matching your search.</td></tr>
                  ) : (
                    filteredList.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {driver.name ? driver.name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{driver.name}</p>
                              <p className="text-xs text-gray-500">{driver.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg"><ImageIcon className="w-4 h-4 text-gray-500" /></div>
                            <span className="text-sm font-semibold text-gray-700">{driver.carType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            driver.status === 'approved' ? 'bg-green-100 text-green-600' :
                            driver.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            driver.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500 font-medium">{driver.joinDate}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {activeTab === 'pending' ? (
                            <button 
                              onClick={() => setReviewingDriver(driver)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 ml-auto"
                            >
                              Review Docs
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditModal(driver)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteDriver(driver)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Verification Review Modal */}
      {reviewingDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Review Application</h3>
                <p className="text-gray-500">Driver: {reviewingDriver.name} • {reviewingDriver.id}</p>
              </div>
              <button onClick={() => { setReviewingDriver(null); setShowRejectInput(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XCircle className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Document Gallery */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="font-bold text-gray-700">Driving License</span>
                    </div>
                    <div className="aspect-[16/9] bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1554224155-1696413575b8?q=80&w=800" alt="License" className="w-full h-full object-cover opacity-50 grayscale" />
                      <div className="absolute flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Document Preview</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-6 border-2 border-dashed border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                      <span className="font-bold text-gray-700">Vehicle Registration</span>
                    </div>
                    <div className="aspect-[16/9] bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800" alt="Registration" className="w-full h-full object-cover opacity-50 grayscale" />
                    </div>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Verification Checklist
                    </h4>
                    <div className="space-y-4">
                      {[
                        'Name matches ID document',
                        'License is not expired',
                        'Vehicle car type matches selection',
                        'Profile photo is clear'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                          </div>
                          <span className="text-sm text-indigo-800 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {showRejectInput && (
                    <div className="animate-slide-up">
                      <label className="block text-sm font-bold text-red-600 mb-2">Reason for Rejection</label>
                      <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-red-50 border-2 border-red-100 focus:ring-0 focus:border-red-300 transition-all text-sm"
                        placeholder="Explain why the documents were rejected..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => handleRejectDriver(reviewingDriver.id)}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  showRejectInput ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-red-600 border-2 border-red-100'
                }`}
              >
                <XCircle className="w-5 h-5" />
                {showRejectInput ? 'Confirm Rejection' : 'Reject Application'}
              </button>
              <button 
                onClick={() => handleApproveDriver(reviewingDriver.id)}
                className="flex-[2] py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 hover:shadow-green-200 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve & Activate Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Existing) */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Driver Profile</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                <input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Car Model</label>
                <input value={editForm.carType} onChange={(e) => setEditForm((prev) => ({ ...prev, carType: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">System Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setEditingDriver(null)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
              <button onClick={handleUpdateDriver} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all">Update</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-slide-up">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="font-bold">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
