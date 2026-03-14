import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import { RecipeRequest } from '../types';
import { useAuth } from '../api/AuthContext'; 

interface RecipeFormProps {
  onSubmit: (recipeData: Omit<RecipeRequest, 'user_id'>, isGuest: boolean) => Promise<void>;
  loading: boolean;
  initialServings?: number;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ 
  onSubmit, 
  loading = false, 
  initialServings = 2 
}) => {
  const { user, isGuest } = useAuth(); // Añadir isGuest
  const { t } = useTranslation();
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [calories, setCalories] = useState<string>('');
  const [servings, setServings] = useState<number>(initialServings);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Permitir tanto usuarios registrados como guests
    if (!user?.id && !isGuest) {
      alert(t('recipeForm.needAuth'));
      return;
    }
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ingredient => ingredient.trim() !== '');
    
    if (validIngredients.length === 0) {
      alert(t('recipeForm.needIngredient'));
      return;
    }

    const requestData: Omit<RecipeRequest, 'user_id'> = {
      ingredients: validIngredients,
      servings,
      calories: calories ? parseInt(calories) : undefined,
      dietaryPreferences: dietaryPreferences.trim() || undefined,
    };
    
    try {
      await onSubmit(requestData, isGuest);
    } catch {
      return;
    }
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800">{t('recipeForm.title')}</h2>
      
      {isGuest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-yellow-800 text-xs flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {t('recipeForm.guestMode')}
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Ingredientes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('recipeForm.ingredients')}
          </label>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder={t('recipeForm.ingredientPlaceholder', { index: index + 1 })}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-2 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    aria-label={t('recipeForm.removeIngredient')}
                    title={t('recipeForm.removeIngredient')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              {t('recipeForm.addIngredient')}
            </button>
          </div>
        </div>

        {/* Porciones */}
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
            {t('recipeForm.servings')}
          </label>
          <input
            id="servings"
            type="number"
            min="1"
            max="12"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Calorías */}
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
            {t('recipeForm.calories')}
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder={t('recipeForm.caloriesPlaceholder')}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Preferencias dietéticas */}
        <div className="md:col-span-2">
          <label htmlFor="dietaryPreferences" className="block text-sm font-medium text-gray-700 mb-2">
            {t('recipeForm.dietaryPreferences')}
          </label>
          <textarea
            id="dietaryPreferences"
            value={dietaryPreferences}
            onChange={(e) => setDietaryPreferences(e.target.value)}
            placeholder={t('recipeForm.dietaryPlaceholder')}
            rows={2}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || (!user?.id && !isGuest)}
        className={`w-full py-2 px-4 text-sm rounded font-medium transition-colors ${
          loading || (!user?.id && !isGuest)
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? t('recipeForm.generating') : (!user?.id && !isGuest) ? t('recipeForm.signIn') : t('common.generateRecipe')}
      </button>
    </form>
  );
};

export default RecipeForm;