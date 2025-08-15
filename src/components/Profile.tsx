import { useAuth } from '../api/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Profile() {
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/'); // Redirigir a welcome page después del logout
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Si es guest o no hay usuario, no mostrar perfil
  if (!user || isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">
            Necesitas iniciar sesión para ver tu perfil.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
          
          {/* Información del usuario */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user.email}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de verificación
              </label>
              <p className={`px-3 py-2 rounded-lg ${
                user.email_confirmed_at 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-yellow-700 bg-yellow-50'
              }`}>
                {user.email_confirmed_at ? '✓ Email verificado' : '⚠ Email pendiente de verificación'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miembro desde
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Acciones de cuenta</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-recipes')}
                className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                📖 Ver mis recetas
              </button>
              
              <button
                onClick={() => navigate('/favorites')}
                className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                ⭐ Ver mis favoritos
              </button>
              
              {/* Botón de Sign Out */}
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Cerrando sesión...
                  </span>
                ) : (
                  '🚪 Cerrar sesión'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}