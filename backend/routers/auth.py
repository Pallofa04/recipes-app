from fastapi import APIRouter, Query
from services.supabase_client import supabase

router = APIRouter()

@router.get("/check-user")
def check_user(email: str = Query(..., description="Email del usuario")):
    try:
        response = supabase.auth.admin.list_users()
        user_exists = any(u["email"] == email for u in response["users"])
        return {"exists": user_exists}
    except Exception as e:
        return {"error": str(e)}
