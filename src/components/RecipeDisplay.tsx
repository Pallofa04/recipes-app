import React from 'react';
import { Clock, Users, Target, ChefHat, Star, PrinterIcon, Share2, BookOpen } from 'lucide-react';
import { RecipeResponse } from '../types';

interface RecipeDisplayProps {
  recipe: RecipeResponse | null;
  loading?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, loading = false }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Genera una receta para ver los resultados aquí</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: recipe.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
              <p className="text-blue-100 opacity-90">{recipe.description}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center gap-2"
              title="Compartir receta"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center gap-2"
              title="Imprimir receta"
            >
              <PrinterIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Recipe Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tiempo de preparación</p>
              <p className="font-semibold text-gray-800">{recipe.prepTime}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Porciones</p>
              <p className="font-semibold text-gray-800">{recipe.servings}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Calorías</p>
              <p className="font-semibold text-gray-800">{recipe.calories}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ingredients Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Ingredientes</h2>
            </div>
            
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Instrucciones</h2>
            </div>
            
            <div className="space-y-4">
              {recipe.instructions.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Consejos del Chef
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="font-medium text-gray-800">Preparación</p>
                <p className="text-sm text-gray-600">Prepara todos los ingredientes antes de comenzar a cocinar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔥</div>
              <div>
                <p className="font-medium text-gray-800">Temperatura</p>
                <p className="text-sm text-gray-600">Mantén el fuego a temperatura media para evitar quemar los ingredientes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🧂</div>
              <div>
                <p className="font-medium text-gray-800">Condimentos</p>
                <p className="text-sm text-gray-600">Prueba y ajusta la sal y especias al final de la cocción</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <p className="font-medium text-gray-800">Tiempo</p>
                <p className="text-sm text-gray-600">Los tiempos pueden variar según tu cocina y gustos personales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDisplay;