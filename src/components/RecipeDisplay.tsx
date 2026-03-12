import React, { useMemo } from 'react';
import { Clock, Users, Target, ChefHat, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../types';
import i18n from '../i18n';

interface RecipeDisplayProps {
  recipe: Recipe | null;
  loading?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, loading = false }) => {
  const { t } = useTranslation();

  // Get localized content based on current language
  const getLocalizedContent = useMemo(() => {
    if (!recipe) return null;
    
    const currentLang = i18n.language;
    const langKey = currentLang === 'es' ? 'content_es' : 'content_en';
    const content = recipe[langKey as keyof Recipe];
    
    if (content) {
      return {
        name: (content as any).name,
        description: (content as any).description,
        prep_time: (content as any).prep_time,
        ingredients: (content as any).ingredients,
        instructions: (content as any).instructions
      };
    }
    
    // Fallback to root fields if bilingual content not available
    return {
      name: recipe.name,
      description: recipe.description,
      prep_time: recipe.prep_time,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions
    };
  }, [recipe]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe || !getLocalizedContent) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{t('recipeDisplay.empty')}</p>
      </div>
    );
  }

  const content = getLocalizedContent;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold mb-1">{content.name}</h1>
            <p className="text-sm text-blue-100 opacity-90">{content.description}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">{t('recipeDisplay.time')}</p>
              <p className="text-sm font-medium text-gray-800">{content.prep_time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">{t('recipeDisplay.servings')}</p>
              <p className="text-sm font-medium text-gray-800">{recipe.servings}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
            <Target className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600">{t('recipeDisplay.calories')}</p>
              <p className="text-sm font-medium text-gray-800">{recipe.calories ?? t('recipeDisplay.noCalories')} kcal</p>
            </div>
          </div>
        </div>

        {/* Compact Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-800">{t('recipeDisplay.ingredients')}</h2>
            </div>
            
            <div className="space-y-2">
              {content.ingredients?.map((ingredient: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    {typeof ingredient === 'string' 
                      ? ingredient 
                      : `${ingredient.quantity || ''} ${ingredient.name} ${ingredient.state || ''}`.trim()
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-800">{t('recipeDisplay.instructions')}</h2>
            </div>
            
            <div className="space-y-2">
              {content.instructions?.map((step: string, index: number) => (
                <div
                  key={index}
                  className="flex gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;