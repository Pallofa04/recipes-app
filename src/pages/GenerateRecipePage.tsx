import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Plus, X } from 'lucide-react';
import RecipeForm from '../components/RecipeForm';
import { generateRecipe } from '../api';
import { RecipeRequest } from '../types';

const GenerateRecipePage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerateRecipe = async (recipeData: RecipeRequest) => {
    setIsGenerating(true);
    try {
      const recipe = await generateRecipe(recipeData);
      navigate('/recipe-result', { state: { recipe } });
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Error al generar la receta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-display-2 mb-2 text-gray-800">Crear Receta con Ingredientes</h1>
          <p className="text-body text-gray-600">
            Escribe los ingredientes que tienes disponibles y personaliza tus preferencias
          </p>
        </div>
        
        <div className="card">
          <div className="card-body">
            <RecipeForm onSubmit={handleGenerateRecipe} loading={isGenerating} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateRecipePage;