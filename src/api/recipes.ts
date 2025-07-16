import api from './client';
import { RecipeRequest, RecipeResponse } from '../types';

export const generateRecipe = async (params: RecipeRequest): Promise<RecipeResponse> => {
  const response = await api.post<RecipeResponse>('/recipes/generate', params);
  return response.data;
};
