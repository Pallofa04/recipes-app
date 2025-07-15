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

# Configuración de Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# Modelos Pydantic para validación
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
    """Extrae y valida el JSON de la respuesta de Gemini"""
    try:
        # Buscar el primer bloque JSON válido
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group(0))
        raise ValueError("No se encontró JSON válido en la respuesta")
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decodificando JSON: {str(e)}")

async def validate_image_file(file: UploadFile):
    """Valida el archivo de imagen"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(400, "Solo se permiten archivos de imagen (JPEG, PNG, WEBP)")
    
    try:
        image_data = await file.read()
        if len(image_data) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(400, "La imagen debe ser menor a 10MB")
        
        image = Image.open(io.BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image
    except UnidentifiedImageError:
        raise HTTPException(400, "Formato de imagen no soportado")
    except Exception as e:
        raise HTTPException(400, f"Error procesando imagen: {str(e)}")

@router.post("/identify-dish", response_model=DishIdentificationResponse)
async def identify_dish(image: UploadFile = File(...)):
    """
    Identifica platos cocinados con:
    - Todos los ingredientes detectados
    - Instrucciones de preparación
    - Receta similar (si existe)
    """
    try:
        # 1. Validar y procesar imagen
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(500, "API key de Gemini no configurada")
        
        pil_image = await validate_image_file(image)

        # 2. Prompt optimizado
        prompt = """Analiza este plato cocinado y devuelve:
        - Nombre del plato (en español)
        - Tipo (principal/entrante/postre)
        - Todos los ingredientes visibles con estado y cantidad aproximada
        - Origen cultural
        - Pasos de preparación
        - Tiempo de cocción sugerido
        - Sugerencia de presentación

        Formato JSON estricto:
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

        # 3. Llamada a Gemini con configuración optimizada
        response = model.generate_content(
            [prompt, pil_image],
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1000
            }
        )

        # 4. Procesamiento de respuesta
        dish_data = extract_json(response.text)
        
        # 5. Validación de campos
        required_fields = ["dish_name", "ingredients", "preparation", "origin"]
        for field in required_fields:
            if field not in dish_data:
                raise ValueError(f"Campo requerido faltante: {field}")

        # 6. Buscar receta similar (implementar tu lógica)
        similar_recipe_id = None
        # similar_recipe_id = find_similar_recipe(...)

        # 7. Construir respuesta
        return {
            "dish_name": dish_data["dish_name"],
            "type": dish_data.get("type", "principal"),
            "ingredients": dish_data["ingredients"],
            "origin": dish_data["origin"],
            "preparation": dish_data["preparation"],
            "cooking_time": dish_data.get("cooking_time"),
            "serving_suggestion": dish_data.get("serving_suggestion"),
            "similar_recipe_id": similar_recipe_id,
            "success": True
        }

    except HTTPException:
        raise
    except ValueError as e:
        logging.error(f"Error de validación: {str(e)}")
        raise HTTPException(400, f"Datos inválidos: {str(e)}")
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}", exc_info=True)
        raise HTTPException(500, "Error al analizar el plato")