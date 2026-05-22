from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models import ReminderCreate, ReminderUpdate, ReminderResponse
from auth_utils import get_current_user
from services.supabase_service import db
import uuid
from datetime import datetime

router = APIRouter()


@router.get("", response_model=List[ReminderResponse])
async def list_reminders(user=Depends(get_current_user)):
    result = (
        db.table("reminders")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at")
        .execute()
    )
    return [ReminderResponse(**r) for r in (result.data or [])]


@router.post("", response_model=ReminderResponse, status_code=201)
async def create_reminder(body: ReminderCreate, user=Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    result = db.table("reminders").insert({
        "id":         str(uuid.uuid4()),
        "user_id":    user["id"],
        "type":       body.type,
        "label":      body.label,
        "time":       body.time,
        "days":       body.days,
        "is_active":  True,
        "created_at": now,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create reminder.")
    return ReminderResponse(**result.data[0])


@router.patch("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str,
    body: ReminderUpdate,
    user=Depends(get_current_user),
):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = (
        db.table("reminders")
        .update(updates)
        .eq("id", reminder_id)
        .eq("user_id", user["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    return ReminderResponse(**result.data[0])


@router.delete("/{reminder_id}", status_code=204)
async def delete_reminder(reminder_id: str, user=Depends(get_current_user)):
    db.table("reminders").delete().eq("id", reminder_id).eq("user_id", user["id"]).execute()
