"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doctorRegister, saveDoctorSession } from "@/lib/doctor-api";
import { SPECIALTIES } from "@/lib/doctor-types";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", password: "", full_name: "",
    specialty: "", license_number: "", clinic_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Parol kamida 6 belgidan iborat bo'lishi kerak."); return; }
    setLoading(true); setError("");
    try {
      const res = await doctorRegister(form);
      saveDoctorSession(res.access_token, res.user);
      router.push("/doctor/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Cynex Dental</h1>
          <p className="text-blue-300 mt-1 text-sm font-medium tracking-wide uppercase">Vrach Portali</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Vrach ro&apos;yxatdan o&apos;tish</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">To&apos;liq ism</label>
              <input type="text" required value={form.full_name} onChange={set("full_name")} className={inputClass} placeholder="Dr. Aziz Karimov" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" required value={form.email} onChange={set("email")} className={inputClass} placeholder="vrach@klinika.uz" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mutaxassislik</label>
              <select required value={form.specialty} onChange={set("specialty")} className={inputClass}>
                <option value="">Tanlang...</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Litsenziya raqami</label>
              <input type="text" required value={form.license_number} onChange={set("license_number")} className={inputClass} placeholder="STO-2024-XXXX" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Klinika nomi (ixtiyoriy)</label>
              <input type="text" value={form.clinic_name} onChange={set("clinic_name")} className={inputClass} placeholder="Smile Dental Klinikasi" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Parol</label>
              <input type="password" required value={form.password} onChange={set("password")} className={inputClass} placeholder="Kamida 6 belgi" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-blue-500/20"
            >
              {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Hisobingiz bormi?{" "}
            <Link href="/doctor/login" className="text-blue-400 hover:text-blue-300 font-medium transition">Kirish</Link>
          </p>

          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">← Bemor versiyasiga qaytish</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
