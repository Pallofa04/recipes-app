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

  // Función para refrescar la sesión
  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setUser(session?.user ?? null);
      setIsEmailVerified(session?.user?.email_confirmed_at !== null);
      
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('isGuest');
      }
      return session?.user;
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar sesión de invitado al cargar
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestStatus);

    // Obtener sesión activa
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(session?.user ?? null);
        setIsEmailVerified(session?.user?.email_confirmed_at !== null);
        
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Solo actualizar si hay un cambio real
        if (session?.user?.id !== user?.id) {
          setUser(session?.user ?? null);
          setIsEmailVerified(session?.user?.email_confirmed_at !== null);
          
          if (session?.user) {
            setIsGuest(false);
            localStorage.removeItem('isGuest');
            
            // Forzar actualización después de eventos importantes
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              const { data: { user: currentUser } } = await supabase.auth.getUser();
              setUser(currentUser);
              setIsEmailVerified(currentUser?.email_confirmed_at !== null);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    setUser(null);
    setIsEmailVerified(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsGuest(false);
      setIsEmailVerified(false);
      localStorage.removeItem('isGuest');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
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