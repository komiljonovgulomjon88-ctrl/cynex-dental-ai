"""
Doctor portal endpoints — multi-image clinical analysis for dental professionals.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from models import DoctorRegisterRequest, DoctorLoginRequest, TokenResponse, ClinicalAnalysisResponse
from auth_utils import hash_password, verify_password, create_access_token, decode_token
from services.supabase_service import db
from services.ai_service import analyze_clinical_images
import uuid
from datetime import datetime

router = APIRouter()
bearer_scheme = HTTPBearer()


# ── Auth helpers ──────────────────────────────────────────────────────────────

async def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    payload = decode_token(credentials.credentials)
    if payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Bu endpoint faqat vrachlar uchun.")
    doctor_id = payload.get("sub")
    if not doctor_id:
        raise HTTPException(status_code=401, detail="Token ma'lumotlari noto'g'ri.")
    return {
        "id":           doctor_id,
        "email":        payload.get("email"),
        "full_name":    payload.get("full_name"),
        "specialty":    payload.get("specialty", ""),
        "clinic_name":  payload.get("clinic_name", ""),
    }


# ── Registration & Login ──────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
async def doctor_register(body: DoctorRegisterRequest):
    """Register a new doctor account."""
    existing = db.table("doctors").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan.")

    doctor_id = str(uuid.uuid4())
    hashed = hash_password(body.password)
    now = datetime.utcnow().isoformat()

    result = db.table("doctors").insert({
        "id":              doctor_id,
        "email":           body.email,
        "full_name":       body.full_name,
        "password_hash":   hashed,
        "specialty":       body.specialty,
        "license_number":  body.license_number,
        "clinic_name":     body.clinic_name or "",
        "created_at":      now,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Vrach yaratishda xatolik.")

    token = create_access_token({
        "sub":          doctor_id,
        "email":        body.email,
        "full_name":    body.full_name,
        "role":         "doctor",
        "specialty":    body.specialty,
        "clinic_name":  body.clinic_name or "",
    })

    return TokenResponse(
        access_token=token,
        user={
            "id":           doctor_id,
            "email":        body.email,
            "full_name":    body.full_name,
            "role":         "doctor",
            "specialty":    body.specialty,
            "clinic_name":  body.clinic_name or "",
        },
    )


@router.post("/login", response_model=TokenResponse)
async def doctor_login(body: DoctorLoginRequest):
    """Authenticate a doctor and return JWT token."""
    result = db.table("doctors").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri.")

    doc = result.data[0]
    if not verify_password(body.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri.")

    token = create_access_token({
        "sub":          doc["id"],
        "email":        doc["email"],
        "full_name":    doc["full_name"],
        "role":         "doctor",
        "specialty":    doc.get("specialty", ""),
        "clinic_name":  doc.get("clinic_name", ""),
    })

    return TokenResponse(
        access_token=token,
        user={
            "id":           doc["id"],
            "email":        doc["email"],
            "full_name":    doc["full_name"],
            "role":         "doctor",
            "specialty":    doc.get("specialty", ""),
            "clinic_name":  doc.get("clinic_name", ""),
        },
    )


@router.get("/me")
async def get_doctor_me(doctor=Depends(get_current_doctor)):
    """Get current doctor profile."""
    result = db.table("doctors").select("id, email, full_name, specialty, license_number, clinic_name, created_at").eq("id", doctor["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Vrach topilmadi.")
    d = result.data[0]
    d["role"] = "doctor"
    return d


# ── Clinical Analysis ─────────────────────────────────────────────────────────

@router.post("/analyze", status_code=202)
async def clinical_analyze(
    images:      List[UploadFile] = File(...),
    image_types: List[str]        = Form(...),   # intraoral|xray_panoramic|xray_bitewing|xray_periapical|photo
    patient_age:     Optional[str] = Form(None),
    patient_gender:  Optional[str] = Form(None),
    patient_name:    Optional[str] = Form(None),
    chief_complaint: Optional[str] = Form(None),
    doctor=Depends(get_current_doctor),
):
    """
    Clinical multi-image analysis (up to 10 images).
    Accepts intraoral photos and X-ray radiographs.
    Returns deep scientific/clinical report.
    """
    if not images:
        raise HTTPException(status_code=400, detail="Kamida bitta rasm kerak.")
    if len(images) > 10:
        raise HTTPException(status_code=400, detail="Maksimal 10 ta rasm yuklash mumkin.")

    # Read image bytes
    image_data = []
    for img, img_type in zip(images, image_types):
        content = await img.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail=f"Rasm bo'sh: {img.filename}")
        image_data.append({
            "bytes":        content,
            "image_type":   img_type,
            "filename":     img.filename or "image.jpg",
            "content_type": img.content_type or "image/jpeg",
        })

    patient_info = {
        "age":             patient_age,
        "gender":          patient_gender,
        "name":            patient_name or "Bemor",
        "chief_complaint": chief_complaint,
    }

    try:
        analysis = await analyze_clinical_images(image_data, patient_info, doctor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Klinik tahlil xatosi: {str(e)}")

    # Persist to DB
    analysis_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    db.table("doctor_analyses").insert({
        "id":             analysis_id,
        "doctor_id":      doctor["id"],
        "patient_info":   patient_info,
        "image_count":    len(image_data),
        "image_types":    image_types,
        "overall_risk":   analysis["overall_risk"],
        "clinical_data":  analysis,
        "created_at":     now,
    }).execute()

    return {
        "analysis_id":  analysis_id,
        "status":       "completed",
        "overall_risk": analysis["overall_risk"],
        "created_at":   now,
        **analysis,
    }


@router.get("/reports")
async def list_doctor_reports(doctor=Depends(get_current_doctor)):
    """List all clinical analysis reports for this doctor."""
    result = (
        db.table("doctor_analyses")
        .select("id, patient_info, overall_risk, image_count, image_types, created_at")
        .eq("doctor_id", doctor["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data or []


@router.get("/reports/{analysis_id}")
async def get_doctor_report(analysis_id: str, doctor=Depends(get_current_doctor)):
    """Get a specific clinical analysis report."""
    result = (
        db.table("doctor_analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("doctor_id", doctor["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Tahlil topilmadi.")
    row = result.data[0]
    return {
        "id":           row["id"],
        "doctor_id":    row["doctor_id"],
        "patient_info": row["patient_info"],
        "image_count":  row["image_count"],
        "image_types":  row["image_types"],
        "created_at":   row["created_at"],
        **row.get("clinical_data", {}),
    }
