"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, ScanLine, Clock,
  ChevronRight, Award, Flame, Calendar, Plus
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import AppNav from "@/components/AppNav";
import type { DashboardData } from "@/lib/types";
import toast from "react-hot-toast";

const TREND_ICON = {
  up:   <TrendingUp   className="w-4 h-4 text-green-400" />,
  down: <TrendingDown className="w-4 h-4 text-red-400" />,
  same: <Minus        className="w-4 h-4 text-gray-400" />,
};

const RISK_UZ: Record<string, string> = {
  low:    "🟢 past",
  medium: "🟡 o'rta",
  high:   "🔴 yuqori",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard")
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Bosh sahifani yuklashda xatolik."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Xush kelibsiz, {user?.full_name?.split(" ")[0] || "foydalanuvchi"} 👋
            </h1>
            <p className="text-gray-400 text-sm">Tish sog'lig'ingiz haqida umumiy ma'lumot.</p>
          </div>
          <button
            onClick={() => router.push("/scan")}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
          >
            <Plus className="w-4 h-4" /> Yangi Skan
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse h-28 bg-gray-800/50" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Jami Skanlar",
                  value: data?.total_scans ?? 0,
                  icon: ScanLine,
                  color: "text-brand-400",
                  bg: "bg-brand-900/30",
                },
                {
                  label: "Ketma-ket Kunlar",
                  value: `${data?.streak_days ?? 0} kun`,
                  icon: Flame,
                  color: "text-orange-400",
                  bg: "bg-orange-900/30",
                },
                {
                  label: "Yaxshilanish",
                  value: data?.improvement_pct
                    ? `${data.improvement_pct > 0 ? "+" : ""}${data.improvement_pct}%`
                    : "—",
                  icon: TrendingUp,
                  color: "text-green-400",
                  bg: "bg-green-900/30",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card flex items-center gap-4"
                >
                  <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                    <p className="text-white text-xl font-bold">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            {data?.history && data.history.length > 1 && (
              <div className="card mb-8">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  Xavf Ko'rsatkichi Dinamikasi
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.history}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#f9fafb",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="overall_risk"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#riskGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Scans */}
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  So'nggi Skanlar
                </h3>
              </div>
              {data?.recent_scans?.length ? (
                <div className="space-y-3">
                  {data.recent_scans.map((scan) => (
                    <div
                      key={scan.id}
                      onClick={() => router.push(`/analysis/${scan.id}`)}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-900/40 rounded-lg flex items-center justify-center">
                          <ScanLine className="w-4 h-4 text-brand-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            Skan #{scan.id.slice(-6)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(scan.created_at).toLocaleDateString("uz-UZ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            scan.overall_risk === "low"
                              ? "badge-low"
                              : scan.overall_risk === "medium"
                              ? "badge-medium"
                              : "badge-high"
                          }`}
                        >
                          {RISK_UZ[scan.overall_risk]}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ScanLine className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Hali skan yo'q.</p>
                  <button
                    onClick={() => router.push("/scan")}
                    className="btn-primary mt-4 text-sm px-6"
                  >
                    Birinchi Skanni Boshlash
                  </button>
                </div>
              )}
            </div>

            {/* Badges */}
            {data?.badges && data.badges.length > 0 && (
              <div className="card">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  Yutuqlaringiz
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-800 rounded-xl px-3 py-2"
                    >
                      <span className="text-xl">{badge.emoji}</span>
                      <div>
                        <p className="text-yellow-400 text-xs font-semibold">{badge.name}</p>
                        <p className="text-gray-500 text-xs">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
