"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import Link from "next/link";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    (searchParams.get("mode") as "login" | "register") || "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "", full_name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
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
        const { data } = await apiClient.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        setToken(data.access_token);
        setUser(data.user);
        toast.success(`Xush kelibsiz, ${data.user.full_name}! 👋`);
        // If no profile yet → onboarding, else → dashboard
        router.push(data.user.has_profile ? "/dashboard" : "/onboarding");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Xatolik yuz berdi. Qayta urinib ko'ring.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl">
            <span className="text-white">Cynex</span>{" "}
            <span className="text-gradient">Dental AI</span>
          </span>
        </Link>

        <div className="card glow">
          <div className="flex bg-gray-800 rounded-xl p-1 mb-8">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-brand-600 text-white shadow" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {m === "login" ? "Kirish" : "Ro'yxatdan O'tish"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="label">To'liq Ism</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      className="input pl-10"
                      placeholder="Ism Familiya"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required={mode === "register"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label">Elektron Pochta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="siz@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  className="input pl-10 pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "register" && (
                <p className="text-xs text-gray-500 mt-1">Kamida 8 ta belgi</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</>
              ) : mode === "login" ? (
                "Kirish →"
              ) : (
                "Hisob Yaratish →"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              {mode === "login" ? "Ro'yxatdan o'ting" : "Kiring"}
            </button>
          </p>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-600 mt-6">
          🔒 Ma'lumotlaringiz xavfsiz saqlanadi
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
