import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../api/AuthContext';
import { useLanguage } from '../api/LanguageContext';
import RecipeForm from '../components/RecipeForm';
import { generateRecipe } from '../api';
import { RecipeRequest } from '../types';

const GenerateRecipePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();

  const handleGenerateRecipe = async (recipeData: Omit<RecipeRequest, 'user_id'>, isGuestMode: boolean) => { // Cambiar firma
    setIsGenerating(true);
    setError(null);
    
    try {
      // Verificar estado de autenticación
      if (isAuthLoading) {
        throw new Error(t('generateRecipe.authLoading'));
      }

      // Determinar el user_id a usar
      const userId = isGuestMode ? 'guest' : user?.id;
      
      if (!userId) {
        throw new Error(t('generateRecipe.identityError'));
      }

      // Generar la receta
      const recipe = await generateRecipe({
        ...recipeData,
        user_id: userId,
        language,
      });
      
      // Navegar a la página de resultados
      navigate('/recipe-result', { 
        state: { 
          recipe,
          isGuest: isGuestMode // Pasar si es guest
        } 
      });
      
    } catch (err: unknown) {
      let errorMessage = t('generateRecipe.genericError');

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 503) {
          errorMessage = t('generateRecipe.genericError');
        }
      }
      
      setError(errorMessage);
      
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.backHome')}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-h3 text-gray-800">RecipeGen</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-display-2 mb-2 text-gray-800">{t('generateRecipe.title')}</h1>
            <p className="text-body text-gray-600">
              {t('generateRecipe.subtitle')}
            </p>
          </div>
          
          {/* Mostrar mensaje de error si existe */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="card">
            <div className="card-body">
              <RecipeForm 
                onSubmit={handleGenerateRecipe} 
                loading={isGenerating || isAuthLoading} 
                initialServings={2}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GenerateRecipePage;