import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (login, logout, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // We fetch the profile from our own backend or Supabase profiles table
      // Since the app already has a 'me' endpoint, we can use that, 
      // but it might need to be adjusted to look up by Supabase ID.
      // For now, let's use the usersAPI to get the profile.
      const res = await usersAPI.getProfile(userId);
      setUser(res.data.user);
    } catch (err) {
      console.error('❌ Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
  };

  const value = {
    user,
    session,
    loading,
    isAuth: !!session,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
