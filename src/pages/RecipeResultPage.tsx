import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RecipeDisplay from '../components/RecipeDisplay';
import FavoriteToggle from '../components/FavoriteToggle';

const RecipeResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recipe } = location.state || {};

  const handleGenerateAnother = () => {
    navigate('/generate-recipe');
  };

  const handleUploadImage = () => {
    navigate('/upload-image');
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
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4">
              <ChefHat className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-display-1 mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {t('recipeResult.title')}
            </h1>
            <p className="text-body-lg text-gray-600">
              {t('recipeResult.subtitle')}
            </p>
          </div>

          {/* Recipe Display */}
          <div className="mb-8 animate-fade-in animate-delay-100ms">
            <RecipeDisplay recipe={recipe} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animate-delay-200ms">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateAnother}
                className="btn btn-primary"
              >
                <RotateCcw className="w-4 h-4" />
                {t('recipeResult.generateAnother')}
              </button>
              
              <button
                onClick={handleUploadImage}
                className="btn btn-outline"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('recipeResult.tryWithImage')}
              </button>
            </div>
            
            {recipe?.id && (
              <FavoriteToggle recipeId={recipe.id} size="lg" />
            )}
          </div>

          {/* Additional Tips */}
          <div className="mt-12 animate-fade-in animate-delay-300ms">
            <div className="card">
              <div className="card-body">
                <h3 className="text-h3 mb-4 text-gray-800">💡 {t('recipeResult.tipsTitle')}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-gray-800">{t('recipeResult.tip1Title')}</p>
                      <p className="text-caption text-gray-600">{t('recipeResult.tip1Desc')}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-gray-800">{t('recipeResult.tip2Title')}</p>
                      <p className="text-caption text-gray-600">{t('recipeResult.tip2Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeResultPage;