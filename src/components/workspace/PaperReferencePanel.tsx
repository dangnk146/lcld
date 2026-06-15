"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  BOX1_MODIFIERS_VI,
  getRiskCategoryLabelVi,
  getTable4Intervention,
  LDL_COL_LABELS,
  LDL_GOALS_VI,
  PAPER_CITATION,
  ROW_LABELS_VI,
  TABLE3_VI,
  TABLE4_FOOTNOTE_A,
} from "@/lib/esc2025-reference";
import type { PatientData } from "@/app/actions";

const CRITERION_HINTS: Record<string, string[]> = {
  ASCVD: ["ascvd", "xơ vữa"],
  "ĐTĐ": ["đái tháo", "đtđ", "diabetes", "t1dm", "t2dm"],
  CKD: ["ckd", "thận", "egfr"],
  SCORE2: ["score2"],
  FH: ["fh", "gia đình", "cholesterol máu gia đình"],
  "TC >8": ["cholesterol toàn phần", "8.0", "8 mmol"],
  "LDL-C ≥4.9": ["ldl", "4.9"],
  "180/110": ["180", "huyết áp"],
  "T1DM": ["t1dm"],
  "T2DM": ["t2dm"],
};

function matchesCriterion(reasons: string[], criterion: string): boolean {
  const reasonText = reasons.join(" ").toLowerCase();
  for (const [key, hints] of Object.entries(CRITERION_HINTS)) {
    if (criterion.includes(key) && hints.some((h) => reasonText.includes(h))) return true;
  }
  return criterion.split(" ").filter((w) => w.length > 5).some((w) => reasonText.includes(w.toLowerCase().slice(0, 6)));
}

function activeModifiers(patient: PatientData) {
  return BOX1_MODIFIERS_VI.filter((m) => {
    const val = patient[m.key as keyof PatientData];
    return val === true;
  });
}

export function PaperReferencePanel() {
  const { patient, assessment, rowIdx, colIdx } = useApp();

  const table3 = TABLE3_VI[assessment.riskCategory];
  const ldlGoal = LDL_GOALS_VI[assessment.riskCategory];
  const intervention = getTable4Intervention(rowIdx, colIdx);
  const modifiers = activeModifiers(patient);
  const ldlMmol = patient.unit === "mmol" ? patient.ldlChol : patient.ldlChol / 38.67;

  return (
    <div className="h-full">
      <div className="px-4 py-3 bg-sky-800 text-white rounded-t-xl">
        <h2 className="text-xs font-semibold">Đối chiếu ESC/EAS 2025</h2>
        <p className="text-[10px] text-sky-100 mt-0.5">document.md — Table 3, Figure 1, Table 4, Box 1</p>
      </div>
      <div className="p-4 bg-white border border-sky-100 border-t-0 rounded-b-xl space-y-4">
        {/* Table 3 */}
        <section>
          <h3 className="text-[10px] font-bold uppercase text-sky-700 mb-2">Table 3 — Phân tầng nguy cơ</h3>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
            <p className="text-xs font-bold text-orange-800">{table3.title}</p>
            <p className="text-[10px] text-orange-700 mt-1">Phân loại áp dụng: {getRiskCategoryLabelVi(assessment.riskCategory)}</p>
          </div>
          <ul className="space-y-1.5">
            {table3.criteria.map((c, i) => {
              const matched = matchesCriterion(assessment.reasons, c);
              return (
                <li key={i} className={`flex gap-2 text-[11px] leading-snug ${matched ? "text-sky-900 font-medium" : "text-slate-500"}`}>
                  {matched ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                  )}
                  {c}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 p-2 bg-sky-50 rounded-lg border border-sky-100">
            <p className="text-[10px] font-semibold text-sky-800 mb-1">Tiêu chí thỏa mãn (tính toán):</p>
            <ul className="text-[10px] text-slate-700 space-y-0.5">
              {assessment.reasons.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Figure 1 */}
        <section>
          <h3 className="text-[10px] font-bold uppercase text-sky-700 mb-2">Figure 1 — Mục tiêu LDL-C</h3>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-100">
              <p className="text-slate-500">Mục tiêu</p>
              <p className="font-bold text-sky-900">
                &lt;{ldlGoal.mmol} mmol/L (&lt;{ldlGoal.mg} mg/dL)
              </p>
            </div>
            <div className="bg-sky-50 rounded-lg p-2.5 border border-sky-100">
              <p className="text-slate-500">Khuyến nghị</p>
              <p className="font-semibold text-sky-900">{ldlGoal.class}</p>
            </div>
          </div>
        </section>

        {/* Box 1 */}
        {modifiers.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold uppercase text-sky-700 mb-2">Box 1 — Risk modifiers</h3>
            <ul className="space-y-1.5">
              {modifiers.map((m) => (
                <li key={m.key} className="text-[11px] bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                  <span className="font-semibold text-amber-900">{m.label}</span>
                  <span className="block text-[10px] text-amber-800 mt-0.5">{m.paper}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Table 4 cell */}
        <section>
          <h3 className="text-[10px] font-bold uppercase text-sky-700 mb-2">Table 4 — Ô can thiệp tương ứng</h3>
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3">
            <p className="text-[10px] text-orange-700 font-semibold">
              {ROW_LABELS_VI[rowIdx]} × {LDL_COL_LABELS[colIdx]}
            </p>
            <p className="text-sm font-bold text-orange-900 mt-1">{intervention}</p>
          </div>
          {ldlMmol >= 4.9 && (
            <p className="text-[10px] text-slate-600 mt-2 italic">ᵃ {TABLE4_FOOTNOTE_A}</p>
          )}
        </section>

        <p className="text-[9px] text-slate-400 border-t border-sky-50 pt-3">{PAPER_CITATION}</p>
      </div>
    </div>
  );
}
