import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRecipe } from '../api/recipes';
import RecipeDisplay from '../components/RecipeDisplay';
import FavoriteToggle from '../components/FavoriteToggle';
import { Recipe } from '../types';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/home');
      return;
    }

    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecipe(id);
        setRecipe(data);
      } catch {
        setError(t('recipeDetail.loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 mb-4">{error || t('recipeDetail.notFound')}</p>
          <button onClick={() => navigate('/home')} className="btn btn-primary">
            {t('common.backHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-3 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">RecipeGen</span>
          </div>

          {recipe?.id && (
            <FavoriteToggle recipeId={recipe.id} size="md" />
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <RecipeDisplay recipe={recipe} />
      </main>
    </div>
  );
};

export default RecipeDetailPage;
