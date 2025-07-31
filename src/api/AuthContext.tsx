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
  AuthError,
  AuthResponse,
} from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Verificar sesión de invitado al cargar
    const guestStatus = localStorage.getItem('isGuest') === 'true';
    setIsGuest(guestStatus);

    // Obtener usuario de Supabase
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('isGuest');
        }
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
  };

  const signOut = async () => {
    setIsGuest(false);
    localStorage.removeItem('isGuest');
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isGuest,
        signUp: (email, password) => supabase.auth.signUp({ email, password }),
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signOut,
        signInAsGuest
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