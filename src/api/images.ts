import api from './client';
import { DishIdentificationResponse } from '../types';

export const analyzeImage = async (imageFile: File): Promise<DishIdentificationResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);

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
