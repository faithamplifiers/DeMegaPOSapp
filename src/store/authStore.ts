import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    // Fire and forget backend signout to bypass network hanging
    supabase.auth.signOut({ scope: 'local' }).catch(err => {
      console.warn('Backend sign out error, forced local clearance instead:', err);
    });
    
    // Guaranteed instant token destruction regardless of URL mismatches
    const clearStorage = (storage: Storage) => {
      Object.keys(storage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          storage.removeItem(key);
        }
      });
    };
    clearStorage(localStorage);
    clearStorage(sessionStorage);
    
    // Instantly wipe active memory state
    set({ user: null, profile: null });
  },
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        set({ profile: data });
      }
    } catch (err) {
      console.error('refreshProfile error:', err);
    } finally {
      // Ensure we never indefinitely block the profile hydration visually
      set({ loading: false });
    }
  }
}));

// Initialize auth state
const initAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const store = useAuthStore.getState();
    if (session?.user) {
      store.setUser(session.user);
      await store.refreshProfile();
    }
  } catch (err) {
    console.error('Auth init error:', err);
  } finally {
    useAuthStore.setState({ loading: false });
  }
};
initAuth();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_OUT') {
    store.setUser(null);
    store.setProfile(null);
    useAuthStore.setState({ loading: false });
  } else if (session?.user) {
    // Only refresh if the user is completely new or missing
    if (!store.user || store.user.id !== session.user.id) {
       store.setUser(session.user);
       store.refreshProfile().finally(() => {
         useAuthStore.setState({ loading: false });
       });
    } else {
       // Just unblock UI if already have the user
       useAuthStore.setState({ loading: false });
    }
  } else {
    // If an INITIAL_SESSION arrives but it's empty, definitively unblock UI
    useAuthStore.setState({ loading: false });
  }
});