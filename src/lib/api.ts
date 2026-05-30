import { supabase } from './supabase';
import { Article, Event, Service, DirectoryListing, Resource, User } from '../types';

const TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = TIMEOUT_MS): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeout]);
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const { data, error } = await withTimeout(supabase
      .from('services')
      .select(`
        *,
        provider:profiles(*)
      `)
      .eq('status', 'active'));
      
    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    
    return data.map(service => ({
      id: service.id,
      title: service.title || 'Untitled Service',
      slug: service.slug || service.id,
      description: service.description || '',
      category: (service.category || 'other') as Service['category'],
      price: service.price,
      currency: service.currency as Service['currency'],
      provider: {
        id: service.provider?.id || '',
        name: service.provider?.full_name || service.provider?.username || 'Unknown',
        email: '',
        role: service.provider?.role as User['role'] || 'member',
      },
      coverImage: service.cover_image || (service.portfolio_images && service.portfolio_images[0]) || 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80',
      rating: 5,
    }));
  } catch (err) {
    console.error('Services fetch timed out or failed:', err);
    return [];
  }
}

export async function fetchNews() {
  const { data, error } = await supabase
    .from('content')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  
  return data.map(article => ({
    id: article.id,
    slug: article.slug || article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    content: article.content,
    author: {
      id: article.author?.id || '',
      name: article.author?.full_name || article.author?.username || 'Unknown',
      avatar: article.author?.avatar_url || '',
    },
    category: article.category || 'News',
    publishedAt: article.published_at || article.created_at,
    coverImage: article.cover_image || article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80',
    videoUrl: article.video_url,
    audioUrl: article.audio_url,
    imageUrl: article.image_url,
  }));
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:profiles(*)
    `)
    .order('start_date', { ascending: true });
    
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data.map(event => ({
    id: event.id,
    title: event.title || 'Untitled Event',
    slug: event.slug || event.id,
    description: event.description || '',
    type: event.type || 'general',
    startDate: event.start_date || new Date().toISOString(),
    endDate: event.end_date || new Date().toISOString(),
    location: event.location || '',
    category: event.type || 'general',
    organizer: {
      id: event.organizer?.id || '',
      name: event.organizer?.full_name || event.organizer?.username || 'Unknown',
    },
    coverImage: event.cover_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80',
    capacity: event.capacity,
    price: event.price || '0.00',
    currency: (event.currency || 'USD') as 'USD' | 'NGN' | 'EUR' | 'GBP',
    ticketUrl: event.ticket_url,
    livestreamUrl: event.livestream_url,
    status: event.status || 'upcoming',
  }));
}

export async function fetchDirectory() {
  const { data, error } = await supabase
    .from('directory')
    .select(`
      *,
      owner:profiles(*)
    `)
    .eq('status', 'active');
    
  if (error) {
    console.error('Error fetching directory:', error);
    return [];
  }
  
  return data.map(listing => ({
    id: listing.id,
    name: listing.name,
    category: listing.category,
    description: listing.description,
    location: listing.location,
    website: listing.website,
    logo: listing.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80',
    verified: listing.is_verified,
  }));
}

export async function fetchResources() {
  const { data, error } = await supabase
    .from('content')
    .select(`
      *,
      author:profiles(*)
    `)
    .in('category', ['videos', 'podcasts', 'devotionals', 'sermon', 'music'])
    .eq('status', 'published')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
  
  return data.map(item => {
    let mappedType = 'devotional';
    if (item.category === 'videos' || item.category === 'sermon') mappedType = 'video';
    if (item.category === 'podcasts' || item.category === 'music') mappedType = 'podcast';
    
    return {
      id: item.id,
      title: item.title,
      description: item.excerpt || '',
      type: mappedType,
      category: item.category,
      url: item.video_url || item.audio_url || item.image_url || '',
      coverImage: item.cover_image || item.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80',
      author: {
        id: item.author?.id || '',
        name: item.author?.full_name || item.author?.username || 'Unknown',
        avatar: item.author?.avatar_url || '',
      },
      publishedAt: item.published_at || item.created_at
    };
  });
}

export async function fetchDashboardStats() {
  try {
    const stats = await withTimeout(Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('content').select('*', { count: 'exact', head: true }),
      supabase.from('services').select('*', { count: 'exact', head: true })
    ]));

    const [u, e, c, s] = stats;
    return {
      users: u.count || 0,
      events: e.count || 0,
      content: c.count || 0,
      services: s.count || 0
    };
  } catch (err) {
    console.error('Stats fetch timed out or failed:', err);
    return { users: 0, events: 0, content: 0, services: 0 };
  }
}

export async function fetchRecentActivity() {
  try {
    const [contentRes, eventsRes] = await withTimeout(Promise.all([
      supabase.from('content').select('id, title, created_at, status').order('created_at', { ascending: false }).limit(3),
      supabase.from('events').select('id, title, created_at, status:type').order('created_at', { ascending: false }).limit(3)
    ]));
    const acts = [
      ...(contentRes.data || []).map(c => ({ id: `c-${c.id}`, type: 'content', title: c.title, time: c.created_at, status: 'Published' })),
      ...(eventsRes.data || []).map(e => ({ id: `e-${e.id}`, type: 'event', title: e.title, time: e.created_at, status: 'upcoming' }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return acts.slice(0, 5);
  } catch (e) {
    console.error('Activity fetch timed out or failed:', e);
    return [];
  }
}