"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getDoctorSession, getDoctorReport } from "@/lib/doctor-api";
import type { ClinicalAnalysis } from "@/lib/doctor-types";
import { VITA_SHADE_COLORS, ICDAS_DESCRIPTIONS, ICDAS_COLORS, BPE_COLORS } from "@/lib/doctor-types";

const RISK_CONFIG = {
  low:    { label: "Past xavf",    bg: "bg-green-500/10 border-green-500/30",  text: "text-green-400",  dot: "bg-green-400" },
  medium: { label: "O'rtacha xavf", bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
  high:   { label: "Yuqori xavf",  bg: "bg-red-500/10 border-red-500/30",     text: "text-red-400",    dot: "bg-red-400" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  I:   { label: "I — Zudlik bilan", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  II:  { label: "II — Tezkor",      color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  III: { label: "III — Oddiy",      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  IV:  { label: "IV — Ixtiyoriy",   color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${color}`}>{text}</span>;
}

export default function DoctorReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ClinicalAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token } = getDoctorSession();
    if (!token) { router.replace("/doctor/login"); return; }
    if (!id) return;
    getDoctorReport(id)
      .then(setData)
      .catch(() => router.replace("/doctor/dashboard"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      Hisobot yuklanmoqda...
    </div>
  );
  if (!data) return null;

  const riskCfg = RISK_CONFIG[data.overall_risk] ?? RISK_CONFIG.medium;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/doctor/dashboard" className="text-slate-400 hover:text-white transition text-sm">← Hisobotlar</Link>
          <p className="font-semibold text-white text-sm">Klinik Tahlil Hisoboti</p>
          <button onClick={() => window.print()} className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600">
            🖨 Chop etish
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero — Risk + Patient */}
        <div className={`p-6 rounded-2xl border ${riskCfg.bg} flex flex-col md:flex-row md:items-center gap-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2.5 h-2.5 rounded-full ${riskCfg.dot}`} />
              <span className={`font-bold text-lg ${riskCfg.text}`}>{riskCfg.label}</span>
            </div>
            {data.patient_info?.name && (
              <p className="text-white font-medium text-xl mt-1">{data.patient_info.name}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
              {data.patient_info?.age && <span>Yoshi: {data.patient_info.age}</span>}
              {data.patient_info?.gender && <span>Jinsi: {data.patient_info.gender === "male" ? "Erkak" : "Ayol"}</span>}
              {data.patient_info?.chief_complaint && <span>Shikoyat: {data.patient_info.chief_complaint}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.image_types_detected?.map((t, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{t}</span>
            ))}
            {data.image_count && <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{data.image_count} rasm</span>}
          </div>
        </div>

        {/* Diagnosis */}
        {data.diagnosis && (
          <Section title="Asosiy Tashxis" icon="📋">
            <p className="text-white font-medium">{data.diagnosis}</p>
            {data.differential_diagnosis?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Qo&apos;shimcha ko&apos;rib chiqish:</p>
                <div className="flex flex-wrap gap-2">
                  {data.differential_diagnosis.map((d, i) => (
                    <Badge key={i} text={d} color="text-slate-300 bg-slate-800 border-slate-700" />
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* DMFT + ICDAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DMFT */}
          {data.dmft_estimate && (
            <Section title="DMFT Indeksi" icon="🦷">
              <div className="grid grid-cols-4 gap-3 text-center mb-3">
                {[
                  { label: "D (Kariyes)", value: data.dmft_estimate.decayed, color: "text-red-400" },
                  { label: "M (Yo'qolgan)", value: data.dmft_estimate.missing, color: "text-orange-400" },
                  { label: "F (To'ldirilgan)", value: data.dmft_estimate.filled, color: "text-blue-400" },
                  { label: "JAMI", value: data.dmft_estimate.total, color: "text-white" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              {data.dmft_estimate.notes && <p className="text-sm text-slate-400">{data.dmft_estimate.notes}</p>}
            </Section>
          )}

          {/* Tooth Color */}
          {data.color_analysis && (
            <Section title="VITA Rang Tahlili" icon="🎨">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-xl border-2 border-white/20 flex-shrink-0 shadow-lg"
                  style={{ backgroundColor: VITA_SHADE_COLORS[data.color_analysis.vita_shade] || "#E0D3B8" }}
                />
                <div>
                  <p className="text-3xl font-bold text-white">{data.color_analysis.vita_shade}</p>
                  <p className="text-slate-400 text-sm">VITA Classical</p>
                  {data.color_analysis.bleaching_scale && (
                    <p className="text-xs text-blue-400 mt-0.5">Chromascop: {data.color_analysis.bleaching_scale}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dog&apos;lanish turi</span>
                  <Badge
                    text={data.color_analysis.staining_type}
                    color={data.color_analysis.staining_type === "none" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"}
                  />
                </div>
                {data.color_analysis.staining_cause && data.color_analysis.staining_cause !== "none" && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sabab</span>
                    <span className="text-white capitalize">{data.color_analysis.staining_cause}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Oqartirish imkoniyati</span>
                  <Badge
                    text={data.color_analysis.whitening_potential}
                    color={
                      data.color_analysis.whitening_potential === "high" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                      data.color_analysis.whitening_potential === "medium" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                      "text-red-400 bg-red-500/10 border-red-500/20"
                    }
                  />
                </div>
              </div>
              {data.color_analysis.notes && (
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">{data.color_analysis.notes}</p>
              )}
            </Section>
          )}
        </div>

        {/* ICDAS Scores */}
        {data.icdas_scores?.length > 0 && (
          <Section title="ICDAS-II Kariyes Baholash" icon="🔍">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
              {data.icdas_scores.map((s, i) => (
                <div key={i} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">Tish {s.tooth}</span>
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: ICDAS_COLORS[s.score] }}
                    >{s.score}</span>
                  </div>
                  {s.surface && <p className="text-xs text-slate-400 capitalize">{s.surface}</p>}
                  <p className="text-xs text-slate-300 mt-1 leading-tight">{ICDAS_DESCRIPTIONS[s.score] || ""}</p>
                  {s.notes && <p className="text-xs text-slate-500 mt-1 italic">{s.notes}</p>}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
              {[0,1,2,3,4,5,6].map(n => (
                <div key={n} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: ICDAS_COLORS[n] }} />
                  <span className="text-xs text-slate-400">ICDAS {n}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Periodontal */}
        {data.periodontal && (
          <Section title="Periodontal Baholash" icon="🫁">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BPE Scores */}
              {data.periodontal.bpe_scores?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase mb-3">BPE (Sextant)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {data.periodontal.bpe_scores.map((s, i) => (
                      <div key={i} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">Sext {s.sextant}</p>
                        <div
                          className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: BPE_COLORS[s.score] ?? "#6b7280" }}
                        >{s.score}</div>
                        {s.notes && <p className="text-xs text-slate-500 mt-1 leading-tight">{s.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perio summary */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-medium uppercase mb-3">Umumiy holat</p>
                {[
                  { label: "Umumiy og'irlik", value: data.periodontal.overall_severity, highlight: true },
                  { label: "Suyak yo'qolishi", value: data.periodontal.bone_loss_visible ? `Ha (${data.periodontal.bone_loss_pattern})` : "Yo'q" },
                  { label: "Furkatsiya", value: data.periodontal.furcation_involvement ? "Ha" : "Yo'q" },
                  { label: "Tartar darajasi", value: data.periodontal.calculus_level },
                ].map(row => row.value && (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="text-sm text-slate-400">{row.label}</span>
                    <span className={`text-sm capitalize ${row.highlight ? "text-white font-medium" : "text-slate-300"}`}>{String(row.value)}</span>
                  </div>
                ))}
                {data.periodontal.recession_areas?.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-400 mb-1.5">Retsessiya zonalari:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.periodontal.recession_areas.map((a, i) => (
                        <Badge key={i} text={a} color="text-orange-300 bg-orange-500/10 border-orange-500/20" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Radiographic Findings */}
        {data.radiographic_findings?.length > 0 && (
          <Section title="Rentgen Topilmalar" icon="📡">
            <div className="space-y-3">
              {data.radiographic_findings.map((f, i) => {
                const sev = { low: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", medium: "text-orange-400 border-orange-500/30 bg-orange-500/10", high: "text-red-400 border-red-500/30 bg-red-500/10" };
                return (
                  <div key={i} className="flex gap-3">
                    {f.severity && <Badge text={f.severity} color={sev[f.severity as keyof typeof sev]} />}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{f.finding}</p>
                      {f.location && <p className="text-xs text-slate-400 mt-0.5">📍 {f.location}</p>}
                      {f.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{f.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Clinical Findings */}
        {data.clinical_findings?.length > 0 && (
          <Section title="Klinik Topilmalar" icon="🔬">
            <div className="space-y-4">
              {data.clinical_findings.map((f, i) => {
                const sev = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };
                return (
                  <div key={i} className="border-l-2 pl-4" style={{ borderColor: f.severity === "high" ? "#ef4444" : f.severity === "medium" ? "#eab308" : "#22c55e" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${sev[f.severity]}`}>{f.severity}</span>
                      {f.location && <span className="text-xs text-slate-500">· {f.location}</span>}
                    </div>
                    <p className="text-white font-medium">{f.title}</p>
                    <p className="text-slate-400 text-sm mt-1">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Treatment Plan */}
        {data.treatment_plan?.length > 0 && (
          <Section title="Davolash Rejasi" icon="📝">
            <div className="space-y-3">
              {data.treatment_plan.map((t, i) => {
                const cfg = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.III;
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <Badge text={cfg.label} color={cfg.color} />
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{t.procedure}</p>
                      {t.tooth && <p className="text-xs text-blue-400 mt-0.5">Tish: {t.tooth}</p>}
                      <p className="text-xs text-slate-400 mt-1">{t.rationale}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Prognosis */}
        {data.prognosis && (
          <Section title="Prognoz" icon="📈">
            <p className="text-slate-300 leading-relaxed">{data.prognosis}</p>
          </Section>
        )}

        {/* Referral */}
        {data.needs_referral && (
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏥</span>
              <p className="font-semibold text-purple-300">Mutaxassis yo&apos;llanma tavsiya etiladi</p>
            </div>
            {data.referral_type && <p className="text-purple-200 capitalize">Mutaxassis: <strong>{data.referral_type}</strong></p>}
            {data.referral_reason && <p className="text-purple-300/80 text-sm mt-1">{data.referral_reason}</p>}
          </div>
        )}

        {/* AI Recommendation */}
        <Section title="AI Klinik Tavsiya" icon="🤖">
          <div className="prose prose-sm prose-invert max-w-none">
            {data.ai_recommendation?.split("\n\n").map((p, i) => (
              <p key={i} className={`leading-relaxed text-slate-300 ${i > 0 ? "mt-3 pt-3 border-t border-slate-800" : ""}`}>{p}</p>
            ))}
          </div>
        </Section>

        {/* Clinical Notes */}
        {data.clinical_notes && (
          <Section title="Qo'shimcha Klinik Izohlar" icon="📌">
            <p className="text-slate-300 text-sm leading-relaxed">{data.clinical_notes}</p>
          </Section>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Link href="/doctor/analyze" className="flex-1 text-center py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-semibold transition shadow-lg shadow-blue-500/20 text-white">
            + Yangi tahlil
          </Link>
          <Link href="/doctor/dashboard" className="flex-1 text-center py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-medium transition text-slate-300">
            Hisobotlar
          </Link>
        </div>
      </main>
    </div>
  );
}
