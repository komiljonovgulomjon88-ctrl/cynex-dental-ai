"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doctorLogin, saveDoctorSession } from "@/lib/doctor-api";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await doctorLogin(form);
      saveDoctorSession(res.access_token, res.user);
      router.push("/doctor/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Login muvaffaqiyatsiz. Email yoki parolni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-3xl">🩺</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Cynex Dental</h1>
          <p className="text-blue-300 mt-1 text-sm font-medium tracking-wide uppercase">Vrach Portali</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Tizimga kirish</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="vrach@klinika.uz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Parol</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition shadow-lg shadow-blue-500/20"
            >
              {loading ? "Kirish..." : "Kirish"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Hisobingiz yo&apos;qmi?{" "}
            <Link href="/doctor/register" className="text-blue-400 hover:text-blue-300 font-medium transition">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition">
              ← Bemor versiyasiga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
