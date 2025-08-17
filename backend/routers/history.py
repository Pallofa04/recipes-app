from fastapi import APIRouter
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
    Get full history (recipes joined with history).
    """
    resp = supabase.rpc("get_user_history", {"uid": user_id}).execute()
    return resp.data
