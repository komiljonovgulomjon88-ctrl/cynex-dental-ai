from fastapi import APIRouter, Depends
from models import DashboardResponse, ScanSummary, HistoryPoint, Badge
from auth_utils import get_current_user
from services.supabase_service import db
from datetime import datetime, timedelta

router = APIRouter()

RISK_TO_NUM = {"low": 15, "medium": 50, "high": 85}

ALL_BADGES = [
    {"id": "first_scan", "name": "Birinchi Skan",      "emoji": "🦷", "description": "Birinchi tish skanini yakunladingiz"},
    {"id": "streak_3",   "name": "3 Kunlik Ketma-ket", "emoji": "🔥", "description": "3 kun ketma-ket skan qildingiz"},
    {"id": "streak_7",   "name": "Haftalik Qahramon",  "emoji": "⭐", "description": "7 kun ketma-ket skan qildingiz"},
    {"id": "10_scans",   "name": "Bag'ishlangan",      "emoji": "🏆", "description": "10 ta skan yakunladingiz"},
    {"id": "improved",   "name": "Yaxshilanmoqda",     "emoji": "📈", "description": "O'tgan oyga nisbatan xavf kamaydi"},
]


@router.get("", response_model=DashboardResponse)
async def get_dashboard(user=Depends(get_current_user)):
    results = (
        db.table("analysis_results")
        .select("id, overall_risk, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    scans = results.data or []

    # Recent scans (5)
    recent = [
        ScanSummary(id=s["id"], overall_risk=s["overall_risk"], created_at=s["created_at"])
        for s in scans[:5]
    ]

    # History for chart (last 10)
    history = [
        HistoryPoint(
            date=s["created_at"][:10],
            overall_risk=RISK_TO_NUM.get(s["overall_risk"], 50),
        )
        for s in reversed(scans[:10])
    ]

    # Streak calculation
    streak = 0
    if scans:
        dates = sorted({s["created_at"][:10] for s in scans}, reverse=True)
        today = datetime.utcnow().date()
        for i, d in enumerate(dates):
            expected = str(today - timedelta(days=i))
            if d == expected:
                streak += 1
            else:
                break

    # Improvement %
    improvement = None
    if len(scans) >= 2:
        latest = RISK_TO_NUM.get(scans[0]["overall_risk"], 50)
        prev   = RISK_TO_NUM.get(scans[1]["overall_risk"], 50)
        if prev > 0:
            improvement = round(((prev - latest) / prev) * 100, 1)

    # Badges
    earned: list[Badge] = []
    total = len(scans)
    if total >= 1:
        earned.append(Badge(**ALL_BADGES[0]))
    if streak >= 3:
        earned.append(Badge(**ALL_BADGES[1]))
    if streak >= 7:
        earned.append(Badge(**ALL_BADGES[2]))
    if total >= 10:
        earned.append(Badge(**ALL_BADGES[3]))
    if improvement and improvement > 0:
        earned.append(Badge(**ALL_BADGES[4]))

    return DashboardResponse(
        total_scans=total,
        streak_days=streak,
        improvement_pct=improvement,
        recent_scans=recent,
        history=history,
        badges=earned,
    )
