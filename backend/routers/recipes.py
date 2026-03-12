from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
import os, json, logging
from typing import Any, Dict, List, Optional, Tuple
from supabase import create_client, Client
import re
from google.api_core.exceptions import ResourceExhausted

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
    language: Optional[str] = "en"

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
    
    Output JSON only, no markdown, no code blocks:
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
    
    logger.debug(f"Gemini response for {language}: {response_text[:200]}...")

    # Remove markdown code blocks if present
    if response_text.startswith("```"):
        response_text = re.sub(r"```(?:json)?\n?", "", response_text).strip()
    
    # Parse JSON - more robust extraction
    try:
        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError(f"No JSON found in response: {response_text}")
        
        json_str = response_text[start:end]
        recipe_data = json.loads(json_str)
        logger.debug(f"Parsed recipe data for {language}: {list(recipe_data.keys())}")
        return recipe_data
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error for {language}: {e}")
        logger.error(f"Response text: {response_text}")
        raise ValueError(f"Failed to parse recipe JSON: {e}")


def _normalize_recipe(recipe_data: Dict[str, Any], fallback_servings: int) -> Tuple[Dict[str, Any], Optional[int]]:
    recipe_data.setdefault("description", "A delicious recipe made with your ingredients")
    recipe_data.setdefault("prepTime", "30 minutes")
    recipe_data.setdefault("servings", fallback_servings)
    recipe_data.setdefault("calories", None)

    if not isinstance(recipe_data.get("ingredients"), list):
        recipe_data["ingredients"] = [str(recipe_data["ingredients"])]
    if not isinstance(recipe_data.get("instructions"), list):
        recipe_data["instructions"] = [str(recipe_data["instructions"])]

    parsed_calories = None
    calories_value = recipe_data.get("calories")

    if calories_value is None:
        parsed_calories = None
    elif isinstance(calories_value, int):
        parsed_calories = calories_value
    elif isinstance(calories_value, str):
        match = re.search(r'\d+', calories_value)
        if match:
            parsed_calories = int(match.group())

    recipe_data["calories"] = parsed_calories
    logger.debug(f"Normalized calories: {parsed_calories} from {calories_value}")
    return recipe_data, parsed_calories


def _translate_recipe_content(recipe_data: Dict[str, Any], language: str) -> Dict[str, Any]:
    model = genai.GenerativeModel("gemini-2.5-flash")
    language_instruction = "English" if language == "en" else "Spanish"
    original_json = json.dumps(recipe_data, ensure_ascii=False)

    prompt = f"""
    Translate this recipe JSON to {language_instruction}.
    Keep the exact same JSON structure.
    Return JSON only, with no markdown or extra text.

    JSON:
    {original_json}
    """

    response = model.generate_content([prompt])
    response_text = response.text.strip()

    if response_text.startswith("```"):
        response_text = re.sub(r"```(?:json)?\n?", "", response_text).strip()

    start = response_text.find("{")
    end = response_text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in translation response: {response_text}")

    translated_data = json.loads(response_text[start:end])
    translated_data["servings"] = recipe_data.get("servings", translated_data.get("servings"))
    translated_data["calories"] = recipe_data.get("calories", translated_data.get("calories"))
    return translated_data


def _build_content_payload(recipe_data: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": recipe_data["name"],
        "description": recipe_data["description"],
        "prep_time": recipe_data["prepTime"],
        "ingredients": recipe_data["ingredients"],
        "instructions": recipe_data["instructions"],
    }


def _store_missing_translation(recipe_id: str, source_data: Dict[str, Any], target_language: str):
    try:
        translated_data = _translate_recipe_content(source_data, target_language)
        content_key = f"content_{target_language}"
        supabase.table("recipes").update({content_key: _build_content_payload(translated_data)}).eq("id", recipe_id).execute()
        logger.info(f"Stored {target_language} translation for recipe {recipe_id}")
    except ResourceExhausted as exc:
        logger.warning(f"Skipped background translation for recipe {recipe_id} due to Gemini quota: {exc}")
    except Exception as exc:
        logger.error(f"Failed storing background translation for recipe {recipe_id}: {exc}", exc_info=True)


def _extract_retry_delay_seconds(exc: Exception) -> Optional[int]:
    match = re.search(r"retry in\s+([\d.]+)s", str(exc), re.IGNORECASE)
    if not match:
        return None

    try:
        return max(1, round(float(match.group(1))))
    except ValueError:
        return None

@router.post("/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest, background_tasks: BackgroundTasks):
    """
    Generate a recipe with Gemini in both EN and ES, store in Supabase (recipes + history), and return it.
    """
    try:
        logger.info(f"Generating recipe with ingredients: {request.ingredients}")
        
        if not request.ingredients:
            raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")

        preferred_language = "es" if request.language == "es" else "en"
        secondary_language = "en" if preferred_language == "es" else "es"

        primary_data = _generate_recipe_for_language(
            request.ingredients,
            request.servings,
            request.calories,
            request.dietaryPreferences,
            preferred_language,
        )
        primary_data, parsed_calories = _normalize_recipe(primary_data, request.servings)

        logger.debug(f"Primary recipe ({preferred_language}): {primary_data}")

        recipe_id = None
        if request.user_id and request.user_id != "guest":
            content_key = f"content_{preferred_language}"
            insert_data = {
                "user_id": request.user_id,
                "name": primary_data["name"],
                "description": primary_data["description"],
                "prep_time": primary_data["prepTime"],
                "servings": primary_data["servings"],
                "calories": parsed_calories,
                "ingredients": primary_data["ingredients"],
                "instructions": primary_data["instructions"],
                "source": "generate",
                content_key: _build_content_payload(primary_data),
            }
            
            logger.debug(f"Saving recipe to Supabase: {insert_data['name']}")
            recipe_insert = supabase.table("recipes").insert(insert_data).execute()
            if recipe_insert.data:
                recipe_id = recipe_insert.data[0]["id"]
                logger.info(f"Recipe saved with ID: {recipe_id}")
                
                # Save in history
                supabase.table("history").insert({
                    "user_id": request.user_id,
                    "recipe_id": recipe_id
                }).execute()

                background_tasks.add_task(
                    _store_missing_translation,
                    recipe_id,
                    primary_data,
                    secondary_language,
                )
        
        return {
            "id": recipe_id or f"guest_{hash(str(request.ingredients))}",
            "name": primary_data["name"],
            "description": primary_data["description"],
            "prep_time": primary_data["prepTime"],
            "servings": primary_data["servings"],
            "calories": parsed_calories,
            "ingredients": primary_data["ingredients"],
            "instructions": primary_data["instructions"]
        }

    except ResourceExhausted as e:
        retry_after = _extract_retry_delay_seconds(e)
        retry_message = f" Please retry in about {retry_after} seconds." if retry_after else ""
        raise HTTPException(
            status_code=503,
            detail=(
                "Recipe generation is temporarily unavailable because the Gemini API quota has been exceeded."
                f"{retry_message}"
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recipe: {str(e)}", exc_info=True)
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
