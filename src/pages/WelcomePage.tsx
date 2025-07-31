import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { signInAsGuest } = useAuth();

  const handleGuestEntry = () => {
    signInAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-display-2 font-bold text-gray-800 mb-2">
          ¡Bienvenido a RecipeGen!
        </h1>
        <p className="text-body-lg text-gray-600 mb-8">
          Generador de Recetas Profesionales con IA
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary w-full"
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="btn btn-outline w-full"
          >
            Registrarse
          </button>

          <button
            onClick={handleGuestEntry}
            className="btn btn-ghost w-full text-gray-600"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;