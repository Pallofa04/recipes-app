from fastapi import APIRouter, Query, HTTPException
from services.supabase_client import supabase

router = APIRouter()

@router.get("/check-user")
async def check_user(email: str = Query(..., description="Email del usuario")):
    try:
        response = supabase.rpc('user_exists', {'user_email': email}).execute()
        return {"exists": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
