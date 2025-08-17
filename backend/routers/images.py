from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os, json, logging, io, re
from PIL import Image, UnidentifiedImageError
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter()

# Gemini config
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

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

# ----------------------------
# ENDPOINT
# ----------------------------
@router.post("/identify-dish", response_model=DishIdentificationResponse)
async def identify_dish(image: UploadFile = File(...), user_id: str = None):
    """
    Identify a dish from an image, save in Supabase (recipes + history).
    """
    try:
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(500, "Gemini API key not configured")
        if not user_id:
            raise HTTPException(400, "user_id is required")

        pil_image = await validate_image_file(image)

        prompt = """Analyze this cooked dish and return JSON:
        {
            "dish_name": "str",
            "type": "str",
            "ingredients": [{"name": "str", "state": "str", "quantity": "str"}],
            "origin": "str",
            "preparation": ["str"],
            "cooking_time": "str",
            "serving_suggestion": "str"
        }"""

        response = model.generate_content(
            [prompt, pil_image],
            generation_config={"temperature": 0.3, "max_output_tokens": 1000}
        )

        dish_data = extract_json(response.text)

        # Save into recipes
        insert_data = {
            "user_id": user_id,
            "name": dish_data["dish_name"],
            "description": f"Identified {dish_data['dish_name']} from an image",
            "prep_time": dish_data.get("cooking_time", "unknown"),
            "servings": 1,
            "calories": None,
            "ingredients": dish_data["ingredients"],
            "instructions": dish_data["preparation"],
            "source": "image"
        }
        recipe_insert = supabase.table("recipes").insert(insert_data).execute()
        if not recipe_insert.data:
            raise HTTPException(500, "Failed to save dish in database")

        recipe_id = recipe_insert.data[0]["id"]

        # Save in history
        supabase.table("history").insert({
            "user_id": user_id,
            "recipe_id": recipe_id
        }).execute()

        return {
            "id": recipe_id,
            "dish_name": dish_data["dish_name"],
            "type": dish_data.get("type", "main course"),
            "ingredients": dish_data["ingredients"],
            "origin": dish_data["origin"],
            "preparation": dish_data["preparation"],
            "cooking_time": dish_data.get("cooking_time"),
            "serving_suggestion": dish_data.get("serving_suggestion"),
            "success": True
        }

    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        raise HTTPException(500, f"Error analyzing the dish: {str(e)}")
