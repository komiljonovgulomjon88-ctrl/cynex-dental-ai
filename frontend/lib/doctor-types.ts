// ── Doctor Auth ───────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  email: string;
  full_name: string;
  specialty: string;
  clinic_name?: string;
  role: "doctor";
}

export interface DoctorRegisterData {
  email: string;
  password: string;
  full_name: string;
  specialty: string;
  license_number: string;
  clinic_name?: string;
}

export interface DoctorLoginData {
  email: string;
  password: string;
}

// ── Clinical Analysis ─────────────────────────────────────────────────────────

export const VITA_SHADES = [
  "A1","A2","A3","A3.5","A4",
  "B1","B2","B3","B4",
  "C1","C2","C3","C4",
  "D2","D3","D4",
] as const;

export type VitaShade = typeof VITA_SHADES[number];

export const VITA_SHADE_COLORS: Record<string, string> = {
  A1: "#F5F0E8", A2: "#EDE6D6", A3: "#E0D3B8", "A3.5": "#D6C9A8", A4: "#C9B990",
  B1: "#F5F2E0", B2: "#EDE8C8", B3: "#DDD8B0", B4: "#CEC898",
  C1: "#E8E4D8", C2: "#D8D4C4", C3: "#C8C4B0", C4: "#B8B4A0",
  D2: "#E0D8C8", D3: "#D0C8B4", D4: "#C0B8A0",
};

export interface ToothColorAnalysis {
  vita_shade: VitaShade;
  bleaching_scale?: string;
  staining_type: "extrinsic" | "intrinsic" | "mixed" | "none";
  staining_cause?: string;
  whitening_potential: "high" | "medium" | "low" | "not_suitable";
  notes?: string;
}

export interface ICDASScore {
  tooth: string;
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  surface?: string;
  notes?: string;
}

export interface BPEScore {
  sextant: "I" | "II" | "III" | "IV" | "V" | "VI";
  score: 0 | 1 | 2 | 3 | 4;
  notes?: string;
}

export interface PeriodontalData {
  bpe_scores: BPEScore[];
  bone_loss_visible: boolean;
  bone_loss_pattern?: "horizontal" | "vertical" | "mixed" | "none";
  furcation_involvement: boolean;
  recession_areas: string[];
  calculus_level?: "none" | "mild" | "moderate" | "severe";
  overall_severity?: string;
}

export interface TreatmentItem {
  priority: "I" | "II" | "III" | "IV";
  procedure: string;
  tooth?: string;
  rationale: string;
  urgency?: "immediate" | "urgent" | "routine" | "elective";
}

export interface RadiographicFinding {
  finding: string;
  location?: string;
  severity?: "low" | "medium" | "high";
  notes?: string;
}

export interface ClinicalFinding {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  location?: string;
}

export interface DMFTEstimate {
  decayed: number;
  missing: number;
  filled: number;
  total: number;
  notes?: string;
}

export interface ClinicalAnalysis {
  analysis_id?: string;
  overall_risk: "low" | "medium" | "high";
  image_quality: "excellent" | "good" | "fair" | "poor";
  image_types_detected: string[];
  dmft_estimate: DMFTEstimate;
  icdas_scores: ICDASScore[];
  color_analysis: ToothColorAnalysis;
  periodontal: PeriodontalData;
  radiographic_findings: RadiographicFinding[];
  clinical_findings: ClinicalFinding[];
  diagnosis?: string;
  differential_diagnosis: string[];
  treatment_plan: TreatmentItem[];
  prognosis?: string;
  clinical_notes?: string;
  needs_referral: boolean;
  referral_type?: string;
  referral_reason?: string;
  ai_recommendation: string;
  created_at?: string;
  patient_info?: {
    name?: string;
    age?: string;
    gender?: string;
    chief_complaint?: string;
  };
  image_count?: number;
}

export interface DoctorReportSummary {
  id: string;
  overall_risk: "low" | "medium" | "high";
  image_count: number;
  image_types: string[];
  created_at: string;
  patient_info?: {
    name?: string;
    age?: string;
    gender?: string;
    chief_complaint?: string;
  };
}

export const IMAGE_TYPES = [
  { value: "intraoral",       label: "Intraoral foto",           icon: "🦷" },
  { value: "xray_panoramic",  label: "Panoramik rentgen (OPG)",  icon: "🔬" },
  { value: "xray_bitewing",   label: "Bitewing rentgen",         icon: "📡" },
  { value: "xray_periapical", label: "Periapical rentgen",       icon: "🎯" },
  { value: "photo",           label: "Umumiy foto",              icon: "📷" },
] as const;

export const SPECIALTIES = [
  "Umumiy stomatolog",
  "Terapevt stomatolog",
  "Ortodont",
  "Paradontolog",
  "Stomatolog-hirurg",
  "Ortoped stomatolog",
  "Endodontist",
  "Pediatrik stomatolog",
  "Estetik stomatolog",
  "Implantolog",
] as const;

export const ICDAS_DESCRIPTIONS: Record<number, string> = {
  0: "Sog' — hech qanday o'zgarish yo'q",
  1: "Emayl dastlabki o'zgarishi — quritilganda ko'rinadi",
  2: "Yaqqol emayl o'zgarishi — nam yuzada ko'rinadi",
  3: "Emayl mikrobo'shlig'i — dentin ko'rinmaydi",
  4: "Dentin soyasi — emaydan ko'rinib turadi",
  5: "Dentin ko'ringan bo'shliq — kichik",
  6: "Keng bo'shliq — dentin ochiq",
};

export const ICDAS_COLORS: Record<number, string> = {
  0: "#22c55e",
  1: "#84cc16",
  2: "#eab308",
  3: "#f97316",
  4: "#ef4444",
  5: "#dc2626",
  6: "#991b1b",
};

export const BPE_COLORS: Record<number, string> = {
  0: "#22c55e",
  1: "#84cc16",
  2: "#eab308",
  3: "#f97316",
  4: "#ef4444",
};
