import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getUserHistory } from '../api/history';
import { Recipe } from '../types';
import { ArrowLeft, Camera, ChefHat, RefreshCcw, XCircle, BookOpen, Clock3, Users, Flame } from 'lucide-react';
import FavoriteToggle from './FavoriteToggle';
import i18n from '../i18n';

const MyRecipes = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUserHistory(user.id);
      setRecipes(data || []);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'photo':
        return <Camera className="w-3.5 h-3.5" />;
      default:
        return <ChefHat className="w-3.5 h-3.5" />;
    }
  };

  const getSourceText = (source?: string) => {
    switch (source) {
      case 'photo':
        return t('historyPage.sourcePhoto');
      default:
        return t('historyPage.sourceGenerate');
    }
  };

  // Get localized content for a recipe
  const getLocalizedRecipePreview = useMemo(() => {
    return (recipe: Recipe) => {
      const currentLang = i18n.language;
      const langKey = currentLang === 'es' ? 'content_es' : 'content_en';
      const content = recipe[langKey as keyof Recipe];
      
      if (content) {
        return {
          name: (content as any).name || recipe.name,
          description: (content as any).description || recipe.description,
          prep_time: (content as any).prep_time || recipe.prep_time,
          ingredients: (content as any).ingredients || recipe.ingredients
        };
      }
      
      return {
        name: recipe.name,
        description: recipe.description,
        prep_time: recipe.prep_time,
        ingredients: recipe.ingredients
      };
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('historyPage.title')}</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {t('historyPage.needSignIn')}
          </p>
          <Link
            to="/login"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mb-3 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">{t('historyPage.title')}</h1>
        <button
          onClick={fetchHistory}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          disabled={loading}
        >
          <span className="inline-flex items-center gap-1">
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-600 text-sm inline-flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {error}
          </p>
          <button
            onClick={fetchHistory}
            className="mt-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-50">
            <BookOpen className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-2">
            {t('historyPage.emptyTitle')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('historyPage.emptyDesc')}
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/generate-recipe" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
              {t('common.generateRecipe')}
            </Link>
            <Link to="/upload-image" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              {t('common.analyzeImage')}
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            {t('historyPage.count', { count: recipes.length })}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recipes.map((recipe) => {
              const content = getLocalizedRecipePreview(recipe);
              return (
                <div key={recipe.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-start gap-1 mb-1">
                      <h2 className="text-sm font-semibold text-gray-800 flex-1 line-clamp-2">
                        {content.name}
                      </h2>
                      <span className="text-xs shrink-0 text-gray-500" title={getSourceText(recipe.source)}>
                        {getSourceIcon(recipe.source)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {content.description}
                    </p>
                    
                    <div className="flex gap-3 text-xs text-gray-500 mb-2">
                      <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {content.prep_time}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {recipe.servings}</span>
                      {recipe.calories && <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {recipe.calories}</span>}
                    </div>

                    {content.ingredients && content.ingredients.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {content.ingredients.slice(0, 3).map((ingredient: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {typeof ingredient === 'string' ? ingredient : (ingredient?.name || 'Ingrediente')}
                            </span>
                          ))}
                          {content.ingredients.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{content.ingredients.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Link
                      to={`/recipe/${recipe.id}`}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg shadow-sm transition-all"
                    >
                      {t('common.viewDetails')}
                    </Link>
                    <FavoriteToggle recipeId={recipe.id} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;