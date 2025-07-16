from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import google.generativeai as genai
import os
import json
from typing import List, Optional

router = APIRouter()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class RecipeRequest(BaseModel):
    ingredients: List[str] = Field(..., description="List of ingredients to use in the recipe")
    calories: Optional[int] = Field(None, description="Target total calories for the recipe")
    servings: int = Field(2, description="Number of servings", ge=1, le=12)
    dietaryPreferences: Optional[str] = Field(None, description="Dietary preferences or restrictions")

class RecipeResponse(BaseModel):
    name: str
    description: str
    prepTime: str
    servings: int
    calories: str
    ingredients: List[str]
    instructions: List[str]

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest):
    """
    Generate a recipe based on ingredients and constraints using Gemini Pro
    """
    try:
        # Validate input
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")
        
        # Check if Gemini API key is configured
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build the prompt with constraints
        calories_per_serving = ""
        if request.calories:
            calories_per_serving = f"- Target calories per serving: around {request.calories // request.servings}"
        
        dietary_info = ""
        if request.dietaryPreferences:
            dietary_info = f"- Dietary preferences: {request.dietaryPreferences}"
        
        prompt = f"""
        Create a recipe using these ingredients: {', '.join(request.ingredients)}
        
        Requirements:
        - Language: Respond in the same language as the ingredients list
        - Servings: {request.servings}
        {calories_per_serving}
        {dietary_info}
        
        Please provide a complete recipe in the following JSON format:
        {{
            "name": "Recipe Name",
            "description": "Brief description of the dish",
            "prepTime": "X minutes",
            "servings": {request.servings},
            "calories": "X calories per serving",
            "ingredients": [
                "ingredient with measurement",
                "ingredient with measurement"
            ],
            "instructions": [
                "Step 1 instruction",
                "Step 2 instruction"
            ]
        }}
        
        Make sure the recipe is practical and uses realistic measurements.
        Only use the ingredients provided, but you can add common seasonings and basic pantry items.
        Return only the JSON, no additional text.
        """
        
        # Generate recipe
        response = model.generate_content([prompt])
        response_text = response.text.strip()
        
        # Parse the JSON response
        try:
            # Extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                recipe_data = json.loads(json_str)
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing JSON response: {e}")
            print(f"Raw response: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate recipe. Please try again."
            )
        
        # Validate the recipe structure
        required_fields = ['name', 'ingredients', 'instructions']
        for field in required_fields:
            if field not in recipe_data:
                raise HTTPException(
                    status_code=500,
                    detail=f"Invalid recipe format: missing {field}"
                )
        
        # Ensure arrays are properly formatted
        if not isinstance(recipe_data.get('ingredients'), list):
            recipe_data['ingredients'] = [str(recipe_data.get('ingredients', ''))]
        
        if not isinstance(recipe_data.get('instructions'), list):
            recipe_data['instructions'] = [str(recipe_data.get('instructions', ''))]
        
        # Set default values for missing fields
        recipe_data.setdefault('description', 'A delicious recipe made with your ingredients')
        recipe_data.setdefault('prepTime', '30 minutes')
        recipe_data.setdefault('servings', request.servings)
        recipe_data.setdefault('calories', 'Varies')
        
        return JSONResponse(content=recipe_data)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating recipe: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recipe: {str(e)}"
        )

@router.get("/health")
async def recipe_health():
    """Health check for recipe generation service"""
    return {
        "status": "OK",
        "service": "Recipe Generation",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }