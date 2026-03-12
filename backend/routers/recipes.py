from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import google.generativeai as genai
import os, json
from typing import List, Optional
from supabase import create_client, Client
import asyncio
import concurrent.futures

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
    calories: Optional[int] = None
    servings: int = Field(2, ge=1, le=12)
    dietaryPreferences: Optional[str] = None
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

def _generate_recipe_for_language(ingredients: List[str], servings: int, calories: Optional[int], 
                                   dietary_prefs: Optional[str], language: str):
    """
    Generate recipe in specified language (en or es).
    Returns parsed JSON dict.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    language_instruction = "English" if language == "en" else "Spanish"
    calories_per_serving = f"- Target calories per serving: {calories // servings}" if calories else ""
    dietary_info = f"- Dietary preferences: {dietary_prefs}" if dietary_prefs else ""

    prompt = f"""
    Create a recipe using these ingredients: {', '.join(ingredients)}
    Requirements:
    - Language: Respond in {language_instruction}
    - Servings: {servings}
    {calories_per_serving}
    {dietary_info}
    - IMPORTANT: You MUST estimate and provide calories per serving as a number
    
    Output JSON only:
    {{
        "name": "Recipe Name",
        "description": "Brief description",
        "prepTime": "X minutes",
        "servings": {servings},
        "calories": 450,
        "ingredients": ["ingredient 1", "ingredient 2"],
        "instructions": ["Step 1", "Step 2"]
    }}
    
    CRITICAL: The "calories" field must be a number (integer) representing estimated calories per serving. Always provide a reasonable estimate based on the ingredients.
    """

    response = model.generate_content([prompt])
    response_text = response.text.strip()

    # Parse JSON
    start, end = response_text.find("{"), response_text.rfind("}") + 1
    recipe_data = json.loads(response_text[start:end])
    
    return recipe_data

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest):
    """
    Generate a recipe with Gemini in both EN and ES, store in Supabase (recipes + history), and return it.
    """
    try:
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")

        # Use thread pool to generate EN and ES in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            en_future = executor.submit(_generate_recipe_for_language, 
                                       request.ingredients, request.servings, request.calories, 
                                       request.dietaryPreferences, "en")
            es_future = executor.submit(_generate_recipe_for_language, 
                                       request.ingredients, request.servings, request.calories, 
                                       request.dietaryPreferences, "es")
            
            en_data = en_future.result()
            es_data = es_future.result()

        # Normalize both
        def normalize_recipe(recipe_data):
            recipe_data.setdefault("description", "A delicious recipe made with your ingredients")
            recipe_data.setdefault("prepTime", "30 minutes")
            recipe_data.setdefault("servings", request.servings)
            recipe_data.setdefault("calories", None)

            if not isinstance(recipe_data.get("ingredients"), list):
                recipe_data["ingredients"] = [str(recipe_data["ingredients"])]
            if not isinstance(recipe_data.get("instructions"), list):
                recipe_data["instructions"] = [str(recipe_data["instructions"])]

            parsed_calories = (
                int(recipe_data["calories"].split()[0])
                if isinstance(recipe_data["calories"], str) and recipe_data["calories"].split()[0].isdigit()
                else None
            )
            return recipe_data, parsed_calories

        en_data, en_calories = normalize_recipe(en_data)
        es_data, es_calories = normalize_recipe(es_data)

        # Use EN as primary display
        parsed_calories = en_calories or es_calories or None

        recipe_id = None
        if request.user_id and request.user_id != "guest":
            # Save in recipes with bilingual content
            insert_data = {
                "user_id": request.user_id,
                "name": en_data["name"],
                "description": en_data["description"],
                "prep_time": en_data["prepTime"],
                "servings": en_data["servings"],
                "calories": parsed_calories,
                "ingredients": en_data["ingredients"],
                "instructions": en_data["instructions"],
                "source": "generate",
                "content_en": {
                    "name": en_data["name"],
                    "description": en_data["description"],
                    "prep_time": en_data["prepTime"],
                    "ingredients": en_data["ingredients"],
                    "instructions": en_data["instructions"]
                },
                "content_es": {
                    "name": es_data["name"],
                    "description": es_data["description"],
                    "prep_time": es_data["prepTime"],
                    "ingredients": es_data["ingredients"],
                    "instructions": es_data["instructions"]
                }
            }
            
            recipe_insert = supabase.table("recipes").insert(insert_data).execute()
            if recipe_insert.data:
                recipe_id = recipe_insert.data[0]["id"]
                
                # Save in history
                supabase.table("history").insert({
                    "user_id": request.user_id,
                    "recipe_id": recipe_id
                }).execute()
        
        return {
            "id": recipe_id or f"guest_{hash(str(request.ingredients))}",
            "name": en_data["name"],
            "description": en_data["description"],
            "prep_time": en_data["prepTime"],
            "servings": en_data["servings"],
            "calories": parsed_calories,
            "ingredients": en_data["ingredients"],
            "instructions": en_data["instructions"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")

@router.get("/{recipe_id}")
async def get_recipe(recipe_id: str):
    """
    Get a single recipe by ID
    """
    try:
        resp = supabase.table("recipes").select("*").eq("id", recipe_id).execute()
        if not resp.data or len(resp.data) == 0:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return resp.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recipe: {str(e)}")
