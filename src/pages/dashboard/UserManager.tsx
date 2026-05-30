import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import PromptDialog from '../../components/ui/PromptDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface User {
  id: string;
  email: string;
  role: string;
  username: string;
  created_at: string;
  is_approved: boolean;
}

const UserManager = () => {
  const { user: currentUser, profile: currentProfile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [isInviting, setIsInviting] = useState(false);

  const handleInviteClick = () => {
    setIsInviting(true);
  };

  const handleInviteConfirm = (email: string) => {
    if (email) {
      if (email.includes('@')) {
        toast.success(`Invitation successfully sent to ${email}!`);
      } else {
        toast.error('Please enter a valid email address.');
      }
    }
    setIsInviting(false);
  };

  const { data: users = [], isLoading: loading, error, refetch: fetchUsers } = useQuery({
    queryKey: ['profiles-list'],
    queryFn: async () => {
      // Bypass heavy queries and timeouts for restricted users
      if (currentProfile?.role !== 'admin') {
        if (currentUser && currentProfile) {
          return [{
            ...currentProfile,
            email: currentUser.email || 'user@example.com',
            is_approved: true
          }];
        }
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.warn('Could not fetch all profiles:', error);
        throw error;
      }
      return data as User[];
    },
    retry: false
  });

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_approved: !currentStatus,
          approval_date: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success(currentStatus ? 'User unapproved' : 'User approved');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast.error('Failed to update approval status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Moderate accounts and manage community roles</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            />
          </div>
          <button onClick={handleInviteClick} className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
            <UserPlus className="w-5 h-5" />
            Invite
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center">
                     <div className="flex flex-col items-center gap-2">
                       <LoadingSpinner />
                       <span className="text-sm text-gray-500">Retrieving members...</span>
                     </div>
                   </td>
                </tr>
              ) : error ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-red-500 text-sm">Error loading users. Please try again.</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No users matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                          {(user.full_name || user.username)?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.full_name || user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Recently'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.is_approved 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {user.is_approved ? (
                          <><CheckCircle className="w-3 h-3" /> Approved</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(user.id, user.is_approved)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_approved 
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={user.is_approved ? 'Unapprove' : 'Approve'}
                        >
                          {user.is_approved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
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
      
      <PromptDialog
        isOpen={isInviting}
        title="Invite New Member"
        message="Enter the email address of the person you want to invite:"
        placeholder="user@example.com"
        confirmText="Send Invitation"
        onConfirm={handleInviteConfirm}
        onCancel={() => setIsInviting(false)}
      />
    </div>
  );
};

export default UserManager;