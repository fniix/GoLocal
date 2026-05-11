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
    <div className="size-full flex bg-gradient-to-br from-gray-50 to-blue-50/30">
      <AdminSidebar activePage="users" onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Users Management</h1>
            <p className="text-gray-500 text-lg">Managing customer accounts and profiles</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#5B4FE5] focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Created At</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.email}</td>
                        <td className="px-6 py-4">{user.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'driver' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">{user.createdAt}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              disabled={user.role === 'admin'}
                              className="px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin' || user.id === currentAdminUid}
                              className="px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
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
