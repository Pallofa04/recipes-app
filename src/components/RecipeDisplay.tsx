import React from 'react';
import { Clock, Users, Target, ChefHat } from 'lucide-react';
import { RecipeResponse } from '../types';

interface RecipeDisplayProps {
  recipe: RecipeResponse | null;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe }) => {
  if (!recipe) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <ChefHat className="mr-2 text-green-600" size={24} />
          {recipe.name}
        </h2>
        <p className="text-gray-600">{recipe.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Clock className="mx-auto text-blue-600 mb-1" size={20} />
          <p className="text-sm text-gray-600">Prep Time</p>
          <p className="font-semibold">{recipe.prepTime}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Users className="mx-auto text-green-600 mb-1" size={20} />
          <p className="text-sm text-gray-600">Servings</p>
          <p className="font-semibold">{recipe.servings}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Target className="mx-auto text-orange-600 mb-1" size={20} />
          <p className="text-sm text-gray-600">Calories</p>
          <p className="font-semibold">{recipe.calories}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
        <ol className="space-y-3">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="flex">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                {index + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeDisplay;