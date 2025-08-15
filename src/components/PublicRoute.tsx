import { useAuth } from '../api/AuthContext';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isGuest, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Si ya está autenticado (y no es guest), redirigir a home
  if (user && !isGuest) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}