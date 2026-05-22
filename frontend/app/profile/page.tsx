"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, Shield, CheckCircle2,
  Activity, Edit3, Save, LogOut, Loader2, ScanLine,
  ChevronRight, Award
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import AppNav from "@/components/AppNav";

const BRUSHING_HABITS = ["Kuniga ikki marta", "Kuniga bir marta", "Ba'zida", "Kamdan-kam"];
const DENTAL_ISSUES = [
  "Kariyes / Ko'vaklar", "Milki Kasalligi", "Sezgirlik",
  "Noto'g'ri Joylashuv", "Tish Yo'qotish", "Kanal Davolash", "Yo'q"
];
const GENDER_LABELS: Record<string, string> = { male: "Erkak", female: "Ayol", other: "Boshqa" };

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total_scans: 0, badges: 0 });

  const [profile, setProfile] = useState({
    age: "",
    gender: "male" as "male" | "female" | "other",
    has_braces: false,
    has_sensitivity: false,
    brushing_habit: "",
    dental_issues: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      apiClient.get("/profile").catch(() => null),
      apiClient.get("/dashboard").catch(() => null),
    ]).then(([profileRes, dashRes]) => {
      if (profileRes?.data) {
        const p = profileRes.data;
        setProfile({
          age:             String(p.age || ""),
          gender:          p.gender || "male",
          has_braces:      p.has_braces || false,
          has_sensitivity: p.has_sensitivity || false,
          brushing_habit:  p.brushing_habit || "",
          dental_issues:   p.dental_issues || [],
        });
      }
      if (dashRes?.data) {
        setStats({
          total_scans: dashRes.data.total_scans || 0,
          badges:      dashRes.data.badges?.length || 0,
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const toggleIssue = (issue: string) =>
    setProfile((p) => ({
      ...p,
      dental_issues: p.dental_issues.includes(issue)
        ? p.dental_issues.filter((i) => i !== issue)
        : [...p.dental_issues, issue],
    }));

  const handleSave = async () => {
    if (!profile.age || !profile.gender || !profile.brushing_habit) {
      toast.error("Yosh, jins va cho'tkalash odatini to'ldiring.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await apiClient.post("/profile", {
        ...profile,
        age: Number(profile.age),
      });
      if (user) setUser({ ...user, profile: data });
      toast.success("Profil yangilandi! ✅");
      setEditing(false);
    } catch {
      toast.error("Saqlashda xatolik. Qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Tizimdan chiqildi.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Profilim</h1>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={editing ? "btn-primary flex items-center gap-2 text-sm px-4 py-2.5" : "btn-secondary flex items-center gap-2 text-sm px-4 py-2.5"}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</>
              ) : editing ? (
                <><Save className="w-4 h-4" /> Saqlash</>
              ) : (
                <><Edit3 className="w-4 h-4" /> Tahrirlash</>
              )}
            </button>
          </div>

          {/* Account info card */}
          <div className="card mb-6">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" /> Hisob Ma'lumotlari
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.full_name}</p>
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user?.email}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-brand-900/20 border border-brand-800 rounded-xl p-3 text-center">
                  <ScanLine className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                  <p className="text-white text-xl font-bold">{stats.total_scans}</p>
                  <p className="text-gray-400 text-xs">Jami Skanlar</p>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-3 text-center">
                  <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-white text-xl font-bold">{stats.badges}</p>
                  <p className="text-gray-400 text-xs">Mukofotlar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dental profile card */}
          <div className="card mb-6">
            <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" /> Tish Profili
            </h2>

            <div className="space-y-5">
              {/* Age */}
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Yosh
                </label>
                {editing ? (
                  <input
                    className="input"
                    type="number"
                    min={1} max={120}
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="masalan: 25"
                  />
                ) : (
                  <p className="text-gray-300 text-sm bg-gray-800/40 px-4 py-3 rounded-xl">{profile.age || "—"}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4" /> Jins
                </label>
                {editing ? (
                  <div className="grid grid-cols-3 gap-3">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setProfile({ ...profile, gender: g })}
                        className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                          profile.gender === g
                            ? "border-brand-500 bg-brand-900/30 text-brand-400"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {GENDER_LABELS[g]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm bg-gray-800/40 px-4 py-3 rounded-xl">
                    {GENDER_LABELS[profile.gender] || "—"}
                  </p>
                )}
              </div>

              {/* Braces & Sensitivity */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "has_braces" as const,      label: "Breket bor" },
                  { key: "has_sensitivity" as const,  label: "Tish Sezgirligi" },
                ]).map(({ key, label }) => (
                  editing ? (
                    <button
                      key={key}
                      onClick={() => setProfile((p) => ({ ...p, [key]: !p[key] }))}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                        profile[key]
                          ? "border-brand-500 bg-brand-900/30 text-brand-400"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {label}
                      {profile[key] && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div key={key} className="bg-gray-800/40 px-4 py-3 rounded-xl">
                      <p className="text-gray-400 text-xs mb-1">{label}</p>
                      <p className={`text-sm font-medium ${profile[key] ? "text-brand-400" : "text-gray-500"}`}>
                        {profile[key] ? "✅ Ha" : "❌ Yo'q"}
                      </p>
                    </div>
                  )
                ))}
              </div>

              {/* Brushing habit */}
              <div>
                <label className="label flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Cho'tkalash Odati
                </label>
                {editing ? (
                  <div className="space-y-2">
                    {BRUSHING_HABITS.map((h) => (
                      <button
                        key={h}
                        onClick={() => setProfile({ ...profile, brushing_habit: h })}
                        className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          profile.brushing_habit === h
                            ? "border-brand-500 bg-brand-900/30 text-brand-400"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {h}
                        {profile.brushing_habit === h && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm bg-gray-800/40 px-4 py-3 rounded-xl">
                    {profile.brushing_habit || "—"}
                  </p>
                )}
              </div>

              {/* Dental issues */}
              <div>
                <label className="label">Tish Muammolari</label>
                {editing ? (
                  <div className="space-y-2">
                    {DENTAL_ISSUES.map((issue) => (
                      <button
                        key={issue}
                        onClick={() => toggleIssue(issue)}
                        className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          profile.dental_issues.includes(issue)
                            ? "border-brand-500 bg-brand-900/30 text-brand-400"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {issue}
                        {profile.dental_issues.includes(issue) && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.dental_issues.length > 0 ? (
                      profile.dental_issues.map((issue) => (
                        <span key={issue} className="bg-brand-900/30 border border-brand-800 text-brand-400 text-xs px-3 py-1 rounded-full">
                          {issue}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Muammo ko'rsatilmagan</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="card mb-6 space-y-1">
            <button
              onClick={() => router.push("/scan")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ScanLine className="w-5 h-5 text-brand-400" />
                <span className="text-gray-300 text-sm">Yangi Skan Boshlash</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">Taraqqiyotni Ko'rish</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Tizimdan Chiqish
          </button>
        </motion.div>
      </div>
    </div>
  );
}
