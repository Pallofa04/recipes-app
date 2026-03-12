import { useAuth } from '../api/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../api/LanguageContext';

export default function Profile() {
  const { user, signOut, isGuest } = useAuth();
  const { t, i18n } = useTranslation();
  const { language, setLanguagePreference } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/'); // Redirigir a welcome page después del logout
    } catch (error) {
      console.error('Error signing out:', error);
      alert(t('profile.logoutError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await setLanguagePreference(event.target.value as 'en' | 'es');
    } catch (error) {
      console.error('Error updating language:', error);
      alert(t('profile.languageError'));
    }
  };

  // Si es guest o no hay usuario, no mostrar perfil
  if (!user || isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">
            {t('profile.restrictedDesc')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t('common.signIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.backHome')}
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
          
          {/* Información del usuario */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email')}
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {user.email}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.verificationStatus')}
              </label>
              <p className={`px-3 py-2 rounded-lg ${
                user.email_confirmed_at 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-yellow-700 bg-yellow-50'
              }`}>
                {user.email_confirmed_at ? `✓ ${t('profile.verified')}` : `⚠ ${t('profile.pending')}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.memberSince')}
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {new Date(user.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.language')}
              </label>
              <select
                value={language}
                onChange={handleLanguageChange}
                title={t('common.language')}
                className="w-full text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
              >
                <option value="en">{t('common.english')}</option>
                <option value="es">{t('common.spanish')}</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">{t('profile.accountActions')}</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/my-recipes')}
                className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                📖 {t('profile.viewMyRecipes')}
              </button>
              
              <button
                onClick={() => navigate('/favorites')}
                className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                ⭐ {t('profile.viewFavorites')}
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
                    {t('profile.signingOut')}
                  </span>
                ) : (
                  `🚪 ${t('common.logout')}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}