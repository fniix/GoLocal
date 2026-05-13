import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { CheckCircle, Pencil, Search, Trash2 } from 'lucide-react';
import { deleteUser, listenForAllUsers, updateUserByAdmin } from '../../../services/firebaseService';
import { auth } from '../../../firebase';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'driver' | 'admin';
  createdAt: string;
}

interface AdminUsersProps {
  onNavigate: (page: 'dashboard' | 'users' | 'drivers' | 'trips' | 'delivery' | 'payments' | 'complaints' | 'violations' | 'reports' | 'notifications' | 'settings') => void;
}

export function AdminUsers({ onNavigate }: AdminUsersProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'user' as 'user' | 'driver' | 'admin' });
  const currentAdminUid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    const unsubscribe = listenForAllUsers(
      (items) => {
        const mapped: UserRow[] = items.map((item) => ({
          id: item.uid,
          name: item.name,
          email: item.email,
          phone: item.phone,
          role: item.role,
          createdAt: (item.createdAt as any)?.toDate?.()?.toLocaleString?.() || 'N/A',
        }));
        setUsers(mapped);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q)
    );
    return matchesSearch;
  });

  const openEditModal = (user: UserRow) => {
    if (user.role === 'admin') {
      alert('Admin accounts are protected and cannot be edited here.');
      return;
    }
    setEditingUser(user);
    setEditForm({ name: user.name, phone: user.phone, role: user.role });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUserByAdmin(editingUser.id, {
        name: editForm.name,
        phone: editForm.phone,
        role: editForm.role,
      });
      setEditingUser(null);
      setSuccessMessage('User updated successfully');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const target = users.find((item) => item.id === userId);
    if (target?.role === 'admin') {
      alert('Admin accounts are protected and cannot be deleted here.');
      return;
    }
    if (userId === currentAdminUid) {
      alert('You cannot delete your current admin account.');
      return;
    }
    if (!confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="size-full flex bg-[#F8FAFF]">
      <AdminSidebar activePage="users" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-1 tracking-tight">Users Management</h1>
            <p className="text-sm lg:text-lg text-gray-500 font-normal">Manage customer accounts and profiles</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-4 lg:p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-50 focus:border-[#6C5CE7] focus:outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User Info</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Contact</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                    <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No users found matching your search.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-[15px]">{user.name}</span>
                            <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell">
                          <span className="text-sm text-gray-600 font-medium">{user.phone}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'driver' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 hidden lg:table-cell">
                          <span className="text-xs text-gray-500 font-medium">{user.createdAt}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(user)}
                              disabled={user.role === 'admin'}
                              className="p-2 text-gray-400 hover:text-[#6C5CE7] hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-30"
                              title="Edit User"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin' || user.id === currentAdminUid}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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


      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit User</h3>
            <div className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Name"
              />
              <input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Phone"
              />
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as 'user' | 'driver' | 'admin' }))}
                className="w-full px-4 py-3 border rounded-xl bg-gray-50 cursor-not-allowed"
                disabled
              >
                <option value="user">user</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-3 border rounded-xl">Cancel</button>
              <button onClick={handleUpdateUser} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessNotification && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="font-bold text-lg">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
