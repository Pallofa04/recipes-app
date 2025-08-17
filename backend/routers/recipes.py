from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import google.generativeai as genai
import os, json
from typing import List, Optional
from supabase import create_client, Client

router = APIRouter()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class RecipeRequest(BaseModel):
    ingredients: List[str]
    calories: Optional[int]
    servings: int = Field(2, ge=1, le=12)
    dietaryPreferences: Optional[str]
    user_id: str

class RecipeResponse(BaseModel):
    id: str
    name: str
    description: str
    prep_time: str
    servings: int
    calories: Optional[int]
    ingredients: List[str]
    instructions: List[str]

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest):
    """
    Generate a recipe with Gemini, store in Supabase (recipes + history), and return it.
    """
    try:
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")

        model = genai.GenerativeModel("gemini-1.5-flash")

        # Build prompt
        calories_per_serving = f"- Target calories per serving: {request.calories // request.servings}" if request.calories else ""
        dietary_info = f"- Dietary preferences: {request.dietaryPreferences}" if request.dietaryPreferences else ""

        prompt = f"""
        Create a recipe using these ingredients: {', '.join(request.ingredients)}
        Requirements:
        - Language: Respond in the same language as the ingredients list
        - Servings: {request.servings}
        {calories_per_serving}
        {dietary_info}
        Output JSON only:
        {{
            "name": "Recipe Name",
            "description": "Brief description",
            "prepTime": "X minutes",
            "servings": {request.servings},
            "calories": "X calories per serving",
            "ingredients": ["ingredient 1", "ingredient 2"],
            "instructions": ["Step 1", "Step 2"]
        }}
        """

        response = model.generate_content([prompt])
        response_text = response.text.strip()

        # Parse JSON
        start, end = response_text.find("{"), response_text.rfind("}") + 1
        recipe_data = json.loads(response_text[start:end])

        # Normalize
        recipe_data.setdefault("description", "A delicious recipe made with your ingredients")
        recipe_data.setdefault("prepTime", "30 minutes")
        recipe_data.setdefault("servings", request.servings)
        recipe_data.setdefault("calories", None)

        if not isinstance(recipe_data.get("ingredients"), list):
            recipe_data["ingredients"] = [str(recipe_data["ingredients"])]
        if not isinstance(recipe_data.get("instructions"), list):
            recipe_data["instructions"] = [str(recipe_data["instructions"])]

        # Save in recipes
        insert_data = {
            "user_id": request.user_id,
            "name": recipe_data["name"],
            "description": recipe_data["description"],
            "prep_time": recipe_data["prepTime"],
            "servings": recipe_data["servings"],
            "calories": (
                int(recipe_data["calories"].split()[0])
                if isinstance(recipe_data["calories"], str) and recipe_data["calories"].split()[0].isdigit()
                else None
            ),
            "ingredients": recipe_data["ingredients"],
            "instructions": recipe_data["instructions"]
        }
        recipe_insert = supabase.table("recipes").insert(insert_data).execute()
        if not recipe_insert.data:
            raise HTTPException(status_code=500, detail="Failed to save recipe")

        recipe_id = recipe_insert.data[0]["id"]

        # Save in history
        supabase.table("history").insert({
            "user_id": request.user_id,
            "recipe_id": recipe_id
        }).execute()

        return {
            "id": recipe_id,
            "name": recipe_data["name"],
            "description": recipe_data["description"],
            "prep_time": recipe_data["prepTime"],
            "servings": recipe_data["servings"],
            "calories": insert_data["calories"],
            "ingredients": recipe_data["ingredients"],
            "instructions": recipe_data["instructions"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")
