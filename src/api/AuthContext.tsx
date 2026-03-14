import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from './supabase/supabase';
import type {
  User,
  AuthResponse,
} from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  signInAsGuest: () => void;
  resendConfirmationEmail: (email: string) => Promise<void>;
  refreshSession: () => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user ?? null);
        setIsEmailVerified(!!session?.user?.email_confirmed_at);
        
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        }
        return session?.user;
      } catch (error) {
        throw error;
      }
    };

  useEffect(() => {
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestStatus);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
        setIsEmailVerified(!!session?.user?.email_confirmed_at);
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        }
      } catch {
        setUser(null);
        setIsEmailVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsEmailVerified(!!session?.user?.email_confirmed_at);
        
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        } else if (!session?.user && !guestStatus) {
          setUser(null);
          setIsGuest(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    setUser(null);
    setIsEmailVerified(false);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsGuest(false);
      setIsEmailVerified(false);
      localStorage.removeItem('isGuest');
    } catch (error) {
      throw error;
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isGuest,
        isLoading,
        isEmailVerified,
        signUp: (email, password) => supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmed`
          }
        }),
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signOut,
        signInAsGuest,
        resendConfirmationEmail,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}