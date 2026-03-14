from fastapi import APIRouter, Query, HTTPException
from services.supabase_client import supabase
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/check-user")
async def check_user(email: str = Query(..., description="Email del usuario")):
    try:
        response = supabase.rpc('user_exists', {'user_email': email}).execute()
        return {"exists": response.data}
    except Exception:
        logger.exception("Error checking user existence")
        raise HTTPException(status_code=500, detail="Unable to verify user at this time")
