import { useAuth } from '../api/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getFavorites } from '../api/favorites';
import { Recipe } from '../types';
import { ArrowLeft, RefreshCcw, XCircle, Star, Clock3, Users, Flame } from 'lucide-react';
import FavoriteToggle from './FavoriteToggle';
import i18n from '../i18n';

const Favorites = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getFavorites(user.id);
      setFavorites(data || []);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user?.id]);

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
          prep_time: (content as any).prep_time || recipe.prep_time
        };
      }
      
      return {
        name: recipe.name,
        description: recipe.description,
        prep_time: recipe.prep_time
      };
    };
  }, []);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{t('favoritesPage.title')}</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {t('favoritesPage.needSignIn')}
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
        <h1 className="text-xl font-semibold">{t('favoritesPage.title')}</h1>
        <button
          onClick={fetchFavorites}
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
            onClick={fetchFavorites}
            className="mt-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50">
            <Star className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-2">
            {t('favoritesPage.emptyTitle')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('favoritesPage.emptyDesc')}
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
            {t('favoritesPage.count', { count: favorites.length })}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.map((recipe) => {
              const content = getLocalizedRecipePreview(recipe);
              return (
                <div key={recipe.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                      {content.name}
                    </h2>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {content.description}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 mb-2">
                      <span className="inline-flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> {content.prep_time}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {recipe.servings}</span>
                      {recipe.calories && <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> {recipe.calories}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Link
                      to={`/recipe/${recipe.id}`}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg shadow-sm transition-all"
                    >
                      {t('common.viewDetails')}
                    </Link>
                    <FavoriteToggle 
                      recipeId={recipe.id} 
                      size="sm" 
                      showConfirmOnRemove={true}
                      onToggle={(isFav) => !isFav && fetchFavorites()}
                    />
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

export default Favorites;