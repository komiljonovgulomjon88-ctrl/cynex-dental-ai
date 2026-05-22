from pydantic import BaseModel, EmailStr
from typing import List, Optional
from enum import Enum

class RiskLevel(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class Gender(str, Enum):
    male   = "male"
    female = "female"
    other  = "other"

class DentistUrgency(str, Enum):
    immediate       = "immediate"
    within_2_weeks  = "within_2_weeks"
    within_month    = "within_month"
    routine_checkup = "routine_checkup"
    not_needed      = "not_needed"

class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         dict

class ProfileCreate(BaseModel):
    age:             int
    gender:          Gender
    has_braces:      bool = False
    has_sensitivity: bool = False
    brushing_habit:  str
    dental_issues:   List[str] = []

class ProfileResponse(ProfileCreate):
    id:         str
    user_id:    str
    created_at: str

class Condition(BaseModel):
    name:       str
    risk_score: int
    risk_level: RiskLevel
    notes:      Optional[str] = None

class Finding(BaseModel):
    title:       str
    description: str
    severity:    RiskLevel
    location:    Optional[str] = None

class ActionItem(BaseModel):
    action:  str
    reason:  str
    urgency: Optional[str] = "this_week"

class AnalysisResponse(BaseModel):
    id:                str
    scan_id:           str
    user_id:           str
    overall_risk:      RiskLevel
    conditions:        List[Condition]
    findings:          List[Finding]
    ai_recommendation: str
    action_items:      List[ActionItem]
    needs_dentist:     bool
    dentist_urgency:   Optional[str] = "routine_checkup"
    image_quality:     Optional[str] = "fair"
    created_at:        str
    image_urls:        List[str] = []

class ScanSummary(BaseModel):
    id:           str
    overall_risk: RiskLevel
    created_at:   str

class HistoryPoint(BaseModel):
    date:         str
    overall_risk: float

class Badge(BaseModel):
    id:          str
    name:        str
    description: str
    emoji:       str

class DashboardResponse(BaseModel):
    total_scans:     int
    streak_days:     int
    improvement_pct: Optional[float] = None
    recent_scans:    List[ScanSummary]
    history:         List[HistoryPoint]
    badges:          List[Badge]

class ReminderCreate(BaseModel):
    type:  str
    label: str = ""
    time:  str
    days:  List[int]

class ReminderUpdate(BaseModel):
    is_active: Optional[bool]      = None
    time:      Optional[str]       = None
    days:      Optional[List[int]] = None

class ReminderResponse(ReminderCreate):
    id:         str
    user_id:    str
    is_active:  bool
    created_at: str
