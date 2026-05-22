"use client";

import { motion } from "framer-motion";

interface RiskGaugeProps {
  value: number; // 0–100
  size?: number;
}

export default function RiskGauge({ value, size = 80 }: RiskGaugeProps) {
  const radius = (size / 2) * 0.75;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const color =
    value >= 71 ? "#ef4444" : value >= 31 ? "#f59e0b" : "#22c55e";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={size * 0.1}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.1}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}
