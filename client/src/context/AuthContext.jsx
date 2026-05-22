import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usersAPI, authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cc_token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data.user);
          setSession(true); // mark session as active based on JWT
        } catch (err) {
          // err interceptor handles token removal
          setSession(null);
          setUser(null);
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setSession(data.session);
          fetchProfile(data.session.user.id);
        } else {
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes from Supabase (e.g. token refresh, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
      // SIGNED_IN is handled synchronously via the login() function below
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

  /**
   * Called from Login.jsx after successful OTP verification.
   * Sets session + user synchronously so isAuth becomes true before navigation.
   */
  const login = (supabaseSession, mongoUser, jwtToken) => {
    if (jwtToken) {
      localStorage.setItem('cc_token', jwtToken);
    }
    if (mongoUser) {
      localStorage.setItem('cc_user', JSON.stringify(mongoUser));
    }
    setSession(supabaseSession || true); // supabase session or truthy fallback
    if (mongoUser) setUser(mongoUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
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
    login,
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
