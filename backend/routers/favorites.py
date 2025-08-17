from fastapi import APIRouter
from supabase import create_client, Client
import os

router = APIRouter()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

@router.post("/{recipe_id}")
async def add_favorite(recipe_id: str, user_id: str):
    supabase.table("favorites").insert({
        "user_id": user_id,
        "recipe_id": recipe_id
    }).execute()
    return {"status": "ok"}

@router.delete("/{recipe_id}")
async def remove_favorite(recipe_id: str, user_id: str):
    supabase.table("favorites").delete().match({
        "user_id": user_id,
        "recipe_id": recipe_id
    }).execute()
    return {"status": "removed"}

@router.get("/{user_id}")
async def get_favorites(user_id: str):
    resp = supabase.rpc("get_user_favorites", {}).execute()
    return resp.data
