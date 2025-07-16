import { useState } from 'react';
import UploadImage from './components/UploadImage';
import RecipeForm from './components/RecipeForm';
import RecipeDisplay from './components/RecipeDisplay';
import { imageAPI, recipeAPI } from './api/client';
import { ChefHat, AlertCircle } from 'lucide-react';
import { DishIdentificationResponse, RecipeResponse, RecipeRequest } from './types';

function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dishInfo, setDishInfo] = useState<DishIdentificationResponse | null>(null);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (imageFile: File): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await imageAPI.analyzeImage(imageFile);
      
      // Extract ingredient names from the backend response
      const ingredientNames = result.ingredients.map(ingredient => ingredient.name);
      
      setIngredients(ingredientNames);
      setDishInfo(result); // Store full dish info for display
      setRecipe(null); // Clear previous recipe
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIngredients([]);
      setDishInfo(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRecipe = async (params: RecipeRequest): Promise<void> => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await recipeAPI.generateRecipe(params);
      setRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="text-green-600 mr-3" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">AI Recipe Generator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your ingredients or a cooked dish and let AI create a personalized recipe for you
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Dish Information Display */}
        {dishInfo && (
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Identified Dish</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Dish Name</p>
                <p className="font-semibold text-gray-800">{dishInfo.dish_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Origin</p>
                <p className="font-semibold text-gray-800">{dishInfo.origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-800">{dishInfo.type}</p>
              </div>
              {dishInfo.cooking_time && (
                <div>
                  <p className="text-sm text-gray-600">Cooking Time</p>
                  <p className="font-semibold text-gray-800">{dishInfo.cooking_time}</p>
                </div>
              )}
            </div>
            
            {dishInfo.preparation && dishInfo.preparation.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preparation Steps</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {dishInfo.preparation.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            <UploadImage onImageUpload={handleImageUpload} isAnalyzing={isAnalyzing} />
            <RecipeForm
              ingredients={ingredients}
              onGenerateRecipe={handleGenerateRecipe}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column */}
          <div className="lg:sticky lg:top-8">
            <RecipeDisplay recipe={recipe} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;