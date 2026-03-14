import api from './client';
import { Recipe } from '../types';

export const getFavorites = async (userId: string): Promise<Recipe[]> => {
  const response = await api.get<Recipe[]>(`/favorites/${userId}`);
  return response.data;
};

export const checkIfFavorite = async (recipeId: string, userId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites(userId);
    return favorites.some(recipe => recipe.id === recipeId);
  } catch {
    return false;
  }
};

export const addFavorite = async (recipeId: string, userId: string): Promise<{ status: string }> => {
  const response = await api.post<{ status: string }>(
    `/favorites/${recipeId}?user_id=${userId}`
  );
  return response.data;
};

export const removeFavorite = async (recipeId: string, userId: string): Promise<{ status: string }> => {
  const response = await api.delete<{ status: string }>(
    `/favorites/${recipeId}?user_id=${userId}`
  );
  return response.data;
};