from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
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


# ── Doctor Models ─────────────────────────────────────────────────────────────

class DoctorRegisterRequest(BaseModel):
    email:          EmailStr
    password:       str
    full_name:      str
    specialty:      Optional[str] = ""
    license_number: Optional[str] = ""
    clinic_name:    Optional[str] = ""

class DoctorLoginRequest(BaseModel):
    email:    EmailStr
    password: str

# ── Clinical Analysis Models ──────────────────────────────────────────────────

class ToothColorAnalysis(BaseModel):
    vita_shade:        str                     # e.g. "A2", "B3"
    bleaching_scale:   Optional[str]   = None  # e.g. "010" on Chromascop
    staining_type:     Optional[str]   = None  # extrinsic | intrinsic | none
    staining_cause:    Optional[str]   = None  # coffee, tobacco, tetracycline, fluorosis...
    whitening_potential: Optional[str] = None  # low | medium | high
    notes:             Optional[str]   = None

class ICDASScore(BaseModel):
    tooth:  str   # FDI notation, e.g. "16", "21"
    score:  int   # 0–6
    surface: Optional[str] = None  # occlusal | buccal | mesial | distal | lingual | cervical
    notes:  Optional[str]  = None

class BPEScore(BaseModel):
    sextant: str   # I–VI
    score:   int   # 0–4 (with * for furcation)
    notes:   Optional[str] = None

class TreatmentItem(BaseModel):
    priority:    str    # I=Immediate | II=Urgent | III=Routine | IV=Elective
    procedure:   str
    tooth:       Optional[str] = None
    rationale:   str
    urgency:     Optional[str] = "routine"  # immediate | urgent | routine

class RadiographicFinding(BaseModel):
    finding:   str
    location:  Optional[str] = None
    severity:  Optional[str] = None  # low | medium | high
    notes:     Optional[str] = None

class PeriodontalData(BaseModel):
    bpe_scores:           List[BPEScore]     = []
    bone_loss_visible:    bool               = False
    bone_loss_pattern:    Optional[str]      = None  # horizontal | vertical | mixed
    furcation_involvement: bool              = False
    recession_areas:      List[str]          = []
    calculus_level:       Optional[str]      = None  # none | mild | moderate | severe
    overall_severity:     Optional[str]      = None  # healthy | gingivitis | mild_periodontitis | moderate | severe

class ClinicalAnalysisResponse(BaseModel):
    overall_risk:           RiskLevel
    dmft_estimate:          Optional[str]              = None   # e.g. "D3 M0 F1"
    icdas_scores:           List[ICDASScore]            = []
    color_analysis:         Optional[ToothColorAnalysis] = None
    periodontal:            Optional[PeriodontalData]   = None
    radiographic_findings:  List[RadiographicFinding]   = []
    clinical_findings:      List[Finding]               = []
    diagnosis:              Optional[str]               = None
    differential_diagnosis: List[str]                   = []
    treatment_plan:         List[TreatmentItem]         = []
    prognosis:              Optional[str]               = None
    clinical_notes:         Optional[str]               = None
    ai_recommendation:      str
    needs_referral:         bool                        = False
    referral_type:          Optional[str]               = None  # orthodontist | periodontist | endodontist | surgeon | prosthodontist
    image_types_detected:   List[str]                   = []
    image_quality:          Optional[str]               = "good"
