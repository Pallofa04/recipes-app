import { useState } from 'react';
import { ChefHat, Clock, MapPin, Users, Utensils, ChevronDown, ChevronUp, RotateCcw, Flame, Salad, CakeSlice } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IngredientInfo {
  name: string;
  state?: string;
  quantity?: string;
}

interface DishAnalysisResult {
  dish_name: string;
  type: string;
  ingredients: IngredientInfo[];
  calories?: number;
  servings?: number;
  origin: string;
  preparation: string[];
  cooking_time?: string;
  serving_suggestion?: string;
  success: boolean;
  
}

interface DishResultsProps {
  result: DishAnalysisResult | null | undefined;
  imageUrl: string;
  onReset: () => void;
}

const DishResults = ({ result, imageUrl, onReset }: DishResultsProps) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    preparation: false,
    details: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle undefined or null result
  if (!result) {
    return (
      <div className="animate-fade-in">
        <div className="card">
          <div className="card-body text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-h2 mb-2 text-gray-800">{t('dishResults.noResults')}</h2>
            <p className="text-body text-gray-600 mb-6">
              {t('dishResults.noData')}
            </p>
            <button onClick={onReset} className="btn btn-primary">
              <RotateCcw className="w-5 h-5" />
              {t('dishResults.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'starter':
      case 'entrante':
        return <Salad className="w-8 h-8 text-primary-600" />;
      case 'main course':
      case 'plato principal':
        return <Utensils className="w-8 h-8 text-primary-600" />;
      case 'dessert':
      case 'postre':
        return <CakeSlice className="w-8 h-8 text-primary-600" />;
      default:
        return <Utensils className="w-8 h-8 text-primary-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'starter': t('dishResults.typeStarter'),
      'main course': t('dishResults.typeMain'),
      'dessert': t('dishResults.typeDessert'),
      'entrante': t('dishResults.typeStarter'),
      'plato principal': t('dishResults.typeMain'),
      'postre': t('dishResults.typeDessert')
    };
    return typeMap[type.toLowerCase()] || type;
  };

  if (!result.success) {
    return (
      <div className="animate-fade-in">
        <div className="card">
          <div className="card-body text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-h2 mb-2 text-red-800">{t('dishResults.analysisError')}</h2>
            <p className="text-body text-gray-600 mb-6">
              {t('dishResults.analysisErrorDesc')}
            </p>
            <button onClick={onReset} className="btn btn-primary">
              <RotateCcw className="w-5 h-5" />
              {t('dishResults.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with image and basic info */}
      <div className="card">
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img
                src={imageUrl}
                alt={result.dish_name}
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
            
            {/* Basic Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl">{getTypeIcon(result.type)}</span>
                <div>
                  <h1 className="text-h1 text-gray-800">{result.dish_name}</h1>
                  <div className="flex items-center gap-2 text-body-sm text-gray-600 mt-1">
                    <Utensils className="w-4 h-4" />
                    <span>{getTypeLabel(result.type)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-body-sm">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="text-gray-600">{t('dishResults.origin')}</span>
                  <span className="font-medium">{result.origin}</span>
                </div>
                
                {result.cooking_time && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span className="text-gray-600">{t('dishResults.time')}</span>
                    <span className="font-medium">{result.cooking_time}</span>
                  </div>
                )}

                {result.calories !== undefined && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-600">{t('recipeDisplay.calories')}</span>
                    <span className="font-medium">{result.calories} kcal</span>
                  </div>
                )}

                {result.servings !== undefined && (
                  <div className="flex items-center gap-2 text-body-sm">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">{t('recipeDisplay.servings')}</span>
                    <span className="font-medium">{result.servings}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button onClick={onReset} className="btn btn-outline">
              <RotateCcw className="w-5 h-5" />
              {t('dishResults.analyzeAnother')}
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="card">
        <div className="card-header">
          <button
            onClick={() => toggleSection('ingredients')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-primary-600" />
              <h2 className="text-h2">{t('dishResults.identifiedIngredients')}</h2>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-caption font-medium">
                {result.ingredients?.length || 0}
              </span>
            </div>
            {expandedSections.ingredients ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {expandedSections.ingredients && (
          <div className="card-body">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.ingredients?.map((ingredient, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2">{ingredient.name}</h3>
                  <div className="space-y-1">
                    {ingredient.state && (
                      <div className="flex items-center gap-2 text-body-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>{t('dishResults.state')} {ingredient.state}</span>
                      </div>
                    )}
                    {ingredient.quantity && (
                      <div className="flex items-center gap-2 text-body-sm text-gray-600">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{t('dishResults.quantity')} {ingredient.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        )}
      </div>

      {/* Preparation Section */}
      <div className="card">
        <div className="card-header">
          <button
            onClick={() => toggleSection('preparation')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-h2">{t('dishResults.preparation')}</h2>
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-caption font-medium">
                {t('dishResults.steps', { count: result.preparation?.length || 0 })}
              </span>
            </div>
            {expandedSections.preparation ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {expandedSections.preparation && (
          <div className="card-body">
            <ol className="space-y-4">
              {result.preparation?.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-body text-gray-700 pt-1">{step}</p>
                </li>
              )) || []}
            </ol>
          </div>
        )}
      </div>

      {/* Additional Details */}
      {result.serving_suggestion && (
        <div className="card">
          <div className="card-header">
            <button
              onClick={() => toggleSection('details')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-primary-600" />
                <h2 className="text-h2">{t('dishResults.servingSuggestions')}</h2>
              </div>
              {expandedSections.details ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {expandedSections.details && (
            <div className="card-body">
              <p className="text-body text-gray-700">{result.serving_suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DishResults;