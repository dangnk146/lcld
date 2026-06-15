"use client";

import { Activity, CheckCircle, Heart, Target, TrendingDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function RiskSummary() {
  const { lang, patient, assessment, currentValDisp, goalValDisp, reductionNeededPct, translations } =
    useApp();

  const riskColors = {
    very_high: "dash-card-rose",
    high: "dash-card-amber",
    moderate: "from-yellow-400 to-yellow-500",
    low: "dash-card-emerald",
  } as const;

  const riskLabel =
    assessment.riskCategory === "very_high"
      ? "RẤT CAO"
      : assessment.riskCategory === "high"
        ? "CAO"
        : assessment.riskCategory === "moderate"
          ? "TB"
          : "THẤP";

  const riskCardClass =
    assessment.riskCategory === "moderate"
      ? `bg-gradient-to-br ${riskColors.moderate} text-white rounded-2xl shadow-lg`
      : riskColors[assessment.riskCategory];

  return (
    <div className="flex gap-3 shrink-0 overflow-x-auto scrollbar-thin pb-1">
      {/* KPI 1: Risk */}
      <div className={`${riskCardClass} px-4 py-3 min-w-[160px] flex flex-col justify-between`}>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase opacity-80">
          <Heart className="w-3.5 h-3.5" />
          Nguy cơ TM
        </div>
        <p className="text-2xl font-black mt-1">{riskLabel}</p>
        <p className="text-[9px] opacity-75 mt-1">{assessment.reasons.length} tiêu chí</p>
      </div>

      {/* KPI 2: LDL target */}
      <div className="dash-card-violet px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-violet-100">
          <Target className="w-3.5 h-3.5" />
          LDL đích
        </div>
        <p className="text-2xl font-black mt-1">
          &lt;{goalValDisp}
          <span className="text-xs font-bold ml-1">{patient.unit}</span>
        </p>
        <p className="text-[9px] text-violet-100 mt-1">
          Hiện tại: {currentValDisp} {patient.unit}
        </p>
      </div>

      {/* KPI 3: SCORE2 */}
      <div className="dash-card-cyan px-4 py-3 min-w-[130px]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-cyan-100">
          <Activity className="w-3.5 h-3.5" />
          SCORE2
        </div>
        <p className="text-2xl font-black mt-1">{assessment.estimatedScore2.toFixed(1)}%</p>
        <p className="text-[9px] text-cyan-100 mt-1">10 năm</p>
      </div>

      {/* KPI 4: Reduction */}
      <div
        className={`px-4 py-3 min-w-[150px] rounded-2xl shadow-lg ${
          reductionNeededPct > 0
            ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-500/25"
            : "dash-card-emerald"
        }`}
      >
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase opacity-80">
          {reductionNeededPct > 0 ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          {translations[lang].reductionNeeded}
        </div>
        <p className="text-2xl font-black mt-1">
          {reductionNeededPct > 0 ? `-${reductionNeededPct}%` : "OK"}
        </p>
        <div className="mt-2 h-1.5 bg-white/25 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.max(10, (goalValDisp / currentValDisp) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
