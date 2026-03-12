from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
import os

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

@router.post("/{recipe_id}")
async def add_favorite(recipe_id: str, user_id: str):
    try:
        supabase.table("favorites").insert({
            "user_id": user_id,
            "recipe_id": recipe_id
        }).execute()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding favorite: {str(e)}")

@router.delete("/{recipe_id}")
async def remove_favorite(recipe_id: str, user_id: str):
    try:
        supabase.table("favorites").delete().match({
            "user_id": user_id,
            "recipe_id": recipe_id
        }).execute()
        return {"status": "removed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing favorite: {str(e)}")

@router.get("/{user_id}")
async def get_favorites(user_id: str):
    try:
        resp = supabase.table("favorites") \
            .select("*, recipes(*)") \
            .eq("user_id", user_id) \
            .execute()

        recipes = []
        for item in resp.data:
            if item.get("recipes"):
                recipes.append(item["recipes"])
        return recipes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching favorites: {str(e)}")
