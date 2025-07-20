import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useEffect } from 'react';
import DishResults from '../components/DishResults';
import { DishIdentificationResponse } from '../types';

interface LocationState {
  result: DishIdentificationResponse;
  imageUrl: string;
  fileName: string;
}

const DishResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Redirect if no data is available
  useEffect(() => {
    if (!state || !state.result) {
      navigate('/upload-image', { replace: true });
    }
  }, [state, navigate]);

  const handleReset = () => {
    // Clean up the blob URL to prevent memory leaks
    if (state?.imageUrl && state.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.imageUrl);
    }
    navigate('/upload-image');
  };

  const handleBackToHome = () => {
    // Clean up the blob URL
    if (state?.imageUrl && state.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.imageUrl);
    }
    navigate('/');
  };

  // Don't render if there's no state
  if (!state || !state.result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToHome}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-h3 text-gray-800">RecipeGen</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <DishResults
            result={state.result}
            imageUrl={state.imageUrl}
            onReset={handleReset}
          />
        </div>
      </main>
    </div>
  );
};

export default DishResultsPage;