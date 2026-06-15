"use client";

import { useApp } from "@/context/AppContext";
import { getCellClass } from "@/lib/risk";

const LDL_HEADERS = ["<1.4", "1.4-<1.8", "1.8-<2.6", "2.6-<3.0", "3.0-<4.9", "≥4.9"];

export function Table4Matrix() {
  const { lang, rowIdx, colIdx, translations, activePatient, activeVisit, activeVisitIndex, assessment } =
    useApp();
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

  const riskLabel =
    assessment.riskCategory === "very_high"
      ? lang === "vi"
        ? "Rất cao"
        : "Very High"
      : assessment.riskCategory === "high"
        ? lang === "vi"
          ? "Cao"
          : "High"
        : assessment.riskCategory === "moderate"
          ? lang === "vi"
            ? "Trung bình"
            : "Moderate"
          : lang === "vi"
            ? "Thấp"
            : "Low";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <span className="text-slate-600 bg-white border border-sky-100 px-2.5 py-1 rounded-lg">
          {activePatient.patientName} · Giai đoạn {activeVisitIndex + 1}
        </span>
        <span className="text-slate-400">{activeVisit?.visitDate}</span>
        <span className="font-semibold text-sky-800 bg-sky-50 border border-orange-300 px-2.5 py-1 rounded-lg">
          Ô đã chọn: <span className="text-orange-600">{riskLabel}</span> × LDL{" "}
          <span className="text-orange-600">{LDL_HEADERS[colIdx]}</span> mmol/L
        </span>
      </div>

      {/* Chú thích màu nhạt */}
      <div className="flex flex-wrap gap-3 text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" /> Tư vấn lối sống
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200" /> Cân nhắc thuốc
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-rose-50 border border-rose-200" /> Phối hợp thuốc
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border-2 border-orange-400" /> Ô giao BN
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-sky-100 bg-white">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-sky-50 text-sky-900">
              <th className="p-2 text-[9px] uppercase font-semibold border border-sky-100 w-28 text-slate-600">
                {lang === "vi" ? "Mức nguy cơ" : "CV Risk"}
              </th>
              {LDL_HEADERS.map((h, c) => (
                <th
                  key={h}
                  className={`p-2.5 text-[9px] font-medium border border-sky-100 text-center text-slate-600 ${
                    colIdx === c ? "table4-col-active" : ""
                  }`}
                >
                  {h}
                  <span className="block text-[8px] font-normal text-slate-400">mmol/L</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, r }) => (
              <tr key={r}>
                <td
                  className={`p-2.5 text-[11px] font-medium border border-sky-100 ${
                    rowIdx === r ? "table4-row-active" : "bg-white text-slate-600"
                  }`}
                >
                  {label}
                </td>
                {cells[r].map((cell, c) => (
                  <td key={c} className={getCellClass(r, c, rowIdx, colIdx)}>
                    {r === rowIdx && c === colIdx && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold text-orange-500 leading-none">
                        ●
                      </span>
                    )}
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-500 flex items-start gap-1">
        <span className="text-slate-400">*</span>
        <span>{t.naFootnote}</span>
      </div>
    </div>
  );
}
