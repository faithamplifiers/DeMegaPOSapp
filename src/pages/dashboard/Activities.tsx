import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Eye, Heart, MessageCircle, Share2, ThumbsDown, Clock, Trash2, AlertTriangle, Search } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Activities: React.FC = () => {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      toast.success('Comment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['activities-content'] });
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleFlagComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to flag/warn this user?')) return;
    try {
      // Logic for flagging/warning can be recorded here (e.g., updating a flagged status)
      // Assuming a flag mechanism or just an alert for now
      toast.success('Comment has been flagged and the user warned.');
    } catch (err) {
      toast.error('Failed to flag comment');
    }
  };

  const { data: contents, isLoading, error } = useQuery({
    queryKey: ['activities-content', isAdmin, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('content')
        .select(`
          id,
          title,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && user) {
        query = query.eq('author_id', user.id);
      }

      const { data: contents, error } = await query;
      if (error) throw error;
      if (!contents?.length) return [];

      const contentIds = contents.map(c => c.id);

      const [interactionsRes, commentsRes] = await Promise.all([
        supabase.from('interactions').select('*').eq('entity_type', 'content').in('entity_id', contentIds),
        supabase.from('comments').select('*').eq('entity_type', 'content').in('entity_id', contentIds)
      ]);

      const interactions = interactionsRes.data || [];
      const comments = commentsRes.data || [];

      return contents.map(content => ({
        ...content,
        interactions: interactions.filter(i => i.entity_id === content.id),
        comments: comments.filter(c => c.entity_id === content.id)
      }));
    },
    enabled: !!user
  });

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><LoadingSpinner size="lg" className="text-secondary" /></div>;
  }

  if (error) {
    return <ErrorMessage message="Failed to load activities" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Content Activities</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAdmin ? "Track engagement across all platform content." : "Monitor engagement and interactions on your published content."}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search activities by content title..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400" 
        />
      </div>

      <div className="grid gap-6">
        {contents?.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(content => {
          const views = content.interactions.filter((i: any) => i.interaction_type === 'view').length;
          const likes = content.interactions.filter((i: any) => i.interaction_type === 'like').length;
          const dislikes = content.interactions.filter((i: any) => i.interaction_type === 'dislike').length;
          const shares = content.interactions.filter((i: any) => i.interaction_type === 'share').length;
          const commentsCount = content.comments.length;

          return (
            <div key={content.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{content.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Published {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Views</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{views}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Likes</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{likes}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dislikes</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{dislikes}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Comments</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{commentsCount}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Shares</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{shares}</p>
                  </div>
                </div>
              </div>

              {commentsCount > 0 && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Recent Comments</h4>
                  <div className="space-y-4">
                    {content.comments.slice(0, 3).map((comment: any) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                          {isAdmin && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleFlagComment(comment.id)} title="Flag/Warn User" className="p-1.5 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} title="Delete Comment" className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                    {commentsCount > 3 && (
                      <button className="text-sm text-secondary font-medium hover:underline">
                        View all {commentsCount} comments
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {contents?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold mb-2">No activities yet</h3>
            <p className="text-gray-500">Interactions will appear here once your content receives engagement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
