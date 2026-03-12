import api from './client';
import { RecipeRequest, RecipeResponse, Recipe } from '../types';

export const generateRecipe = async (params: RecipeRequest): Promise<RecipeResponse> => {
  // Crear copia para no modificar el objeto original
  const requestData = { 
    ...params,
    user_id: params.user_id || 'guest'
  };

  const response = await api.post<RecipeResponse>('/recipes/generate', requestData);
  return response.data;
};

export const getRecipe = async (recipeId: string): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/recipes/${recipeId}`);
  return response.data;
};