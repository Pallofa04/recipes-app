from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os, json, logging, io, re
from PIL import Image, UnidentifiedImageError
from typing import List, Optional, Dict, Any
import asyncio
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter()

# Gemini config
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# ----------------------------
# MODELS
# ----------------------------
class IngredientInfo(BaseModel):
    name: str
    state: Optional[str] = None
    quantity: Optional[str] = None

class DishIdentificationResponse(BaseModel):
    id: str
    dish_name: str
    type: str
    ingredients: List[IngredientInfo]
    origin: str
    preparation: List[str]
    cooking_time: Optional[str] = None
    serving_suggestion: Optional[str] = None
    success: bool

# ----------------------------
# HELPERS
# ----------------------------
def extract_json(text: str) -> Dict[str, Any]:
    json_match = re.search(r"\{[\s\S]*\}", text)
    if not json_match:
        raise ValueError("No valid JSON found in response")
    return json.loads(json_match.group(0))

async def validate_image_file(file: UploadFile):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files allowed")
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "Image must be smaller than 10MB")
    try:
        image = Image.open(io.BytesIO(data))
        if image.mode != "RGB":
            image = image.convert("RGB")
        return image
    except UnidentifiedImageError:
        raise HTTPException(400, "Unsupported image format")

def _estimate_calories(dish_type: str, ingredient_count: int, dish_name: str = "") -> int:
    """
    Estimate calories based on dish type and ingredient count.
    Returns reasonable estimates for 2 servings.
    """
    dish_type_lower = dish_type.lower()
    
    # Base calories by type
    base_calories = {
        'appetizer': 200,
        'entrante': 200,
        'starter': 200,
        'main course': 500,
        'plato principal': 500,
        'main': 500,
        'dessert': 350,
        'postre': 350,
        'salad': 200,
        'ensalada': 200,
        'soup': 250,
        'sopa': 250,
        'pasta': 600,
        'rice': 550,
        'arroz': 550,
        'meat': 600,
        'carne': 600,
        'fish': 400,
        'pescado': 400,
        'chicken': 450,
        'pollo': 450,
        'vegetable': 250,
        'vegetal': 250,
    }
    
    # Find matching type
    calories = 400  # default
    for key, value in base_calories.items():
        if key in dish_type_lower:
            calories = value
            break
    
    # Adjust based on ingredient count (more ingredients = more calories)
    ingredient_adjustment = ingredient_count * 30
    total = calories + ingredient_adjustment
    
    # Cap at reasonable values
    if total > 1000:
        total = 900
    if total < 100:
        total = 200
    
    return total

def _translate_dish_to_language(dish_data: Dict[str, Any], language: str):
    """
    Translate identified dish to specified language (en or es).
    Takes the parsed dish_data and returns translated version.
    """
    language_name = "English" if language == "en" else "Spanish"
    
    original_json = json.dumps(dish_data, ensure_ascii=False)
    
    prompt = f"""Translate this recipe data to {language_name}. 
    Return ONLY valid JSON (no markdown, no code blocks, no extra text) with the exact same structure.
    
    Original data:
    {original_json}
    
    Return:
    {{
        "dish_name": "translated name",
        "type": "translated type",
        "ingredients": [
            {{"name": "translated ingredient", "state": "translated state or null", "quantity": "quantity or null"}}
        ],
        "origin": "translated origin",
        "preparation": ["translated step 1", "translated step 2"],
        "cooking_time": "translated time or null",
        "serving_suggestion": "translated suggestion or null"
    }}
    
    Translate ONLY content, preserve structure and null values."""
    
    response = model.generate_content([prompt])
    response_text = response.text.strip()
    
    if response_text.startswith("```"):
        response_text = re.sub(r"```(?:json)?\n?", "", response_text).strip()
    
    translated_data = extract_json(response_text)
    
    return translated_data

# ----------------------------
# ENDPOINT
# ----------------------------
@router.post("/identify-dish", response_model=DishIdentificationResponse)
async def identify_dish(
    image: UploadFile = File(...), 
    user_id: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Identify a dish from an image, save in Supabase only for registered users (with bilingual content).
    Returns response in user's preferred language immediately.
    """
    try:
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(500, "Gemini API key not configured")

        pil_image = await validate_image_file(image)

        # Improved prompt to include calories estimation
        prompt = """Analyze this cooked dish image and respond with ONLY valid JSON (no markdown, no code blocks, no extra text).

        Estimate the calories per serving based on typical recipes for this dish.
        For the dish type, use categories like: appetizer, main course, dessert, salad, soup, pasta, rice, meat, fish, chicken, vegetable, etc.

        Return this exact structure:
        {
            "dish_name": "name of the dish",
            "type": "appetizer/main course/dessert/salad/soup/pasta/rice/meat/fish/chicken/vegetable",
            "ingredients": [
                {"name": "ingredient name", "state": "raw/cooked/chopped/diced", "quantity": "approximate amount"}
            ],
            "origin": "country or region where this dish originates",
            "preparation": ["step 1", "step 2", "step 3"],
            "cooking_time": "X minutes",
            "serving_suggestion": "how to serve it and presentation tips",
            "calories": estimated_calories_per_serving_as_number,
            "servings": typical_number_of_servings_as_number
        }
        
        IMPORTANT NOTES:
        - Return ONLY the JSON object, nothing else
        - calories should be a number (e.g., 450)
        - servings should be a number (e.g., 2)
        - For calories, estimate realistically based on the dish type and visible ingredients
        - If unsure, estimate based on typical restaurant portions of that dish type"""

        response = model.generate_content(
            [prompt, pil_image],
            generation_config={"temperature": 0.4, "max_output_tokens": 1500}
        )

        response_text = response.text.strip()

        # Try to extract JSON (removing markdown if present)
        if response_text.startswith("```"):
            response_text = re.sub(r"```(?:json)?\n?", "", response_text).strip()
        
        dish_data_en = extract_json(response_text)

        # Validate minimum fields
        if "dish_name" not in dish_data_en:
            raise ValueError("Response missing 'dish_name'")
        if "ingredients" not in dish_data_en:
            dish_data_en["ingredients"] = []
        if "preparation" not in dish_data_en:
            dish_data_en["preparation"] = []

        # Ensure calories and servings have reasonable values
        if not dish_data_en.get("calories") or dish_data_en.get("calories") <= 0:
            ingredient_count = len(dish_data_en.get("ingredients", []))
            estimated_calories = _estimate_calories(
                dish_data_en.get("type", "main course"),
                ingredient_count,
                dish_data_en.get("dish_name", "")
            )
            dish_data_en["calories"] = estimated_calories
        
        if not dish_data_en.get("servings") or dish_data_en.get("servings") <= 0:
            dish_data_en["servings"] = 2  # Default to 2 servings

        # Determine which language to return
        preferred_language = language or "en"
        
        # Translate to Spanish if requested
        dish_data_response = dish_data_en
        if preferred_language == "es":
            try:
                dish_data_response = _translate_dish_to_language(dish_data_en, "es")
                # Keep calories from EN version
                dish_data_response["calories"] = dish_data_en.get("calories", 400)
                dish_data_response["servings"] = dish_data_en.get("servings", 2)
            except Exception as e:
                logging.warning(f"Translation failed, returning English: {e}")
                dish_data_response = dish_data_en

        # Save to Supabase in background if user is logged in
        recipe_id = None
        if user_id and user_id != "guest":
            # Create insert data with both languages
            insert_data = {
                "user_id": user_id,
                "name": dish_data_en["dish_name"],
                "description": f"Identified {dish_data_en['dish_name']} from an image",
                "prep_time": dish_data_en.get("cooking_time", "unknown"),
                "servings": dish_data_en.get("servings", 2),
                "calories": dish_data_en.get("calories", 400),
                "ingredients": dish_data_en.get("ingredients", []),
                "instructions": dish_data_en.get("preparation", []),
                "source": "photo",
                "content_en": {
                    "name": dish_data_en["dish_name"],
                    "description": f"Identified {dish_data_en['dish_name']} from an image",
                    "prep_time": dish_data_en.get("cooking_time", "unknown"),
                    "ingredients": dish_data_en.get("ingredients", []),
                    "instructions": dish_data_en.get("preparation", [])
                }
            }
            
            # If we have Spanish data, add it
            if preferred_language == "es" and dish_data_response != dish_data_en:
                insert_data["content_es"] = {
                    "name": dish_data_response.get("dish_name", dish_data_en["dish_name"]),
                    "description": f"Identificado {dish_data_response.get('dish_name', dish_data_en['dish_name'])} desde una imagen",
                    "prep_time": dish_data_response.get("cooking_time", dish_data_en.get("cooking_time", "unknown")),
                    "ingredients": dish_data_response.get("ingredients", dish_data_en.get("ingredients", [])),
                    "instructions": dish_data_response.get("preparation", dish_data_en.get("preparation", []))
                }

            try:
                recipe_insert = supabase.table("recipes").insert(insert_data).execute()
                if recipe_insert.data:
                    recipe_id = recipe_insert.data[0]["id"]
                    
                    # Save in history
                    supabase.table("history").insert({
                        "user_id": user_id,
                        "recipe_id": recipe_id
                    }).execute()
                    
                    # Background task: translate to missing language if needed
                    if preferred_language == "en" and not insert_data.get("content_es"):
                        background_tasks.add_task(
                            _add_missing_translation,
                            recipe_id,
                            dish_data_en,
                            "es",
                            user_id
                        )
                    elif preferred_language == "es" and not insert_data.get("content_es"):
                        background_tasks.add_task(
                            _add_missing_translation,
                            recipe_id,
                            dish_data_en,
                            "en",
                            user_id
                        )
            except Exception as e:
                logging.error(f"Failed to save recipe: {e}")

        return {
            "id": recipe_id or f"guest_{hash(pil_image.tobytes())}",
            "dish_name": dish_data_response.get("dish_name", dish_data_en["dish_name"]),
            "type": dish_data_response.get("type", dish_data_en.get("type", "main course")),
            "ingredients": dish_data_response.get("ingredients", dish_data_en.get("ingredients", [])),
            "origin": dish_data_response.get("origin", dish_data_en.get("origin", "unknown")),
            "preparation": dish_data_response.get("preparation", dish_data_en.get("preparation", [])),
            "cooking_time": dish_data_response.get("cooking_time", dish_data_en.get("cooking_time")),
            "serving_suggestion": dish_data_response.get("serving_suggestion", dish_data_en.get("serving_suggestion")),
            "calories": dish_data_en.get("calories", 400),
            "servings": dish_data_en.get("servings", 2),
            "success": True
        }

    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        raise HTTPException(500, f"Error analyzing the dish: {str(e)}")


async def _add_missing_translation(recipe_id: str, dish_data_en: Dict[str, Any], target_lang: str, user_id: str):
    """Background task to add missing language translation to a recipe."""
    try:
        translated_data = _translate_dish_to_language(dish_data_en, target_lang)
        
        content_key = "content_es" if target_lang == "es" else "content_en"
        content_value = {
            "name": translated_data.get("dish_name", dish_data_en["dish_name"]),
            "description": f"{'Identificado' if target_lang == 'es' else 'Identified'} {translated_data.get('dish_name', dish_data_en['dish_name'])} {'desde una imagen' if target_lang == 'es' else 'from an image'}",
            "prep_time": translated_data.get("cooking_time", dish_data_en.get("cooking_time", "unknown")),
            "ingredients": translated_data.get("ingredients", dish_data_en.get("ingredients", [])),
            "instructions": translated_data.get("preparation", dish_data_en.get("preparation", []))
        }
        
        supabase.table("recipes").update({content_key: content_value}).eq("id", recipe_id).execute()
        logging.info(f"Added {target_lang} translation to recipe {recipe_id}")
    except Exception as e:
        logging.error(f"Failed to add translation to recipe {recipe_id}: {e}")
