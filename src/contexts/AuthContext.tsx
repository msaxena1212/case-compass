import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Development bypass check
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const bypassActive = localStorage.getItem('legaldesk_bypass_auth') === 'true';

    if (isLocalhost && bypassActive) {
      console.log("AuthContext: Development bypass active");
      const mockUser: User = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@casecompass.com',
        app_metadata: {},
        user_metadata: { name: 'Dev Admin', role: 'Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      
      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };

      setSession(mockSession);
      setUser(mockUser);
      setIsLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as the primary source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`AuthContext: Auth event [${event}]`, session ? "Session active" : "No session");
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    }).catch(err => {
      console.error("AuthContext: getSession error", err);
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('legaldesk_bypass_auth');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
