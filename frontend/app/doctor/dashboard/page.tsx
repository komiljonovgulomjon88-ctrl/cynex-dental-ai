"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDoctorSession, clearDoctorSession, listDoctorReports } from "@/lib/doctor-api";
import type { Doctor, DoctorReportSummary } from "@/lib/doctor-types";

const RISK_CONFIG = {
  low:    { label: "Past",    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30" },
  medium: { label: "O'rtacha", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  high:   { label: "Yuqori",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-Latn-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ImageTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    intraoral: "Intraoral", xray_panoramic: "OPG",
    xray_bitewing: "Bitewing", xray_periapical: "Periapical", photo: "Foto",
  };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
      {labels[type] ?? type}
    </span>
  );
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reports, setReports] = useState<DoctorReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token, doctor: d } = getDoctorSession();
    if (!token || !d) { router.replace("/doctor/login"); return; }
    setDoctor(d);
    listDoctorReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearDoctorSession();
    router.replace("/doctor/login");
  }

  if (!doctor) return null;

  const stats = {
    total: reports.length,
    high: reports.filter(r => r.overall_risk === "high").length,
    medium: reports.filter(r => r.overall_risk === "medium").length,
    low: reports.filter(r => r.overall_risk === "low").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-xl">🩺</span>
            </div>
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Vrach Portali</p>
              <p className="font-semibold text-white text-sm">{doctor.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/doctor/analyze"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <span>+</span> Yangi tahlil
            </Link>
            <button onClick={logout} className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition">
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Xush kelibsiz, Dr. {doctor.full_name.split(" ").pop()}!</h2>
          <p className="text-slate-400 mt-1">{doctor.specialty}{doctor.clinic_name ? ` · ${doctor.clinic_name}` : ""}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Jami tahlillar", value: stats.total, color: "text-blue-400" },
            { label: "Yuqori xavf", value: stats.high, color: "text-red-400" },
            { label: "O'rtacha xavf", value: stats.medium, color: "text-yellow-400" },
            { label: "Past xavf", value: stats.low, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* New Analysis CTA */}
        <Link
          href="/doctor/analyze"
          className="block mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/60 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 flex items-center justify-center text-3xl group-hover:scale-110 transition">
              🔬
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Yangi Klinik Tahlil</p>
              <p className="text-slate-400 text-sm mt-0.5">10 tagacha foto va rentgen rasmlarni yuklang · ICDAS · BPE · VITA rang · Davolash rejasi</p>
            </div>
            <div className="ml-auto text-blue-400 text-2xl group-hover:translate-x-1 transition">→</div>
          </div>
        </Link>

        {/* Reports list */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">So&apos;nggi tahlillar</h3>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Yuklanmoqda...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl text-slate-500">
              <p className="text-4xl mb-3">📋</p>
              <p>Hali hech qanday tahlil yo&apos;q</p>
              <Link href="/doctor/analyze" className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm transition">
                Birinchi tahlilni boshlash →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => {
                const cfg = RISK_CONFIG[r.overall_risk];
                return (
                  <Link
                    key={r.id}
                    href={`/doctor/reports/${r.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 transition group"
                  >
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {r.patient_info?.name || "Noma'lum bemor"}
                        {r.patient_info?.age ? `, ${r.patient_info.age} yosh` : ""}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
                        {r.patient_info?.chief_complaint || "Shikoyat ko'rsatilmagan"}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {r.image_types?.slice(0, 3).map((t, i) => <ImageTypeBadge key={i} type={t} />)}
                      {(r.image_types?.length ?? 0) > 3 && <span className="text-xs text-slate-500">+{r.image_types.length - 3}</span>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                      <p className="text-xs text-slate-500">{r.image_count} rasm</p>
                    </div>
                    <span className="text-slate-600 group-hover:text-slate-400 transition">›</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
