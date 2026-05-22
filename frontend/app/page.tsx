"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScanLine, Brain, Bell, Trophy, TrendingUp, Shield,
  ChevronRight, Sparkles
} from "lucide-react";

const features = [
  {
    icon: ScanLine,
    title: "AI Tish Skaneri",
    desc: "Tish rasmingizni yuklang yoki oling — AI darhol tahlil qiladi.",
    color: "text-brand-400",
    bg: "bg-brand-900/30",
  },
  {
    icon: Brain,
    title: "Aqlli Tashxis",
    desc: "Kariyes, milki kasalligi, noto'g'ri joylashuv va boshqa muammolarni aniqlaydi.",
    color: "text-purple-400",
    bg: "bg-purple-900/30",
  },
  {
    icon: Shield,
    title: "Shaxsiy Tavsiya",
    desc: "AI sizning tish profilingizga asoslanib individual maslahat beradi.",
    color: "text-cyan-400",
    bg: "bg-cyan-900/30",
  },
  {
    icon: TrendingUp,
    title: "Taraqqiyotni Kuzatish",
    desc: "Tish sog'lig'ingiz yaxshilanishini vaqt o'tishi bilan grafiklarda kuzating.",
    color: "text-green-400",
    bg: "bg-green-900/30",
  },
  {
    icon: Bell,
    title: "Aqlli Eslatmalar",
    desc: "Cho'tkalash, ip tozalash va shifokor qabulini hech qachon unutmang.",
    color: "text-yellow-400",
    bg: "bg-yellow-900/30",
  },
  {
    icon: Trophy,
    title: "Bolalar O'yin Rejimi",
    desc: "Cho'tkalashni mukofotlar, nishonlar va o'yinlar orqali qiziqarli qiling 🎮",
    color: "text-orange-400",
    bg: "bg-orange-900/30",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800/60 backdrop-blur-md bg-gray-950/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Cynex</span>
            <span className="font-bold text-xl text-gradient">Dental AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth?mode=login" className="btn-secondary text-sm px-4 py-2">
              Kirish
            </Link>
            <Link href="/auth?mode=register" className="btn-primary text-sm px-4 py-2">
              Boshlash
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-800 rounded-full px-4 py-2 text-brand-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Claude AI tomonidan quvvatlangan
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Shaxsiy
            <br />
            <span className="text-gradient">Tish Sog'ligi AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tishlaringizni skanlang, muammolarni erta aniqlang va shaxsiy parvarishlash
            tavsiyalari oling — 60 soniyada, telefoningizdan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register" className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2">
              Bepul Skanni Boshlash <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-4">
              Ko'proq Ma'lumot
            </Link>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-b from-brand-900/20 to-transparent rounded-3xl border border-gray-800 p-8 glow">
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { label: "Kariyes Xavfi",     value: "82%", color: "text-red-400",    bg: "bg-red-900/30" },
                { label: "Milki Salomatligi", value: "45%", color: "text-yellow-400", bg: "bg-yellow-900/30" },
                { label: "Joylashuv",         value: "67%", color: "text-yellow-400", bg: "bg-yellow-900/30" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-2xl p-4 border border-gray-800`}>
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-gray-900/60 rounded-xl p-4 text-left border border-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-300">
                  <span className="text-brand-400 font-semibold">AI Tavsiya: </span>
                  Yuqori chap tish atrofida yuqori kariyes xavfi aniqlandi. 2 hafta ichida shifokorga boring va cho'tkalash chastotasini oshiring.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tishlaringizga kerak bo'lgan hamma narsa
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Eng zamonaviy AI bilan ishlaydigan to'liq tish salomatligi hamrohi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="card hover:border-gray-700 transition-colors group"
            >
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-brand-900/50 to-cyan-900/30 rounded-3xl border border-brand-800/50 p-12 text-center glow">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tish sog'lig'ingizni yaxshilashga tayyormisiz?
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Allaqachon minglab foydalanuvchilar Cynex AI yordamida tish sog'lig'ini yaxshilagan.
          </p>
          <Link href="/auth?mode=register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            Bepul Boshlash <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          © 2026 Cynex Dental AI. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </main>
  );
}
