import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Clock, ArrowLeft, Share2, Heart, MessageCircle, Send, Eye, ThumbsDown } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: article, error, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: interactions } = useQuery({
    queryKey: ['interactions', 'content', article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('entity_type', 'content')
        .eq('entity_id', article!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!article?.id
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', 'content', article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, user:profiles(*)`)
        .eq('entity_type', 'content')
        .eq('entity_id', article!.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!article?.id
  });

  useEffect(() => {
    // Record view if not already recorded by this user
    const recordView = async () => {
      if (article && user) {
        const { data } = await supabase.from('interactions')
          .select('id')
          .eq('entity_type', 'content')
          .eq('entity_id', article.id)
          .eq('user_id', user.id)
          .eq('interaction_type', 'view')
          .single();
          
        if (!data) {
          await supabase.from('interactions').insert({
            entity_type: 'content',
            entity_id: article.id,
            user_id: user.id,
            interaction_type: 'view'
          });
          queryClient.invalidateQueries({ queryKey: ['interactions', 'content', article.id] });
        }
      }
    };
    recordView();
  }, [article?.id, user?.id]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please log in to like this article');
      return;
    }
    const hasLiked = interactions?.some(i => i.interaction_type === 'like' && i.user_id === user.id);
    const hasDisliked = interactions?.some(i => i.interaction_type === 'dislike' && i.user_id === user.id);
    
    if (hasLiked) {
      await supabase.from('interactions')
        .delete()
        .eq('entity_type', 'content')
        .eq('entity_id', article!.id)
        .eq('user_id', user.id)
        .eq('interaction_type', 'like');
    } else {
      if (hasDisliked) {
        await supabase.from('interactions')
          .delete()
          .eq('entity_type', 'content')
          .eq('entity_id', article!.id)
          .eq('user_id', user.id)
          .eq('interaction_type', 'dislike');
      }
      await supabase.from('interactions').insert({
        entity_type: 'content',
        entity_id: article!.id,
        user_id: user.id,
        interaction_type: 'like'
      });
    }
    queryClient.invalidateQueries({ queryKey: ['interactions', 'content', article!.id] });
  };

  const toggleDislike = async () => {
    if (!user) {
      toast.error('Please log in to dislike this article');
      return;
    }
    const hasLiked = interactions?.some(i => i.interaction_type === 'like' && i.user_id === user.id);
    const hasDisliked = interactions?.some(i => i.interaction_type === 'dislike' && i.user_id === user.id);
    
    if (hasDisliked) {
      await supabase.from('interactions')
        .delete()
        .eq('entity_type', 'content')
        .eq('entity_id', article!.id)
        .eq('user_id', user.id)
        .eq('interaction_type', 'dislike');
    } else {
      if (hasLiked) {
        await supabase.from('interactions')
          .delete()
          .eq('entity_type', 'content')
          .eq('entity_id', article!.id)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like');
      }
      await supabase.from('interactions').insert({
        entity_type: 'content',
        entity_id: article!.id,
        user_id: user.id,
        interaction_type: 'dislike'
      });
    }
    queryClient.invalidateQueries({ queryKey: ['interactions', 'content', article!.id] });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
        if (user) {
          await supabase.from('interactions').insert({
            entity_type: 'content',
            entity_id: article!.id,
            user_id: user.id,
            interaction_type: 'share'
          });
        }
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
      if (user) {
        await supabase.from('interactions').insert({
          entity_type: 'content',
          entity_id: article!.id,
          user_id: user.id,
          interaction_type: 'share'
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['interactions', 'content', article?.id] });
  };

  const [newComment, setNewComment] = useState('');
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;
    
    const { error } = await supabase.from('comments').insert({
      entity_type: 'content',
      entity_id: article!.id,
      user_id: user.id,
      text: newComment.trim()
    });
    
    if (error) {
      toast.error('Failed to post comment');
    } else {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', 'content', article!.id] });
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="text-secondary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-32 pb-20 container-custom min-h-[60vh]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/news')} className="btn btn-primary">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  const coverImage = article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80';
  const authorName = article.author?.full_name || article.author?.username || 'Anonymous';
  const publishDate = article.published_at || article.created_at;

  return (
    <article className="pt-24 pb-20 bg-light-gray dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-black overflow-hidden flex justify-center">
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" 
          style={{ backgroundImage: `url(${coverImage})` }}
        ></div>
        
        {/* Actual Image, contained */}
        <img 
          src={coverImage} 
          alt={article.title}
          className="relative z-10 max-w-full max-h-full object-contain"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-30">
          <div className="container-custom max-w-4xl mx-auto">
            <Link to="/news" className="inline-flex items-center text-sm font-medium hover:text-secondary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Link>
            
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-secondary text-primary text-sm font-medium rounded-full mb-4">
                {(article.category || 'News').charAt(0).toUpperCase() + (article.category || 'news').slice(1)}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{article.title}</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center">
                <img 
                  src={article.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`} 
                  alt={authorName}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white/20"
                />
                <span className="font-medium text-white">{authorName}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{format(new Date(publishDate), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom max-w-4xl mx-auto mt-12 px-4">
        {/* Interaction Bar */}
        <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex gap-4">
            <button onClick={toggleLike} className={`flex items-center transition-colors ${interactions?.some(i => i.interaction_type === 'like' && i.user_id === user?.id) ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}>
              <Heart className={`w-5 h-5 mr-1 ${interactions?.some(i => i.interaction_type === 'like' && i.user_id === user?.id) ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{interactions?.filter(i => i.interaction_type === 'like').length || 0} Like{interactions?.filter(i => i.interaction_type === 'like').length !== 1 ? 's' : ''}</span>
            </button>
            <button onClick={toggleDislike} className={`flex items-center transition-colors ${interactions?.some(i => i.interaction_type === 'dislike' && i.user_id === user?.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
              <ThumbsDown className={`w-5 h-5 mr-1 ${interactions?.some(i => i.interaction_type === 'dislike' && i.user_id === user?.id) ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{interactions?.filter(i => i.interaction_type === 'dislike').length || 0} Dislike{interactions?.filter(i => i.interaction_type === 'dislike').length !== 1 ? 's' : ''}</span>
            </button>
            <div className="flex items-center text-gray-500">
              <MessageCircle className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{comments?.length || 0} Comment{comments?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Eye className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{interactions?.filter(i => i.interaction_type === 'view').length || 0} View{interactions?.filter(i => i.interaction_type === 'view').length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button onClick={handleShare} className="flex items-center text-gray-500 hover:text-secondary transition-colors">
            <Share2 className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-16 prose-headings:font-bold prose-a:text-secondary hover:prose-a:text-secondary/80">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        
        {/* Author Bio */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm mt-12 flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-100 dark:border-gray-700">
          <img 
            src={article.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`} 
            alt={authorName}
            className="w-24 h-24 rounded-full object-cover shadow-sm"
          />
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Written by {authorName}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Content Creator at Faith Amplifiers
            </p>
            <Link to="/directory" className="text-secondary font-medium hover:underline text-sm uppercase tracking-wider">
              View Profile
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-secondary" />
            Discussion ({comments?.length || 0})
          </h3>

          <div className="space-y-8 mb-10">
            {comments?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Be the first to share your thoughts!</p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.full_name || comment.user?.username || 'User')}&background=random`} alt="User avatar" className="w-10 h-10 rounded-full" />
                  <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.user?.full_name || comment.user?.username || 'Anonymous User'}</span>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
               {user ? (
                 <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email || 'U')}&background=random`} alt="Your avatar" className="w-10 h-10 rounded-full" />
               ) : (
                 <span className="text-secondary font-bold text-sm">You</span>
               )}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Join the conversation..." : "Please log in to comment..."}
                disabled={!user}
                rows={3}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
              <button
                type="submit"
                disabled={!user || !newComment.trim()}
                className="absolute bottom-4 right-4 p-2 bg-secondary text-primary rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
};

export default ArticleDetail;
