"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ChevronLeft, User, Calendar, Activity,
  CheckCircle2, ScanLine, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const steps = ["Shaxsiy Ma'lumot", "Tish Tarixi", "Odatlar"];

const BRUSHING_HABITS = ["Kuniga ikki marta", "Kuniga bir marta", "Ba'zida", "Kamdan-kam"];
const DENTAL_ISSUES = [
  "Kariyes / Ko'vaklar", "Milki Kasalligi", "Sezgirlik",
  "Noto'g'ri Joylashuv", "Tish Yo'qotish", "Kanal Davolash", "Yo'q"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    age: "",
    gender: "" as "male" | "female" | "other" | "",
    has_braces: false,
    has_sensitivity: false,
    brushing_habit: "",
    dental_issues: [] as string[],
  });

  const toggle = (key: "has_braces" | "has_sensitivity") =>
    setProfile((p) => ({ ...p, [key]: !p[key] }));

  const toggleIssue = (issue: string) =>
    setProfile((p) => ({
      ...p,
      dental_issues: p.dental_issues.includes(issue)
        ? p.dental_issues.filter((i) => i !== issue)
        : [...p.dental_issues, issue],
    }));

  const canNext = () => {
    if (step === 0) return profile.age && profile.gender;
    if (step === 1) return profile.dental_issues.length > 0 || true;
    return profile.brushing_habit !== "";
  };

  const handleFinish = async () => {
    if (!profile.brushing_habit) {
      toast.error("Iltimos, cho'tkalash odatini tanlang.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/profile", profile);
      setUser({ ...user!, profile: data });
      toast.success("Profil saqlandi! Tishlaringizni skanlaylik.");
      router.push("/scan");
    } catch {
      toast.error("Profilni saqlashda xatolik. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const GENDER_LABELS: Record<string, string> = {
    male: "Erkak",
    female: "Ayol",
    other: "Boshqa",
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <ScanLine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            Cynex <span className="text-gradient">Dental AI</span>
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                    ? "bg-brand-600/30 border-2 border-brand-500 text-brand-400"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all ${i < step ? "bg-brand-600" : "bg-gray-800"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-1">{steps[step]}</h2>
          <p className="text-gray-400 text-sm mb-8">
            {step === 0 && "O'zingiz haqingizda bir oz ma'lumot bering."}
            {step === 1 && "Avval bo'lgan tish muammolaringizni tanlang."}
            {step === 2 && "Tish parvarishi odatlaringizni ayting."}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Shaxsiy Ma'lumot */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label className="label flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Yosh
                    </label>
                    <input
                      className="input"
                      type="number"
                      min={1} max={120}
                      placeholder="masalan: 25"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label flex items-center gap-2">
                      <User className="w-4 h-4" /> Jins
                    </label>
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
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { key: "has_braces", label: "Breket bor" },
                        { key: "has_sensitivity", label: "Tish Sezgirligi" },
                      ] as const
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => toggle(key)}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                          profile[key]
                            ? "border-brand-500 bg-brand-900/30 text-brand-400"
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {label}
                        {profile[key] && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Tish Tarixi */}
              {step === 1 && (
                <div className="space-y-3">
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
                      {profile.dental_issues.includes(issue) && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Odatlar */}
              {step === 2 && (
                <div className="space-y-3">
                  <label className="label flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Tishlaringizni qancha tez-tez tozalaysiz?
                  </label>
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
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Orqaga
              </button>
            )}
            <button
              onClick={() => (step < steps.length - 1 ? setStep(step + 1) : handleFinish())}
              disabled={!canNext() || loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</>
              ) : step < steps.length - 1 ? (
                <>Keyingisi <ChevronRight className="w-4 h-4" /></>
              ) : (
                "Tugatish va Skanni Boshlash"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
