"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Eye, EyeOff, Loader2, Mail, Lock, User, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { doctorLogin, doctorRegister, saveDoctorSession } from "@/lib/doctor-api";
import { SPECIALTIES } from "@/lib/doctor-types";
import Link from "next/link";

// ─── Patient Form ─────────────────────────────────────────────────────────────
function PatientForm({ defaultMode }: { defaultMode: "login" | "register" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const { data } = await apiClient.post("/auth/register", form);
        setToken(data.access_token);
        setUser(data.user);
        toast.success("Hisob yaratildi! Profilingizni sozlaylik. 🎉");
        router.push("/onboarding");
      } else {
        const { data } = await apiClient.post("/auth/login", { email: form.email, password: form.password });
        setToken(data.access_token);
        setUser(data.user);
        toast.success(`Xush kelibsiz, ${data.user.full_name}! 👋`);
        router.push(data.user.has_profile ? "/dashboard" : "/onboarding");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Login / Register toggle */}
      <div className="flex bg-gray-800 rounded-xl p-1">
        {(["login", "register"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-brand-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}>
            {m === "login" ? "Kirish" : "Ro'yxatdan O'tish"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {mode === "register" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <label className="label">To&apos;liq Ism</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input className="input pl-10" placeholder="Ism Familiya" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} required={mode === "register"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="label">Elektron Pochta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10" type="email" placeholder="siz@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="label">Parol</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10 pr-10" type={showPw ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={mode === "register" ? 8 : 1} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mode === "register" && <p className="text-xs text-gray-500 mt-1">Kamida 8 ta belgi</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</> : mode === "login" ? "Kirish →" : "Hisob Yaratish →"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}{" "}
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-brand-400 hover:text-brand-300 font-medium">
          {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
        </button>
      </p>
    </div>
  );
}

// ─── Doctor Form ──────────────────────────────────────────────────────────────
function DoctorForm({ defaultMode }: { defaultMode: "login" | "register" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", full_name: "",
    specialty: "", license_number: "", clinic_name: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await doctorRegister(form);
        saveDoctorSession(res.access_token, res.user);
        toast.success(`Xush kelibsiz, Dr. ${res.user.full_name}! 🩺`);
        router.push("/doctor/dashboard");
      } else {
        const res = await doctorLogin({ email: form.email, password: form.password });
        saveDoctorSession(res.access_token, res.user);
        toast.success(`Xush kelibsiz, Dr. ${res.user.full_name}! 🩺`);
        router.push("/doctor/dashboard");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Xatolik yuz berdi.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Login / Register toggle */}
      <div className="flex bg-gray-800 rounded-xl p-1">
        {(["login", "register"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-gray-200"}`}>
            {m === "login" ? "Kirish" : "Ro'yxatdan O'tish"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {mode === "register" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
              <div>
                <label className="label">To&apos;liq ism</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input className="input pl-10" placeholder="Dr. Ism Familiya" value={form.full_name} onChange={set("full_name")} required={mode === "register"} />
                </div>
              </div>
              <div>
                <label className="label">Mutaxassislik</label>
                <select className="input" value={form.specialty} onChange={set("specialty")} required={mode === "register"}>
                  <option value="">Tanlang...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Litsenziya</label>
                  <input className="input" placeholder="STO-2024-XXXX" value={form.license_number} onChange={set("license_number")} required={mode === "register"} />
                </div>
                <div>
                  <label className="label">Klinika (ixtiyoriy)</label>
                  <input className="input" placeholder="Klinika nomi" value={form.clinic_name} onChange={set("clinic_name")} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="label">Elektron Pochta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10" type="email" placeholder="vrach@klinika.uz" value={form.email} onChange={set("email")} required />
          </div>
        </div>

        <div>
          <label className="label">Parol</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="input pl-10 pr-10" type={showPw ? "text" : "password"} placeholder="••••••••"
              value={form.password} onChange={set("password")} required minLength={6} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</> : mode === "login" ? "🩺 Vrach Sifatida Kirish →" : "🩺 Vrach Hisob Yaratish →"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}{" "}
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-blue-400 hover:text-blue-300 font-medium">
          {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
        </button>
      </p>
    </div>
  );
}

// ─── Unified Auth Page ────────────────────────────────────────────────────────
function AuthForm() {
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "patient" | "doctor") || "patient";
  const defaultMode = (searchParams.get("mode") as "login" | "register") || "login";

  const [role, setRole] = useState<"patient" | "doctor">(defaultRole);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl">
            <span className="text-white">Cynex</span>{" "}
            <span className="text-gradient">Dental AI</span>
          </span>
        </Link>

        {/* Role Selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-semibold transition-all text-sm ${
              role === "patient"
                ? "border-brand-500 bg-brand-600/20 text-brand-300 shadow-lg shadow-brand-500/10"
                : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300"
            }`}
          >
            <span className="text-lg">🦷</span>
            <div className="text-left">
              <p className="font-bold leading-tight">Bemor</p>
              <p className="text-xs opacity-70 font-normal">Tish sog&apos;ligim uchun</p>
            </div>
          </button>

          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-semibold transition-all text-sm ${
              role === "doctor"
                ? "border-blue-500 bg-blue-600/20 text-blue-300 shadow-lg shadow-blue-500/10"
                : "border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300"
            }`}
          >
            <Stethoscope className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <p className="font-bold leading-tight">Vrach</p>
              <p className="text-xs opacity-70 font-normal">Klinik tahlil uchun</p>
            </div>
          </button>
        </div>

        {/* Form Card */}
        <div className="card glow">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, x: role === "doctor" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: role === "doctor" ? -20 : 20 }}
              transition={{ duration: 0.2 }}
            >
              {role === "patient"
                ? <PatientForm defaultMode={defaultMode} />
                : <DoctorForm defaultMode={defaultMode} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          🔒 Ma&apos;lumotlaringiz xavfsiz saqlanadi
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
