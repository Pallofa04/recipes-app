export interface IngredientInfo {
  name: string;
  state?: string;
  quantity?: string;
}

export interface DishIdentificationResponse {
  id: string | null;
  dish_name: string;
  type: string;
  ingredients: IngredientInfo[];
  origin: string;
  preparation: string[];
  cooking_time?: string;
  serving_suggestion?: string;
  calories?: number;
  servings?: number;
  similar_recipe_id?: string;
  success: boolean;
}

export interface RecipeRequest {
  ingredients: string[];
  servings: number;
  calories?: number;
  dietaryPreferences?: string;
  user_id: string;
  language?: 'en' | 'es';
}

export interface RecipeResponse {
  id: string;
  name: string;
  description: string;
  prep_time: string;
  servings: number;
  calories: number;
  ingredients: string[] | IngredientInfo[];
  instructions: string[];
  created_at?: string;
}

export interface RecipeContent {
  name: string;
  description: string;
  ingredients: string[] | IngredientInfo[];
  instructions: string[];
  prep_time?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prep_time: string;
  servings: number;
  calories?: number;
  created_at: string;
  source?: string;
  ingredients?: any[];
  instructions?: string[];
  content_en?: RecipeContent;
  content_es?: RecipeContent;
}
