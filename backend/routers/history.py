from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

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
        resp = supabase.table("history") \
            .select("*, recipes(*)") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        
        recipes = []
        for item in resp.data:
            if item.get("recipes"):
                recipes.append(item["recipes"])
        
        return recipes
    except Exception:
        logger.exception("Error fetching history")
        raise HTTPException(status_code=500, detail="Unable to fetch history at this time")