import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signInAsGuest } = useAuth();

  const handleGuestEntry = () => {
    signInAsGuest();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-display-2 font-bold text-gray-800 mb-2">
          {t('welcome.title')}
        </h1>
        <p className="text-body-lg text-gray-600 mb-8">
          {t('welcome.subtitle')}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary w-full"
          >
            {t('common.signIn')}
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="btn btn-outline w-full"
          >
            {t('common.signUp')}
          </button>

          <button
            onClick={handleGuestEntry}
            className="btn btn-ghost w-full text-gray-600"
          >
            {t('welcome.continueAsGuest')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;