// ── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  has_profile?: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  age: number;
  gender: "male" | "female" | "other";
  has_braces: boolean;
  has_sensitivity: boolean;
  brushing_habit: string;
  dental_issues: string[];
  created_at: string;
}

// ── Analysis ─────────────────────────────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high";

export interface Condition {
  name: string;
  risk_score: number;      // 0–100
  risk_level: RiskLevel;
  notes?: string;          // Brief clinical note
}

export interface Finding {
  title: string;
  description: string;
  severity: RiskLevel;
  location?: string;
}

export interface ActionItem {
  action: string;
  reason: string;
  urgency?: "immediate" | "this_week" | "this_month";
}

export interface AnalysisResult {
  id: string;
  scan_id: string;
  user_id: string;
  overall_risk: RiskLevel;
  conditions: Condition[];
  findings: Finding[];
  ai_recommendation: string;
  action_items: ActionItem[];
  needs_dentist: boolean;
  dentist_urgency?: string;
  image_quality?: string;
  created_at: string;
  image_urls?: string[];
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface ScanSummary {
  id: string;
  overall_risk: RiskLevel;
  created_at: string;
}

export interface HistoryPoint {
  date: string;
  overall_risk: number;   // numeric avg risk
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface DashboardData {
  total_scans: number;
  streak_days: number;
  improvement_pct: number | null;
  recent_scans: ScanSummary[];
  history: HistoryPoint[];
  badges: Badge[];
}

// ── Reminders ─────────────────────────────────────────────────────────────────
export interface Reminder {
  id: string;
  user_id: string;
  type: string;
  label: string;
  time: string;          // "HH:MM"
  days: number[];        // 0–6, Sun–Sat
  is_active: boolean;
  created_at: string;
}
