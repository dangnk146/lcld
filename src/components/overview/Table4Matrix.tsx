"use client";

import { useApp } from "@/context/AppContext";
import { getCellClass } from "@/lib/risk";

export function Table4Matrix() {
  const { lang, rowIdx, colIdx, translations } = useApp();
  const t = translations[lang];

  const rows = [
    { label: lang === "vi" ? "Thấp (Low)" : "Low", r: 0 },
    { label: lang === "vi" ? "T.Bình (Mod.)" : "Moderate", r: 1 },
    { label: lang === "vi" ? "Cao (High)" : "High", r: 2 },
    { label: lang === "vi" ? "Rất cao: Tiên phát" : "Very High: Primary", r: 3 },
    { label: lang === "vi" ? "Rất cao: Thứ phát" : "Very High: Secondary", r: 4 },
  ];

  const cells = [
    [t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleModConsiderDrugShort, "N/Aᵇ"],
    [t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleModConsiderDrugShort, t.lifestyleModConsiderDrugShort, "N/Aᵇ"],
    [t.lifestyleAdvice, t.lifestyleAdvice, t.lifestyleModConsiderDrugShort, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug],
    [t.lifestyleModDrug, t.lifestyleModDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug],
    [t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug, t.lifestyleModConcomitantDrug],
  ];

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-left border-collapse min-w-[700px] rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <th className="p-2 text-[9px] uppercase font-bold border border-white/20 w-24">
              {lang === "vi" ? "Mức nguy cơ" : "CV Risk"}
            </th>
            {["<1.4", "1.4-<1.8", "1.8-<2.6", "2.6-<3.0", "3.0-<4.9", "≥4.9"].map((h) => (
              <th key={h} className="p-3 text-[9px] font-bold border border-zinc-200 text-center">
                {h} mmol/L
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, r }) => (
            <tr key={r} className={rowIdx === r ? "bg-blue-50/30" : ""}>
              <td className="p-3 text-xs font-bold border border-zinc-200 bg-zinc-50 text-zinc-700">{label}</td>
              {cells[r].map((cell, c) => (
                <td key={c} className={getCellClass(r, c, rowIdx, colIdx)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 text-[10px] text-zinc-500 flex items-start gap-1">
        <span className="text-rose-500">*</span>
        <span>{t.naFootnote}</span>
      </div>
    </div>
  );
}
