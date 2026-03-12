from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os, json, logging, io, re
from PIL import Image, UnidentifiedImageError
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from supabase import create_client, Client
import concurrent.futures

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
async def identify_dish(image: UploadFile = File(...), user_id: Optional[str] = Form(None)):
    """
    Identify a dish from an image, save in Supabase only for registered users (with bilingual content).
    """
    try:
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(500, "Gemini API key not configured")

        pil_image = await validate_image_file(image)

        # Prompt mejorado para forzar JSON puro
        prompt = """Analyze this cooked dish image and respond with ONLY valid JSON (no markdown, no code blocks, no extra text).

        Return this exact structure:
        {
            "dish_name": "name of the dish",
            "type": "appetizer/main course/dessert/etc",
            "ingredients": [
                {"name": "ingredient name", "state": "raw/cooked/chopped", "quantity": "approximate amount"}
            ],
            "origin": "country or region",
            "preparation": ["step 1", "step 2", "step 3"],
            "cooking_time": "X minutes",
            "serving_suggestion": "how to serve it"
        }
        
        IMPORTANT: Return ONLY the JSON object, nothing else."""

        response = model.generate_content(
            [prompt, pil_image],
            generation_config={"temperature": 0.3, "max_output_tokens": 1500}
        )

        response_text = response.text.strip()

        # Intenta extraer JSON (quitando markdown si existe)
        if response_text.startswith("```"):
            # Quita los bloques de código markdown
            response_text = re.sub(r"```(?:json)?\n?", "", response_text).strip()
        
        dish_data_en = extract_json(response_text)

        # Validar que tenga los campos mínimos
        if "dish_name" not in dish_data_en:
            raise ValueError("Response missing 'dish_name'")
        if "ingredients" not in dish_data_en:
            dish_data_en["ingredients"] = []
        if "preparation" not in dish_data_en:
            dish_data_en["preparation"] = []

        # Ensure servings and calories
        servings = 2  # Default to 2 servings for photo dishes
        if not dish_data_en.get("servings"):
            dish_data_en["servings"] = servings

        # Estimate calories if not provided
        if not dish_data_en.get("calories"):
            # Get calorie estimate from Gemini based on ingredients
            calorie_prompt = f"""Estimate the total calories for this dish (for {servings} servings) based on these ingredients and description:
            Dish: {dish_data_en.get('dish_name', 'unknown')}
            Ingredients: {dish_data_en.get('ingredients', [])}
            Description: Identified from a photo
            
            Respond with ONLY a single number (estimated calories per serving for {servings} servings). No text, no explanation. For example: 450"""
            
            calorie_response = model.generate_content(calorie_prompt, generation_config={"temperature": 0.3, "max_output_tokens": 10})
            calorie_text = calorie_response.text.strip()
            
            try:
                # Extract number from response
                calorie_match = re.search(r'\d+', calorie_text)
                if calorie_match:
                    estimated_calories = int(calorie_match.group())
                    dish_data_en["calories"] = estimated_calories
                else:
                    # Fallback: reasonable estimate based on typical dishes
                    dish_data_en["calories"] = 400
            except:
                dish_data_en["calories"] = 400

        # Translate to Spanish
        dish_data_es = _translate_dish_to_language(dish_data_en, "es")

        # Solo guardar en base de datos si es usuario registrado
        recipe_id = None
        if user_id and user_id != "guest":
            # Save into recipes with bilingual content
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
                },
                "content_es": {
                    "name": dish_data_es["dish_name"],
                    "description": f"Identificado {dish_data_es['dish_name']} de una imagen",
                    "prep_time": dish_data_es.get("cooking_time", "unknown"),
                    "ingredients": dish_data_es.get("ingredients", []),
                    "instructions": dish_data_es.get("preparation", [])
                }
            }
            recipe_insert = supabase.table("recipes").insert(insert_data).execute()
            if recipe_insert.data:
                recipe_id = recipe_insert.data[0]["id"]
                
                # Save in history
                supabase.table("history").insert({
                    "user_id": user_id,
                    "recipe_id": recipe_id
                }).execute()

        return {
            "id": recipe_id or f"guest_{hash(pil_image.tobytes())}",
            "dish_name": dish_data_en["dish_name"],
            "type": dish_data_en.get("type", "main course"),
            "ingredients": dish_data_en.get("ingredients", []),
            "origin": dish_data_en.get("origin", "unknown"),
            "preparation": dish_data_en.get("preparation", []),
            "cooking_time": dish_data_en.get("cooking_time"),
            "serving_suggestion": dish_data_en.get("serving_suggestion"),
            "success": True
        }

    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        raise HTTPException(500, f"Error analyzing the dish: {str(e)}")
