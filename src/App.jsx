import React, { useState } from 'react';
import UploadImage from './components/UploadImage';
import RecipeForm from './components/RecipeForm';
import RecipeDisplay from './components/RecipeDisplay';
import { imageAPI, recipeAPI } from './api/client';
import { ChefHat, AlertCircle } from 'lucide-react';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (imageFile) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await imageAPI.analyzeImage(imageFile);
      setIngredients(result.ingredients);
      setRecipe(null); // Clear previous recipe
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRecipe = async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await recipeAPI.generateRecipe(params);
      setRecipe(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
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
            Upload a photo of your ingredients and let AI create a personalized recipe for you
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