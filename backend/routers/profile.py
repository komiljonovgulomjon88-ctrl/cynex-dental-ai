from fastapi import APIRouter, Depends, HTTPException
from models import ProfileCreate, ProfileResponse
from auth_utils import get_current_user
from services.supabase_service import db
import uuid
from datetime import datetime

router = APIRouter()

@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(body: ProfileCreate, user=Depends(get_current_user)):
    # Upsert — one profile per user
    existing = db.table("profiles").select("id").eq("user_id", user["id"]).execute()

    profile_data = {
        "user_id":         user["id"],
        "age":             body.age,
        "gender":          body.gender.value,
        "has_braces":      body.has_braces,
        "has_sensitivity": body.has_sensitivity,
        "brushing_habit":  body.brushing_habit,
        "dental_issues":   body.dental_issues,
        "updated_at":      datetime.utcnow().isoformat(),
    }

    if existing.data:
        result = db.table("profiles").update(profile_data).eq("user_id", user["id"]).execute()
    else:
        profile_data["id"]         = str(uuid.uuid4())
        profile_data["created_at"] = datetime.utcnow().isoformat()
        result = db.table("profiles").insert(profile_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save profile.")

    return ProfileResponse(**result.data[0])


@router.get("", response_model=ProfileResponse)
async def get_profile(user=Depends(get_current_user)):
    result = db.table("profiles").select("*").eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return ProfileResponse(**result.data[0])
