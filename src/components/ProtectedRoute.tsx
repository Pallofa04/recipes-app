import { useAuth } from '../api/AuthContext';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean; // true = requiere usuario logueado, false = permite guest
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, isGuest, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Si requiere autenticación y no hay usuario (ni guest)
  if (requireAuth && !user && !isGuest) {
    return <Navigate to="/" replace />;
  }

  // Si requiere usuario real (no guest) y es guest
  if (requireAuth && isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}