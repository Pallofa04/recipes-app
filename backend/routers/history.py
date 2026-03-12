from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

@router.get("/{user_id}")
async def get_user_history(user_id: str):
    """
    Get user's recipe history.
    """
    try:
        # Obtener historial con join a recipes
        resp = supabase.table("history") \
            .select("*, recipes(*)") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        
        # Transformar datos para devolver solo las recetas
        recipes = []
        for item in resp.data:
            if item.get("recipes"):
                recipes.append(item["recipes"])
        
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")