from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os
import json
import logging
from PIL import Image, UnidentifiedImageError
import io
from typing import List, Optional, Dict, Any
import re
from pydantic import BaseModel

router = APIRouter()

# Gemini Configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Pydantic Models for validation
class IngredientInfo(BaseModel):
    name: str
    state: Optional[str] = None
    quantity: Optional[str] = None

class DishIdentificationResponse(BaseModel):
    dish_name: str
    type: str
    ingredients: List[IngredientInfo]
    origin: str
    preparation: List[str]
    cooking_time: Optional[str] = None
    serving_suggestion: Optional[str] = None
    similar_recipe_id: Optional[str] = None
    success: bool

def extract_json(text: str) -> Dict[str, Any]:
    """Extracts and validates JSON from Gemini's response"""
    try:
        # Find the first valid JSON block
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group(0))
        raise ValueError("No valid JSON found in the response")
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON decoding error: {str(e)}")

async def validate_image_file(file: UploadFile):
    """Validates the image file"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "Only image files are allowed (JPEG, PNG, WEBP)")
    
    try:
        image_data = await file.read()
        if len(image_data) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(400, "Image must be smaller than 10MB")
        
        image = Image.open(io.BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image
    except UnidentifiedImageError:
        raise HTTPException(400, "Unsupported image format")
    except Exception as e:
        raise HTTPException(400, f"Error processing image: {str(e)}")

@router.post("/identify-dish", response_model=DishIdentificationResponse)
async def identify_dish(image: UploadFile = File(...)):
    """
    Identifies cooked dishes with:
    - All detected ingredients
    - Preparation instructions
    - Similar recipe (if available)
    """
    try:
        # 1. Validate and process image
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(500, "Gemini API key not configured")
        
        pil_image = await validate_image_file(image)

        # 2. Optimized prompt
        prompt = """Analyze this cooked dish and return:
        - Dish name (in Spanish)
        - Type (main course/starter/dessert)
        - All visible ingredients with state and approximate quantity
        - Cultural origin
        - Preparation steps
        - Suggested cooking time
        - Presentation suggestion

        Strict JSON format:
        {
            "dish_name": "str",
            "type": "str",
            "ingredients": [
                {
                    "name": "str",
                    "state": "str", 
                    "quantity": "str"
                }
            ],
            "origin": "str",
            "preparation": ["str"],
            "cooking_time": "str",
            "serving_suggestion": "str"
        }"""

        # 3. Call to Gemini with optimized configuration
        response = model.generate_content(
            [prompt, pil_image],
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1000
            }
        )

        # 4. Response processing
        dish_data = extract_json(response.text)
        
        # 5. Field validation
        required_fields = ["dish_name", "ingredients", "preparation", "origin"]
        for field in required_fields:
            if field not in dish_data:
                raise ValueError(f"Missing required field: {field}")

        # 6. Build response
        return {
            "dish_name": dish_data["dish_name"],
            "type": dish_data.get("type", "main course"),
            "ingredients": dish_data["ingredients"],
            "origin": dish_data["origin"],
            "preparation": dish_data["preparation"],
            "cooking_time": dish_data.get("cooking_time"),
            "serving_suggestion": dish_data.get("serving_suggestion"),
            "success": True
        }

    except HTTPException:
        raise
    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")
        raise HTTPException(400, f"Invalid data: {str(e)}")
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error analyzing the dish")
    
@router.get("/upload-limits")
async def get_upload_limits():
    return {
        "max_file_size_mb": 10,
        "supported_formats": ["JPEG", "PNG", "WEBP"],
        "max_dimensions": None
    }