import axios from "axios";
import type { Doctor, DoctorRegisterData, DoctorLoginData, ClinicalAnalysis, DoctorReportSummary } from "./doctor-types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const doctorApi = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,  // 2min for large multi-image analysis
});

// Attach doctor JWT from localStorage
doctorApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cynex_doctor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-redirect to /doctor/login on 401/403
doctorApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if ((err.response?.status === 401 || err.response?.status === 403) && typeof window !== "undefined") {
      localStorage.removeItem("cynex_doctor_token");
      localStorage.removeItem("cynex_doctor");
      window.location.href = "/doctor/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function doctorRegister(data: DoctorRegisterData): Promise<{ access_token: string; user: Doctor }> {
  const res = await doctorApi.post("/doctor/register", data);
  return res.data;
}

export async function doctorLogin(data: DoctorLoginData): Promise<{ access_token: string; user: Doctor }> {
  const res = await doctorApi.post("/doctor/login", data);
  return res.data;
}

export function saveDoctorSession(token: string, doctor: Doctor) {
  localStorage.setItem("cynex_doctor_token", token);
  localStorage.setItem("cynex_doctor", JSON.stringify(doctor));
}

export function getDoctorSession(): { token: string | null; doctor: Doctor | null } {
  if (typeof window === "undefined") return { token: null, doctor: null };
  const token = localStorage.getItem("cynex_doctor_token");
  const raw = localStorage.getItem("cynex_doctor");
  const doctor = raw ? JSON.parse(raw) as Doctor : null;
  return { token, doctor };
}

export function clearDoctorSession() {
  localStorage.removeItem("cynex_doctor_token");
  localStorage.removeItem("cynex_doctor");
}

// ── Clinical Analysis ─────────────────────────────────────────────────────────

export interface AnalyzeParams {
  images: Array<{ file: File; imageType: string }>;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  chiefComplaint?: string;
}

export async function submitClinicalAnalysis(params: AnalyzeParams): Promise<ClinicalAnalysis> {
  const formData = new FormData();

  for (const item of params.images) {
    formData.append("images", item.file);
    formData.append("image_types", item.imageType);
  }
  if (params.patientName)    formData.append("patient_name", params.patientName);
  if (params.patientAge)     formData.append("patient_age", params.patientAge);
  if (params.patientGender)  formData.append("patient_gender", params.patientGender);
  if (params.chiefComplaint) formData.append("chief_complaint", params.chiefComplaint);

  const res = await doctorApi.post("/doctor/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function listDoctorReports(): Promise<DoctorReportSummary[]> {
  const res = await doctorApi.get("/doctor/reports");
  return res.data;
}

export async function getDoctorReport(id: string): Promise<ClinicalAnalysis> {
  const res = await doctorApi.get(`/doctor/reports/${id}`);
  return res.data;
}
