"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDoctorSession, submitClinicalAnalysis } from "@/lib/doctor-api";
import { IMAGE_TYPES } from "@/lib/doctor-types";

interface UploadItem {
  id: string;
  file: File;
  imageType: string;
  preview: string;
}

export default function DoctorAnalyzePage() {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [patientName, setPatientName]         = useState("");
  const [patientAge, setPatientAge]           = useState("");
  const [patientGender, setPatientGender]     = useState("");
  const [chiefComplaint, setChiefComplaint]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [progress, setProgress] = useState("");

  useEffect(() => {
    const { token } = getDoctorSession();
    if (!token) router.replace("/doctor/login");
  }, [router]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    const remaining = 10 - items.length;
    const toAdd = arr.slice(0, remaining);
    setItems(prev => [
      ...prev,
      ...toAdd.map(file => ({
        id: Math.random().toString(36).slice(2),
        file,
        imageType: "intraoral",
        preview: URL.createObjectURL(file),
      })),
    ]);
  }, [items.length]);

  function removeItem(id: string) {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  }

  function setType(id: string, type: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, imageType: type } : i));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleAnalyze() {
    if (items.length === 0) { setError("Kamida bitta rasm yuklang."); return; }
    setLoading(true);
    setError("");
    setProgress("Rasmlar yuborilmoqda...");

    try {
      setProgress("AI tahlil qilmoqda (1-2 daqiqa)...");
      const result = await submitClinicalAnalysis({
        images: items.map(i => ({ file: i.file, imageType: i.imageType })),
        patientName, patientAge, patientGender, chiefComplaint,
      });
      router.push(`/doctor/reports/${result.analysis_id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Tahlil xatosi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/doctor/dashboard")} className="text-slate-400 hover:text-white transition text-sm">← Orqaga</button>
          </div>
          <p className="font-semibold text-white">🔬 Klinik Tahlil</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Patient info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">👤</span> Bemor ma&apos;lumotlari
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Ismi (ixtiyoriy)</label>
                  <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className={inputClass} placeholder="Bemor ismi" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Yoshi</label>
                    <input type="number" min="1" max="120" value={patientAge} onChange={e => setPatientAge(e.target.value)} className={inputClass} placeholder="Yosh" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Jinsi</label>
                    <select value={patientGender} onChange={e => setPatientGender(e.target.value)} className={inputClass}>
                      <option value="">Tanlang</option>
                      <option value="male">Erkak</option>
                      <option value="female">Ayol</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Asosiy shikoyat</label>
                  <input type="text" value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} className={inputClass} placeholder="Masalan: Tish og'rig'i, chap tomondan" />
                </div>
              </div>
            </div>

            {/* Analysis button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || items.length === 0}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition shadow-lg shadow-blue-500/20 text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>{progress || "Tahlil qilinmoqda..."}</span>
                </>
              ) : (
                <>🔬 Klinik Tahlil Boshlash</>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            {/* Image type legend */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-3">Rasm turlari</p>
              <div className="space-y-1.5">
                {IMAGE_TYPES.map(t => (
                  <div key={t.value} className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="text-xs text-slate-300">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Image upload */}
          <div className="lg:col-span-3">
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer mb-4 ${
                dragOver ? "border-blue-400 bg-blue-500/5" : "border-slate-700 hover:border-slate-600"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)}
              />
              <div className="text-4xl mb-3">{dragOver ? "📂" : "🖼️"}</div>
              <p className="text-white font-medium">Rasmlarni bu yerga tashlang</p>
              <p className="text-slate-400 text-sm mt-1">yoki bosing · maksimal 10 ta rasm</p>
              <p className="text-slate-500 text-xs mt-2">JPEG, PNG, WEBP · Foto va rentgen rasmlar</p>
            </div>

            {/* Uploaded images */}
            {items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{items.length}/10 rasm yuklandi</p>
                  {items.length < 10 && (
                    <button
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="text-xs text-blue-400 hover:text-blue-300 transition"
                    >+ Rasm qo&apos;shish</button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.preview} alt="" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-xs flex items-center justify-center transition"
                        >×</button>
                        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900/80 text-white text-xs flex items-center justify-center font-medium">{idx + 1}</span>
                      </div>
                      <div className="p-2">
                        <select
                          value={item.imageType}
                          onChange={e => setType(item.id, e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          {IMAGE_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
