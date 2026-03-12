import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function EmailConfirmed() {
  const { user, isLoading, refreshSession } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      const handleVerification = async () => {
        if (user) {
          // Refrescar la sesión para obtener los últimos datos
          await refreshSession();
          navigate('/home');
        } else {
          // Esperar 3 segundos y redirigir de todos modos
          const timer = setTimeout(() => {
            navigate('/home');
          }, 3000);
          return () => clearTimeout(timer);
        }
      };
      handleVerification();
    }
  }, [user, isLoading, navigate, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">
          {t('emailConfirmed.title')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t('emailConfirmed.message')}
        </p>
        {!user && (
          <p className="text-sm text-gray-500">
            {t('emailConfirmed.redirecting')}
          </p>
        )}
      </div>
    </div>
  );
}