import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UserManager: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role. Check database permissions.');
    }
  };

  const handleInviteInfo = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">To add a new Administrator:</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ask the user to sign up at /register first. Once they appear in this list, use the role dropdown to "admin".
          </p>
        </div>
      </div>
    ), { duration: 6000 });
  };

  if (loading) {
     return <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold">Admins & Community</h1>
           <p className="text-sm text-gray-500">Manage user roles and permissions</p>
        </div>
        <button 
          onClick={handleInviteInfo}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700"
                          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || profile.username}&background=random`}
                          alt={profile.full_name || profile.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {profile.full_name || profile.username || 'No details'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Mail size={12} /> {profile.email || 'Click to view'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === profile.id ? (
                      <select 
                        autoFocus
                        value={profile.role}
                        onChange={(e) => handleUpdateRole(profile.id, e.target.value)}
                        onBlur={() => setEditingUserId(null)}
                        className="text-sm rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-secondary focus:border-secondary"
                      >
                         <option value="member">Member</option>
                         <option value="content_creator">Content Creator</option>
                         <option value="event_organizer">Event Organizer</option>
                         <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        profile.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                          : profile.role === 'member'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {profile.role?.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                       <Calendar size={14} />
                       {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => setEditingUserId(profile.id)}
                        disabled={profile.id === currentUser?.id}
                        className="text-secondary hover:text-secondary-light flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Shield className="w-4 h-4" />
                        Permissions
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
         <div className="flex gap-3">
            <Shield className="text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
               <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Security Requirement</p>
               <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Only Administrators listed here can access the <code className="bg-white/50 dark:bg-black/20 px-1 rounded">/fa-admin</code> portal. To add a team member, have them register for a basic account first, then find them here to upgrade their permissions.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UserManager;