from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from models import AnalysisResponse
from auth_utils import get_current_user
from services.supabase_service import db
from services.ai_service import analyze_dental_images
import uuid
from datetime import datetime

router = APIRouter()


@router.post("/scan", status_code=202)
async def create_scan(
    images:    List[UploadFile] = File(...),
    positions: List[str]        = Form(...),
    user=Depends(get_current_user),
):
    if not images:
        raise HTTPException(status_code=400, detail="Kamida bitta rasm kerak.")

    # Read image bytes
    image_data = []
    for img, pos in zip(images, positions):
        content = await img.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail=f"Rasm bo'sh: {img.filename}")
        image_data.append({
            "bytes":        content,
            "position":     pos,
            "filename":     img.filename,
            "content_type": img.content_type or "image/jpeg",
        })

    # Fetch user profile for personalised analysis
    profile_result = db.table("profiles").select("*").eq("user_id", user["id"]).execute()
    profile = profile_result.data[0] if profile_result.data else None

    # Run AI analysis (Claude vision with dental knowledge base)
    scan_id  = str(uuid.uuid4())
    try:
        analysis = await analyze_dental_images(image_data, profile, user["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI tahlil xatosi: {str(e)}")

    # Persist to DB
    now = datetime.utcnow().isoformat()
    db.table("scans").insert({
        "id":         scan_id,
        "user_id":    user["id"],
        "created_at": now,
    }).execute()

    result_id = str(uuid.uuid4())
    db.table("analysis_results").insert({
        "id":                result_id,
        "scan_id":           scan_id,
        "user_id":           user["id"],
        "overall_risk":      analysis["overall_risk"],
        "conditions":        analysis["conditions"],
        "findings":          analysis["findings"],
        "ai_recommendation": analysis["ai_recommendation"],
        "action_items":      analysis["action_items"],
        "needs_dentist":     analysis["needs_dentist"],
        "image_urls":        [],
        "created_at":        now,
    }).execute()

    return {
        "scan_id":         result_id,
        "status":          "completed",
        "overall_risk":    analysis["overall_risk"],
        "needs_dentist":   analysis["needs_dentist"],
        "dentist_urgency": analysis.get("dentist_urgency", "routine_checkup"),
        "image_quality":   analysis.get("image_quality", "fair"),
    }


@router.get("/{result_id}", response_model=AnalysisResponse)
async def get_analysis(result_id: str, user=Depends(get_current_user)):
    result = (
        db.table("analysis_results")
        .select("*")
        .eq("id", result_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Tahlil topilmadi.")
    row = result.data[0]

    # Inject optional fields not stored in DB
    row.setdefault("dentist_urgency", "routine_checkup")
    row.setdefault("image_quality", "fair")

    return AnalysisResponse(**row)


@router.get("", response_model=List[AnalysisResponse])
async def list_analyses(user=Depends(get_current_user)):
    result = (
        db.table("analysis_results")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    rows = result.data or []
    for r in rows:
        r.setdefault("dentist_urgency", "routine_checkup")
        r.setdefault("image_quality", "fair")
    return [AnalysisResponse(**r) for r in rows]
