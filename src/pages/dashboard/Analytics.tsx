import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Calendar, 
  Eye, 
  MessageSquare, 
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchRecentActivity } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Analytics: React.FC = () => {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: fetchRecentActivity
  });

  const { data: engagementStats, isLoading: engagementLoading } = useQuery({
    queryKey: ['dashboard-engagement', isAdmin, user?.id],
    queryFn: async () => {
      let contentIds: string[] = [];

      if (!isAdmin && user) {
        const { data: contents } = await supabase.from('content').select('id').eq('author_id', user.id);
        contentIds = contents?.map(c => c.id) || [];
        if (contentIds.length === 0) {
          return { views: 0, likes: 0, shares: 0, commentCount: 0 };
        }
      }

      // Admins see everything, Members see interactions on their own content
      let interactionsQuery = supabase.from('interactions').select('*').eq('entity_type', 'content');
      let commentsQuery = supabase.from('comments').select('*').eq('entity_type', 'content');

      if (!isAdmin && user) {
        interactionsQuery = interactionsQuery.in('entity_id', contentIds);
        commentsQuery = commentsQuery.in('entity_id', contentIds);
      }

      const [interactionsRes, commentsRes] = await Promise.all([
        interactionsQuery,
        commentsQuery
      ]);

      const interactions = interactionsRes.data || [];
      const comments = commentsRes.data || [];

      const views = interactions.filter((i: any) => i.interaction_type === 'view').length;
      const likes = interactions.filter((i: any) => i.interaction_type === 'like').length;
      const dislikes = interactions.filter((i: any) => i.interaction_type === 'dislike').length;
      const shares = interactions.filter((i: any) => i.interaction_type === 'share').length;
      const commentCount = comments.length;

      return { views, likes, dislikes, shares, commentCount };
    },
    enabled: !!user
  });
  const handleExport = () => {
    const exportRecord = {
      timestamp: new Date().toISOString(),
      performance_metrics: statsData || {},
      recent_activity_log: activities || []
    };

    const blob = new Blob([JSON.stringify(exportRecord, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_report_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Real-time engagement and growth metrics</p>
        </div>
        <div className="flex gap-2">
            <select className="px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none">
                <option>System Default (Lifetime)</option>
                <option>Last 30 Days</option>
            </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
          <>
            <StatCard 
              title="Total Members" 
              value={statsData?.users.toLocaleString() || '0'} 
              icon={Users} 
              color="secondary"
              isLoading={statsLoading}
            />
            <StatCard 
              title="Scheduled Events" 
              value={statsData?.events.toLocaleString() || '0'} 
              icon={Calendar} 
              color="amber" 
              isLoading={statsLoading}
            />
          </>
        )}
        <StatCard 
          title="Total Views" 
          value={engagementStats?.views.toLocaleString() || '0'} 
          icon={Eye} 
          color="primary" 
          isLoading={engagementLoading}
        />
        <StatCard 
          title="Total Likes" 
          value={engagementStats?.likes.toLocaleString() || '0'} 
          icon={Heart} 
          color="secondary" 
          isLoading={engagementLoading}
        />
        <StatCard 
          title="Total Comments" 
          value={engagementStats?.commentCount.toLocaleString() || '0'} 
          icon={MessageSquare} 
          color="amber" 
          isLoading={engagementLoading}
        />
        <StatCard 
          title="Total Dislikes" 
          value={engagementStats?.dislikes.toLocaleString() || '0'} 
          icon={ThumbsDown} 
          color="primary" 
          isLoading={engagementLoading}
        />
        <StatCard 
          title="Total Shares" 
          value={engagementStats?.shares.toLocaleString() || '0'} 
          icon={ArrowUpRight} 
          color="indigo" 
          isLoading={engagementLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Growth over time
            </h3>
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-secondary" />
                   <span className="text-xs font-medium text-gray-500">Activity</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary" />
                   <span className="text-xs font-medium text-gray-500">Engagement</span>
                </div>
            </div>
          </div>
          <div className="h-72 w-full bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center relative group overflow-hidden">
             <div className="absolute inset-0 bg-white/5 dark:bg-gray-800/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                 <p className="text-xs font-bold uppercase tracking-widest text-secondary rotate-[-5deg] scale-125 border-2 border-secondary px-4 py-2">System Initializing</p>
             </div>
             <BarChart2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-2" />
             <p className="text-sm text-gray-400 font-medium italic">Advanced visual analytics connecting soon...</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Records</h3>
            <div className="space-y-6 flex-1">
                {activitiesLoading ? (
                    <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : activities?.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 text-secondary`}>
                                {i + 1}
                            </div>
                            <div className="truncate max-w-[160px]">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-tighter">{item.type}</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tabular-nums">LIVE</span>
                    </div>
                ))}
                {!activitiesLoading && activities?.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No recent records available.</p>
                )}
            </div>
            <button onClick={handleExport} className="mt-8 text-xs font-bold text-secondary text-center uppercase tracking-widest hover:underline transition-all">
                Export System Report
            </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  icon: any; 
  color: string;
  isLoading: boolean;
}> = ({ title, value, icon: Icon, color, isLoading }) => {
  const colorMap: any = {
    secondary: 'text-secondary bg-secondary/10',
    primary: 'text-primary bg-primary/10',
    amber: 'text-amber-500 bg-amber-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      {isLoading ? (
          <div className="h-9 w-20 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
      ) : (
          <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      )}
    </div>
  );
};

export default Analytics;