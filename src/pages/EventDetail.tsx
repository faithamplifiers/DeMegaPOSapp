import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import {
  Calendar, Clock, MapPin, Users, ArrowLeft,
  ExternalLink, Video, Tag, Share2
} from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: event, error, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');

      // Try by slug first, fallback to id
      let { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(*),
          vendors:event_vendors(*)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        // Fallback: try by ID
        const res = await supabase
          .from('events')
          .select(`
            *,
            organizer:profiles(*),
            vendors:event_vendors(*)
          `)
          .eq('id', slug)
          .single();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="text-secondary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="pt-32 pb-20 container-custom min-h-[60vh]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const coverImage = event.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80';
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const currencySymbol =
    event.currency === 'NGN' ? '₦' :
    event.currency === 'EUR' ? '€' :
    event.currency === 'GBP' ? '£' : '$';

  const isFree = !event.price || event.price === '0.00' || event.price === '0';

  return (
    <div className="pt-20 bg-light-gray dark:bg-gray-900 min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[380px] w-full bg-black overflow-hidden flex justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        <img
          src={coverImage}
          alt={event.title}
          className="relative z-10 max-w-full max-h-full object-contain"
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-30">
          <div className="container-custom max-w-5xl mx-auto">
            <Link to="/events" className="inline-flex items-center text-sm font-medium hover:text-secondary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="inline-block px-3 py-1 bg-secondary text-primary text-sm font-bold rounded-full capitalize">
                {event.type || 'Event'}
              </span>
              <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                event.status === 'ongoing' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}>
                {event.status || 'upcoming'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-5xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">About This Event</h2>
              <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {event.description || 'No description available.'}
              </div>
            </div>

            {/* Vendors */}
            {event.vendors && event.vendors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Vendor Partners
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.vendors.map((vendor: any) => (
                    <div key={vendor.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                      <p className="font-bold text-gray-900 dark:text-white">{vendor.name}</p>
                      <p className="text-sm text-secondary">{vendor.service}</p>
                      {vendor.email && <p className="text-xs text-gray-500 mt-1">{vendor.email}</p>}
                      {vendor.phone && <p className="text-xs text-gray-500">{vendor.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                {isFree ? (
                  <div>
                    <span className="text-3xl font-black text-green-500">FREE</span>
                    <p className="text-sm text-gray-500 mt-1">No ticket required</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-black text-primary dark:text-white">
                      {currencySymbol}{event.price}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Per person</p>
                  </div>
                )}
              </div>

              {/* Details list */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(startDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    {startDate.toDateString() !== endDate.toDateString() && (
                      <p className="text-xs text-gray-500">to {format(endDate, 'MMMM d, yyyy')}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Time</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(startDate, 'h:mm a')} – {format(endDate, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Location</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.location || 'TBA'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Category</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {event.type || 'General'}
                    </p>
                  </div>
                </div>

                {event.organizer && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Organizer</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {event.organizer.full_name || event.organizer.username || 'Faith Amplifiers'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Tickets
                  </a>
                )}
                {event.livestream_url && (
                  <a
                    href={event.livestream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Watch Livestream
                  </a>
                )}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-secondary hover:text-secondary transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
