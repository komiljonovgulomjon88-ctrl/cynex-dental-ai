"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain, AlertTriangle, CheckCircle2, TrendingUp,
  MessageSquare, ChevronRight, Loader2, RotateCcw,
  Calendar, Clock, Camera, Sparkles, ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import AppNav from "@/components/AppNav";
import RiskGauge from "@/components/RiskGauge";
import type { AnalysisResult } from "@/lib/types";

const RISK_LABEL: Record<string, string> = {
  low:    "🟢 Past Xavf",
  medium: "🟡 O'rta Xavf",
  high:   "🔴 Yuqori Xavf",
};

const URGENCY_INFO: Record<string, { label: string; color: string; bg: string }> = {
  immediate:       { label: "🚨 Zudlik bilan!", color: "text-red-400",    bg: "border-red-800 bg-red-900/20"    },
  within_2_weeks:  { label: "⚠️ 2 hafta ichida", color: "text-orange-400", bg: "border-orange-800 bg-orange-900/20" },
  within_month:    { label: "📅 1 oy ichida",   color: "text-yellow-400", bg: "border-yellow-800 bg-yellow-900/20" },
  routine_checkup: { label: "✅ Oddiy tekshiruv", color: "text-green-400",  bg: "border-green-800 bg-green-900/20"  },
  not_needed:      { label: "✅ Shifokor kerak emas", color: "text-green-400", bg: "border-green-800 bg-green-900/20" },
};

const QUALITY_LABEL: Record<string, string> = {
  good: "✅ Yaxshi",
  fair: "🟡 O'rtacha",
  poor: "⚠️ Sifatsiz",
};

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"findings" | "advice" | "actions">("findings");

  useEffect(() => {
    apiClient
      .get(`/analysis/${id}`)
      .then(({ data }) => setResult(data))
      .catch(() => toast.error("Natijalarni yuklashda xatolik."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-800 border-t-brand-400 rounded-full animate-spin" />
          <Brain className="w-6 h-6 text-brand-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-gray-400 text-sm">AI tahlil qilmoqda...</p>
      </div>
    );
  }

  if (!result) return null;

  const urgencyInfo = URGENCY_INFO[result.dentist_urgency || "routine_checkup"] || URGENCY_INFO.routine_checkup;

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">🦷 Tahlil Natijalari</h1>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {new Date(result.created_at).toLocaleDateString("uz-UZ", {
                  year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
              result.overall_risk === "low"    ? "badge-low"    :
              result.overall_risk === "medium" ? "badge-medium" : "badge-high"
            }`}>
              {RISK_LABEL[result.overall_risk]}
            </div>
          </div>

          {/* Image quality & dentist urgency banners */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {result.image_quality && (
              <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2">
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-xs font-medium">
                  Rasm sifati: {QUALITY_LABEL[result.image_quality] || result.image_quality}
                </span>
              </div>
            )}
            {result.needs_dentist && (
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${urgencyInfo.bg}`}>
                <ShieldAlert className={`w-4 h-4 ${urgencyInfo.color}`} />
                <span className={`text-xs font-semibold ${urgencyInfo.color}`}>
                  Shifokor: {urgencyInfo.label}
                </span>
              </div>
            )}
          </div>

          {/* Risk gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {result.conditions.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card text-center p-4"
              >
                <RiskGauge value={c.risk_score} />
                <p className="text-white font-semibold text-xs mt-2 leading-tight">{c.name}</p>
                <p className={`text-xs mt-1 font-bold ${
                  c.risk_score >= 71 ? "text-red-400" :
                  c.risk_score >= 31 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {c.risk_score}%
                </p>
                {c.notes && (
                  <p className="text-gray-600 text-xs mt-1 leading-tight">{c.notes}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6 gap-1">
            {([
              { key: "findings", label: "Topilmalar",   icon: AlertTriangle },
              { key: "advice",   label: "AI Maslahat",  icon: Brain         },
              { key: "actions",  label: "Harakatlar",   icon: Sparkles      },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === key ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          {/* ── TAB: Topilmalar ───────────────────────────────────────────── */}
          {activeTab === "findings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {result.findings.length === 0 ? (
                <div className="card text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">Muhim muammo topilmadi</p>
                  <p className="text-gray-400 text-sm mt-1">Tishlaringiz yaxshi ko'rinishda!</p>
                </div>
              ) : (
                result.findings.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="card flex gap-4"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      f.severity === "high"   ? "bg-red-900/40"    :
                      f.severity === "medium" ? "bg-yellow-900/40" : "bg-green-900/40"
                    }`}>
                      {f.severity === "high" ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : f.severity === "medium" ? (
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-sm">{f.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          f.severity === "high"   ? "badge-high"   :
                          f.severity === "medium" ? "badge-medium" : "badge-low"
                        }`}>
                          {f.severity === "high" ? "Yuqori" : f.severity === "medium" ? "O'rta" : "Past"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                      {f.location && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                          📍 {f.location}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ── TAB: AI Maslahat ─────────────────────────────────────────────── */}
          {activeTab === "advice" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="card bg-brand-900/20 border-brand-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-brand-400 font-semibold text-sm mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Claude AI Shaxsiy Maslahat
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {result.ai_recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dentist visit card */}
              {result.needs_dentist && (
                <div className={`card flex items-center gap-4 ${urgencyInfo.bg}`}>
                  <Calendar className={`w-6 h-6 flex-shrink-0 ${urgencyInfo.color}`} />
                  <div>
                    <p className={`font-semibold text-sm ${urgencyInfo.color}`}>
                      Stomatolog Ko'rigiga Boring
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Tahlil natijalariga ko'ra: {urgencyInfo.label}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: Harakatlar ──────────────────────────────────────────────── */}
          {activeTab === "actions" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {result.action_items.map((item, i) => {
                const urgencyColors: Record<string, string> = {
                  immediate:   "border-red-700 bg-red-900/10",
                  this_week:   "border-yellow-700 bg-yellow-900/10",
                  this_month:  "border-blue-700 bg-blue-900/10",
                };
                const urgencyBadge: Record<string, string> = {
                  immediate:  "🔴 Hoziroq",
                  this_week:  "🟡 Bu hafta",
                  this_month: "🔵 Bu oy",
                };
                const cardStyle = urgencyColors[item.urgency || "this_week"] || "";

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`card flex items-start gap-3 border ${cardStyle}`}
                  >
                    <span className="w-7 h-7 bg-brand-900/50 rounded-full flex items-center justify-center text-xs text-brand-400 font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-white text-sm font-medium">{item.action}</p>
                        {item.urgency && urgencyBadge[item.urgency] && (
                          <span className="text-xs text-gray-500">
                            {urgencyBadge[item.urgency]}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{item.reason}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-10">
            <button
              onClick={() => router.push("/scan")}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Qayta Skan
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Taraqqiyotni Ko'rish
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Havola nusxalandi! 📋");
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
          >
            <MessageSquare className="w-4 h-4" /> Natijalarni Ulashish
          </button>
        </motion.div>
      </div>
    </div>
  );
}
