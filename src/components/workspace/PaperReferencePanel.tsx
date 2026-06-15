"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  HeartPulse,
  Pill,
  Layers,
  AlertTriangle,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
import { Table4Matrix } from "@/components/workspace/Table4Matrix";

const CRITERION_HINTS: Record<string, string[]> = {
  ASCVD: ["ascvd", "xơ vữa"],
  "ĐTĐ": ["đái tháo", "đtđ", "diabetes", "t1dm", "t2dm"],
  CKD: ["ckd", "thận", "egfr"],
  SCORE2: ["score2"],
  FH: ["fh", "gia định", "cholesterol máu gia đình"],
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

function getInterventionDetail(intervention: string) {
  const normalized = intervention.toLowerCase();

  if (normalized.includes("phối hợp thuốc")) {
    return {
      title: "Phối hợp thuốc đồng thời & Thay đổi lối sống",
      type: "combination",
      icon: Layers,
      colorClass: "bg-rose-50 border-rose-200 text-rose-950",
      iconColor: "text-rose-600",
      badgeColor: "bg-rose-100 text-rose-800",
      badgeText: "Khởi trị phối hợp thuốc sớm (Combination)",
      description: "Khuyến nghị điều chỉnh lối sống tích cực kết hợp khởi trị đồng thời bằng phối hợp thuốc hạ lipid ngay từ đầu.",
      steps: [
        "Thay đổi lối sống lành mạnh (chế độ ăn tốt cho tim mạch, tăng vận động).",
        "Khởi trị đồng thời phối hợp thuốc (ví dụ: Statin hoạt lực cao + Ezetimibe) để nhanh chóng đưa LDL-C về mức mục tiêu.",
        "Đặc biệt khuyến nghị ở bệnh nhân phòng ngừa thứ phát hoặc nguy cơ rất cao."
      ]
    };
  }

  if (normalized.includes("can thiệp thuốc đồng thời")) {
    return {
      title: "Bắt đầu dùng thuốc & Thay đổi lối sống đồng thời",
      type: "simultaneous",
      icon: Pill,
      colorClass: "bg-orange-50 border-orange-200 text-orange-950",
      iconColor: "text-orange-600",
      badgeColor: "bg-orange-100 text-orange-800",
      badgeText: "Khởi trị thuốc đồng thời (Simultaneous)",
      description: "Khuyến nghị thay đổi lối sống kết hợp khởi trị bằng một loại thuốc hạ lipid (thường là Statin hoạt lực cao) ngay tại thời điểm chẩn đoán.",
      steps: [
        "Bắt đầu điều chỉnh lối sống lành mạnh.",
        "Khởi trị bằng Statin hoạt lực trung bình đến cao ngay lập tức.",
        "Đánh giá lại sau 4-6 tuần để chỉnh liều nếu chưa đạt mục tiêu."
      ]
    };
  }

  if (normalized.includes("cân nhắc thêm thuốc") || normalized.includes("cân nhắc điều trị thuốc")) {
    return {
      title: "Cân nhắc thêm thuốc nếu lối sống không đạt mục tiêu",
      type: "consider",
      icon: Shield,
      colorClass: "bg-amber-50 border-amber-200 text-amber-950",
      iconColor: "text-amber-600",
      badgeColor: "bg-amber-100 text-amber-800",
      badgeText: "Cân nhắc điều trị thuốc (Consider Drug)",
      description: "Bắt đầu bằng điều chỉnh lối sống. Cân nhắc bổ sung thuốc hạ lipid nếu LDL-C vẫn cao hơn mức mục tiêu sau thời gian theo dõi.",
      steps: [
        "Thiết lập chế độ ăn kiêng, tập luyện thể lực và kiểm soát cân nặng trong vòng 8-12 tuần.",
        "Cân nhắc kê đơn Statin nếu mức LDL-C không đạt mục tiêu khuyến nghị."
      ]
    };
  }

  if (normalized.includes("tư vấn lối sống")) {
    return {
      title: "Tư vấn lối sống đơn thuần (Lifestyle Advice Only)",
      type: "lifestyle",
      icon: HeartPulse,
      colorClass: "bg-emerald-50 border-emerald-200 text-emerald-950",
      iconColor: "text-emerald-600",
      badgeColor: "bg-emerald-100 text-emerald-800",
      badgeText: "Điều chỉnh lối sống đơn thuần",
      description: "Chỉ khuyến nghị điều chỉnh lối sống nhằm cải thiện các chỉ số tim mạch tổng thể, chưa cần can thiệp dược lý ngay.",
      steps: [
        "Tư vấn dinh dưỡng tốt cho tim mạch (giảm chất béo bão hòa, tăng cường chất xơ).",
        "Tăng cường hoạt động thể thao đều đặn ít nhất 150 phút mỗi tuần.",
        "Theo dõi định kỳ các chỉ số lipid máu."
      ]
    };
  }

  // Mặc định hoặc N/A
  return {
    title: "Không áp dụng khuyến nghị trực tiếp (N/A)",
    type: "na",
    icon: AlertTriangle,
    colorClass: "bg-slate-50 border-slate-200 text-slate-700",
    iconColor: "text-slate-500",
    badgeColor: "bg-slate-200 text-slate-600",
    badgeText: "N/A - Đánh giá chuyên sâu",
    description: "Nhóm bệnh nhân này cần được đánh giá chuyên sâu và cá thể hóa chiến lược can thiệp hạ lipid.",
    steps: [
      "Mức LDL-C chưa điều trị ≥ 4.9 mmol/L: Tự động đưa bệnh nhân vào phân tầng nguy cơ ít nhất là CAO (theo Table 3).",
      "Tiến hành làm thêm các xét nghiệm hoặc đánh giá các yếu tố nguy cơ khác."
    ]
  };
}

export function PaperReferencePanel() {
  const { patient, assessment, rowIdx, colIdx } = useApp();
  const [showMatrix, setShowMatrix] = useState(false);

  const table3 = TABLE3_VI[assessment.riskCategory];
  const ldlGoal = LDL_GOALS_VI[assessment.riskCategory];
  const intervention = getTable4Intervention(rowIdx, colIdx);
  const modifiers = activeModifiers(patient);
  const ldlMmol = patient.unit === "mmol" ? patient.ldlChol : patient.ldlChol / 38.67;

  const detail = getInterventionDetail(intervention);
  const InterventionIcon = detail.icon;

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

        {/* Bảng 4 — Chiến lược can thiệp (gộp và làm rõ ràng) */}
        <section className="border-t border-slate-100 pt-3">
          <h3 className="text-[10px] font-bold uppercase text-sky-700 mb-2">Bảng 4 — Chiến lược can thiệp đề xuất</h3>
          
          {/* Card can thiệp chi tiết */}
          <div className={`border-2 rounded-xl p-3.5 space-y-3 transition-all ${detail.colorClass}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2">
                <InterventionIcon className={`w-5 h-5 ${detail.iconColor} shrink-0 mt-0.5`} />
                <div>
                  <h4 className="text-xs font-bold leading-tight">{detail.title}</h4>
                  <p className="text-[9px] font-semibold opacity-75 mt-0.5">
                    Giao điểm: {ROW_LABELS_VI[rowIdx]} × LDL-C {LDL_COL_LABELS[colIdx]}
                  </p>
                </div>
              </div>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full shrink-0 ${detail.badgeColor}`}>
                {detail.badgeText}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed opacity-90 italic">
              &ldquo;{detail.description}&rdquo;
            </p>

            <div className="text-[11px] space-y-1.5 border-t border-black/5 pt-2">
              <span className="font-bold text-[10px] block uppercase opacity-75">Các bước xử trí đề xuất:</span>
              <ul className="space-y-1">
                {detail.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-1.5 items-start">
                    <span className="text-[9px] font-bold opacity-60 mt-0.5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {ldlMmol >= 4.9 && (
            <p className="text-[10px] text-slate-600 mt-2 italic bg-slate-50 p-2 rounded border border-slate-100">
              ᵃ <strong>Chú thích:</strong> {TABLE4_FOOTNOTE_A}
            </p>
          )}

          {/* Nút toggle để xem toàn bộ ma trận Bảng 4 */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg px-3 py-2 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {showMatrix ? "Ẩn ma trận Bảng 4 đầy đủ" : "Xem ma trận Bảng 4 đầy đủ"}
              </span>
              {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMatrix && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden animate-fadeIn">
                <p className="text-[10px] text-slate-500 font-semibold mb-2">
                  Ma trận Bảng 4 (ESC/EAS 2025):
                </p>
                <div className="max-w-full">
                  <Table4Matrix />
                </div>
              </div>
            )}
          </div>
        </section>

        <p className="text-[9px] text-slate-400 border-t border-sky-50 pt-3">{PAPER_CITATION}</p>
      </div>
    </div>
  );
}
