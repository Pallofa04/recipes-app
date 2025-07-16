import axios, { AxiosResponse } from 'axios';
import { DishIdentificationResponse, RecipeResponse, RecipeRequest, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const imageAPI = {
  analyzeImage: async (imageFile: File): Promise<DishIdentificationResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response: AxiosResponse<DishIdentificationResponse> = await api.post(
        `${API_BASE_URL}/images/identify-dish`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorData: ApiError = error.response?.data;
      const errorMessage = errorData?.error || 
                          errorData?.detail || 
                          'Failed to analyze image';
      throw new Error(errorMessage);
    }
  },
};

export const recipeAPI = {
  generateRecipe: async (params: RecipeRequest): Promise<RecipeResponse> => {
    try {
      const response: AxiosResponse<RecipeResponse> = await api.post('/recipes/generate', params);
      return response.data;
    } catch (error: any) {
      const errorData: ApiError = error.response?.data;
      const errorMessage = errorData?.error || 
                          errorData?.detail || 
                          'Failed to generate recipe';
      throw new Error(errorMessage);
    }
  },
};

export default api;