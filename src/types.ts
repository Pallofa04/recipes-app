export interface IngredientInfo {
  name: string;
  state?: string;
  quantity?: string;
}

export interface DishIdentificationResponse {
  dish_name: string;
  type: string;
  ingredients: IngredientInfo[];
  origin: string;
  preparation: string[];
  cooking_time?: string;
  serving_suggestion?: string;
  similar_recipe_id?: string;
  success: boolean;
}

export interface RecipeRequest {
  ingredients: string[];
  calories?: number;
  servings: number;
  dietaryPreferences?: string;
}

export interface RecipeResponse {
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  calories: string;
  ingredients: string[];
  instructions: string[];
}

export interface ApiError {
  detail: string;
  error?: string;
}