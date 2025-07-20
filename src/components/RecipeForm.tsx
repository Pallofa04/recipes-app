import React, { useState } from 'react';
import { RecipeRequest } from '../types';

interface RecipeFormProps {
  onSubmit: (recipeData: RecipeRequest) => void;
  loading?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, loading = false }) => {
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [calories, setCalories] = useState<string>('');
  const [servings, setServings] = useState<number>(2);
  const [dietaryPreferences, setDietaryPreferences] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty ingredients
    const validIngredients = ingredients.filter(ingredient => ingredient.trim() !== '');
    
    if (validIngredients.length === 0) {
      alert('Por favor, añade al menos un ingrediente');
      return;
    }

    const requestData: RecipeRequest = {
      ingredients: validIngredients,
      calories: calories ? parseInt(calories) : undefined,
      servings,
      dietaryPreferences: dietaryPreferences.trim() || undefined,
    };
    
    onSubmit(requestData);
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
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Generar Receta</h2>
      
      {/* Ingredientes */}
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-3">
          Ingredientes *
        </label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              placeholder={`Ingrediente ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          + Añadir ingrediente
        </button>
      </div>

      {/* Porciones */}
      <div>
        <label htmlFor="servings" className="block text-lg font-medium text-gray-700 mb-2">
          Número de porciones
        </label>
        <input
          id="servings"
          type="number"
          min="1"
          max="12"
          value={servings}
          onChange={(e) => setServings(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Entre 1 y 12 porciones</p>
      </div>

      {/* Calorías totales */}
      <div>
        <label htmlFor="calories" className="block text-lg font-medium text-gray-700 mb-2">
          Calorías totales (opcional)
        </label>
        <input
          id="calories"
          type="number"
          min="0"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Ej: 800"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Calorías objetivo para toda la receta</p>
      </div>

      {/* Preferencias dietéticas */}
      <div>
        <label htmlFor="dietaryPreferences" className="block text-lg font-medium text-gray-700 mb-2">
          Preferencias dietéticas (opcional)
        </label>
        <textarea
          id="dietaryPreferences"
          value={dietaryPreferences}
          onChange={(e) => setDietaryPreferences(e.target.value)}
          placeholder="Ej: vegetariano, sin gluten, bajo en sodio, keto, etc."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        />
        <p className="text-sm text-gray-500 mt-1">Describe cualquier restricción o preferencia dietética</p>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-6 rounded-md text-white font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {loading ? 'Generando receta...' : 'Generar Receta'}
      </button>
    </form>
  );
};

export default RecipeForm;