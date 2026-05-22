"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Clock, Plus, Trash2, CheckCircle2, Loader2, X
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import AppNav from "@/components/AppNav";
import type { Reminder } from "@/lib/types";

const REMINDER_TYPES = [
  { id: "brush",    label: "Tish Tozalash",     emoji: "🪥", color: "bg-blue-900/30 border-blue-800"   },
  { id: "floss",    label: "Ip Tozalash",        emoji: "🦷", color: "bg-purple-900/30 border-purple-800" },
  { id: "water",    label: "Suv Ichish",         emoji: "💧", color: "bg-cyan-900/30 border-cyan-800"   },
  { id: "dentist",  label: "Shifokor Qabuli",    emoji: "🏥", color: "bg-red-900/30 border-red-800"     },
  { id: "medicine", label: "Dori Ichish",        emoji: "💊", color: "bg-green-900/30 border-green-800" },
];

const DAYS = ["Yak", "Du", "Se", "Cha", "Pa", "Ju", "Sha"];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: "brush",
    time: "07:00",
    days: [1, 2, 3, 4, 5] as number[],
    label: "",
  });

  useEffect(() => {
    apiClient
      .get("/reminders")
      .then(({ data }) => setReminders(data))
      .catch(() => toast.error("Eslatmalarni yuklashda xatolik."))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (d: number) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d],
    }));

  const handleAdd = async () => {
    if (form.days.length === 0) {
      toast.error("Kamida bir kun tanlang.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await apiClient.post("/reminders", form);
      setReminders((prev) => [...prev, data]);
      setShowForm(false);
      toast.success("Eslatma qo'shildi!");
      setForm({ type: "brush", time: "07:00", days: [1, 2, 3, 4, 5], label: "" });
    } catch {
      toast.error("Eslatma qo'shishda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Eslatma o'chirildi.");
    } catch {
      toast.error("Eslatmani o'chirishda xatolik.");
    }
  };

  const handleToggle = async (reminder: Reminder) => {
    try {
      const { data } = await apiClient.patch(`/reminders/${reminder.id}`, {
        is_active: !reminder.is_active,
      });
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? data : r)));
    } catch {
      toast.error("Eslatmani yangilashda xatolik.");
    }
  };

  const typeInfo = (id: string) =>
    REMINDER_TYPES.find((t) => t.id === id) ?? REMINDER_TYPES[0];

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Eslatmalar</h1>
            <p className="text-gray-400 text-sm">Kunlik tish parvarishi tartibini rejalashtiring.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
          >
            <Plus className="w-4 h-4" /> Eslatma Qo'shish
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="card mb-6 border-brand-800"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold">Yangi Eslatma</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                </button>
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="label">Tur</label>
                <div className="grid grid-cols-5 gap-2">
                  {REMINDER_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setForm({ ...form, type: t.id })}
                      className={`py-2 rounded-xl border text-center transition-all ${
                        form.type === t.id
                          ? "border-brand-500 bg-brand-900/30"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <p className="text-xs text-gray-400 mt-1 leading-tight">{t.label.split(" ")[0]}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom label */}
              <div className="mb-4">
                <label className="label">Maxsus Nom (ixtiyoriy)</label>
                <input
                  className="input"
                  placeholder={`masalan: "Ertalabki cho'tkalash"`}
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>

              {/* Time */}
              <div className="mb-4">
                <label className="label flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Vaqt
                </label>
                <input
                  className="input w-fit"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>

              {/* Days */}
              <div className="mb-6">
                <label className="label">Kunlar</label>
                <div className="flex gap-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(i)}
                      className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                        form.days.includes(i)
                          ? "bg-brand-600 text-white"
                          : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                      }`}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Saqlanmoqda..." : "Eslatma Qo'shish"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminders list */}
        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse h-20 bg-gray-800/50" />
            ))}
          </div>
        ) : reminders.length === 0 ? (
          <div className="card text-center py-12">
            <Bell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">Hali eslatma yo'q.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm px-6">
              Birinchi Eslatmani Qo'shish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((r, i) => {
              const t = typeInfo(r.type);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`card flex items-center gap-4 ${!r.is_active ? "opacity-50" : ""}`}
                >
                  <div className={`w-12 h-12 ${t.color} border rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">
                      {r.label || t.label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-400 text-xs">{r.time}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-gray-400 text-xs">
                        {r.days.map((d) => DAYS[d]).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(r)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        r.is_active ? "bg-green-600/20" : "bg-gray-800"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${r.is_active ? "text-green-400" : "text-gray-600"}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center hover:bg-red-900/40 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
