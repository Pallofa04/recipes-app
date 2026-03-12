import api from './client';
import { Recipe } from '../types';

export const getUserHistory = async (userId: string): Promise<Recipe[]> => {
  const response = await api.get<Recipe[]>(`/history/${userId}`);
  return response.data;
};