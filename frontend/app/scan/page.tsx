"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import {
  Camera, Upload, RefreshCw, CheckCircle2, AlertCircle,
  ChevronRight, Loader2, X, ScanLine, ZoomIn
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { useScanStore } from "@/lib/store";
import AppNav from "@/components/AppNav";
import Image from "next/image";

const SCAN_POSITIONS = [
  { id: "front", label: "Old Tishlar",  hint: "Jilmayib old tishlaringizni ko'rsating" },
  { id: "upper", label: "Yuqori Jag'",  hint: "Boshni biroz orqaga egib, og'zingizni oching" },
  { id: "lower", label: "Pastki Jag'",  hint: "Pastki jag'ni oldinga chiqaring, og'zingizni oching" },
  { id: "left",  label: "Chap Tomon",   hint: "Boshni o'ngga buring, chap tishlarni ko'rsating" },
];

type ScanMode = "upload" | "camera";

export default function ScanPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const { setCurrentScanId } = useScanStore();

  const [mode, setMode] = useState<ScanMode>("upload");
  const [images, setImages] = useState<{ position: string; file: File; preview: string }[]>([]);
  const [activePos, setActivePos] = useState(0);
  const [camReady, setCamReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Dropzone
  const onDrop = useCallback(
    (accepted: File[]) => {
      const position = SCAN_POSITIONS[activePos].id;
      const file = accepted[0];
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setImages((prev) => {
        const existing = prev.findIndex((i) => i.position === position);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { position, file, preview };
          return updated;
        }
        return [...prev, { position, file, preview }];
      });
      if (activePos < SCAN_POSITIONS.length - 1) {
        setTimeout(() => setActivePos((p) => p + 1), 400);
      }
    },
    [activePos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  const capturePhoto = () => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) return;
    fetch(shot).then((r) => r.blob()).then((blob) => {
      const file = new File([blob], `scan_${SCAN_POSITIONS[activePos].id}.jpg`, { type: "image/jpeg" });
      const preview = URL.createObjectURL(file);
      const position = SCAN_POSITIONS[activePos].id;
      setImages((prev) => {
        const ex = prev.findIndex((i) => i.position === position);
        if (ex >= 0) {
          const u = [...prev]; u[ex] = { position, file, preview }; return u;
        }
        return [...prev, { position, file, preview }];
      });
      if (activePos < SCAN_POSITIONS.length - 1)
        setTimeout(() => setActivePos((p) => p + 1), 400);
    });
  };

  const removeImage = (pos: string) => {
    setImages((prev) => prev.filter((i) => i.position !== pos));
  };

  const hasImage = (pos: string) => images.some((i) => i.position === pos);

  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast.error("Iltimos, kamida bitta tish rasmini yuklang.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append("images", img.file);
        formData.append("positions", img.position);
      });
      setUploading(false);
      setAnalyzing(true);
      const { data } = await apiClient.post("/analysis/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCurrentScanId(data.scan_id);
      toast.success("Tahlil yakunlandi!");
      router.push(`/analysis/${data.scan_id}`);
    } catch {
      toast.error("Tahlil amalga oshmadi. Qayta urinib ko'ring.");
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <AppNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">Tish Skaneri</h1>
          <p className="text-gray-400 text-sm mb-8">
            AI tahlili uchun tish rasmlaringizni yuklang yoki oling.
          </p>

          {/* Mode toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-8 w-fit gap-1">
            {(["upload", "camera"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? "bg-brand-600 text-white" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {m === "upload" ? <Upload className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {m === "upload" ? "Yuklash" : "Kamera"}
              </button>
            ))}
          </div>

          {/* Position tabs */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {SCAN_POSITIONS.map((pos, i) => (
              <button
                key={pos.id}
                onClick={() => setActivePos(i)}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  activePos === i
                    ? "border-brand-500 bg-brand-900/30 text-brand-400"
                    : hasImage(pos.id)
                    ? "border-green-700 bg-green-900/20 text-green-400"
                    : "border-gray-700 text-gray-500 hover:border-gray-600"
                }`}
              >
                {hasImage(pos.id) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                {pos.label}
              </button>
            ))}
          </div>

          {/* Active position hint */}
          <div className="bg-brand-900/20 border border-brand-800 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span className="text-sm text-brand-300">
              <span className="font-semibold">{SCAN_POSITIONS[activePos].label}:</span>{" "}
              {SCAN_POSITIONS[activePos].hint}
            </span>
          </div>

          {/* Upload zone / Camera */}
          <div className="mb-8">
            {mode === "upload" ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-brand-400 bg-brand-900/20"
                    : "border-gray-700 hover:border-gray-600 bg-gray-900/30"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 font-medium mb-1">
                  Rasmni shu yerga tashlang yoki <span className="text-brand-400">tanlash uchun bosing</span>
                </p>
                <p className="text-gray-500 text-sm">JPG, PNG, WEBP — max 10MB</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-gray-700 relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                  onUserMedia={() => setCamReady(true)}
                  className="w-full"
                />
                {camReady && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-gray-100 active:scale-90 transition-all"
                    >
                      <Camera className="w-7 h-7 text-gray-900" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image previews */}
          {images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Yuklangan Rasmlar ({images.length}/{SCAN_POSITIONS.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((img) => (
                  <div key={img.position} className="relative group rounded-xl overflow-hidden border border-gray-700">
                    <Image
                      src={img.preview}
                      alt={img.position}
                      width={160}
                      height={120}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(img.position)}
                        className="bg-red-600 rounded-full p-1.5"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                      <span className="text-xs text-white font-medium">
                        {SCAN_POSITIONS.find((p) => p.id === img.position)?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality tips */}
          <div className="card mb-8 space-y-2">
            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" /> Yaxshi Natija Uchun Maslahatlar
            </p>
            {[
              "Yaxshi yoritish ishlating — tabiiy yorug'lik eng yaxshisi",
              "Kamerani og'zingizdan 20–30 sm uzoqlikda tuting",
              "Loyqa yoki qorong'i rasmlardan saqlaning",
              "Skanerlashdan oldin pomada yoki ovqat qoldiqlarini olib tashlang",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={images.length === 0 || uploading || analyzing}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
          >
            {uploading || analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? "Yuklanmoqda..." : "AI Tahlil Qilmoqda..."}
              </>
            ) : (
              <>
                <ScanLine className="w-5 h-5" />
                Tishlarimni Tahlil Qilish
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Progress indicator */}
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 card text-center"
              >
                <div className="w-12 h-12 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6 text-brand-400 animate-spin" />
                </div>
                <p className="text-white font-medium mb-1">AI rasmlaringizni tahlil qilmoqda…</p>
                <p className="text-sm text-gray-400">Tishlarni segmentatsiya · Anomaliyalarni aniqlash · Xavf balllarini hisoblash</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
