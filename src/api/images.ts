import api from './client';
import { DishIdentificationResponse } from '../types';

export const analyzeImage = async (imageFile: File, userId?: string, language?: string): Promise<DishIdentificationResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  if (userId && userId !== 'guest') {
    formData.append('user_id', userId);
  }
  
  if (language) {
    formData.append('language', language);
  }

  const response = await api.post<DishIdentificationResponse>(
    '/images/identify-dish',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};