import { useState, FormEvent } from 'react';
import { ChefHat, Users, Target } from 'lucide-react';
import { RecipeRequest } from '../types';

interface RecipeFormProps {
  ingredients: string[];
  onGenerateRecipe: (params: RecipeRequest) => void;
  isGenerating: boolean;
}

const RecipeForm = ({ ingredients, onGenerateRecipe, isGenerating }: RecipeFormProps) => {
  const [calories, setCalories] = useState('');
  const [servings, setServings] = useState('2');
  const [dietaryPreferences, setDietaryPreferences] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) return;

    onGenerateRecipe({
      ingredients,
      calories: calories ? parseInt(calories) : undefined,
      servings: parseInt(servings),
      dietaryPreferences: dietaryPreferences || undefined
    });
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8">
        <ChefHat className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">Upload an image to get started with recipe generation</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Detected Ingredients</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="calories">
            <Target className="inline mr-2" size={16} />
            Calorie Limit (optional)
          </label>
          <input
            id="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 500"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="servings">
            <Users className="inline mr-2" size={16} />
            Number of Servings
          </label>
          <select
            id="servings"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 serving</option>
            <option value="2">2 servings</option>
            <option value="3">3 servings</option>
            <option value="4">4 servings</option>
            <option value="6">6 servings</option>
            <option value="8">8 servings</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="diet">
            Dietary Preferences (optional)
          </label>
          <input
            id="diet"
            type="text"
            value={dietaryPreferences}
            onChange={(e) => setDietaryPreferences(e.target.value)}
            placeholder="e.g., vegetarian, gluten-free, low-carb"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isGenerating ? 'Generating Recipe...' : 'Generate Recipe'}
        </button>
      </form>
    </div>
  );
};

export default RecipeForm;
