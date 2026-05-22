from fastapi import APIRouter, HTTPException, status, Depends
from models import RegisterRequest, LoginRequest, TokenResponse
from auth_utils import hash_password, verify_password, create_access_token, get_current_user
from services.supabase_service import db
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    # Check duplicate email
    existing = db.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan.")

    user_id = str(uuid.uuid4())
    hashed  = hash_password(body.password)

    result = db.table("users").insert({
        "id":            user_id,
        "email":         body.email,
        "full_name":     body.full_name,
        "password_hash": hashed,
        "created_at":    datetime.utcnow().isoformat(),
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Foydalanuvchi yaratishda xatolik.")

    token = create_access_token({
        "sub":       user_id,
        "email":     body.email,
        "full_name": body.full_name,
    })

    return TokenResponse(
        access_token=token,
        user={
            "id":          user_id,
            "email":       body.email,
            "full_name":   body.full_name,
            "has_profile": False,
        },
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    result = db.table("users").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri.")

    user = result.data[0]
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri.")

    # Check if profile exists
    profile_result = db.table("profiles").select("id").eq("user_id", user["id"]).execute()
    has_profile = bool(profile_result.data)

    token = create_access_token({
        "sub":       user["id"],
        "email":     user["email"],
        "full_name": user["full_name"],
    })

    return TokenResponse(
        access_token=token,
        user={
            "id":          user["id"],
            "email":       user["email"],
            "full_name":   user["full_name"],
            "has_profile": has_profile,
        },
    )


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    """Get current user data with profile."""
    user_result = db.table("users").select("id, email, full_name, created_at").eq("id", user["id"]).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi.")

    user_data = dict(user_result.data[0])

    profile_result = db.table("profiles").select("*").eq("user_id", user["id"]).execute()
    if profile_result.data:
        user_data["profile"]     = profile_result.data[0]
        user_data["has_profile"] = True
    else:
        user_data["profile"]     = None
        user_data["has_profile"] = False

    return user_data
