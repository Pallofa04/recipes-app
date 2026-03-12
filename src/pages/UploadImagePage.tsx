import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UploadImage from '../components/UploadImage';
import { analyzeImage } from '../api/images';
import { useAuth } from '../api/AuthContext';
import i18n from '../i18n';

const UploadImagePage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleImageUpload = async (file: File, isGuestMode: boolean) => { 
    setIsAnalyzing(true);
    try {
      const userId = isGuestMode ? 'guest' : user?.id;
      const currentLanguage = i18n.language;
      const result = await analyzeImage(file, userId, currentLanguage);
      
      // Create a blob URL for the uploaded image to pass to results
      const imageUrl = URL.createObjectURL(file);
      
      // Navigate to results page with the analysis result and image
      navigate('/dish-results', { 
        state: { 
          result: result,
          imageUrl: imageUrl,
          fileName: file.name,
          isGuest: isGuestMode
        } 
      });
    } catch (error: unknown) {
      console.error('Error analyzing image:', error);
      
      // Handle axios errors with proper type checking
      let errorMessage = t('uploadImage.pageError');
      
      // Check if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`${t('uploadImage.pageErrorPrefix')} ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="container py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.backHome')}
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
        <div className="max-w-2xl mx-auto">
          <UploadImage 
            onImageUpload={handleImageUpload}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </main>
    </div>
  );
};

export default UploadImagePage;