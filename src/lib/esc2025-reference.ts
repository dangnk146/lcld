import type { Lang } from "./types";
import type { RiskAssessment } from "./types";

/** Nội dung trích từ ESC/EAS 2025 Focused Update (document.md) */

export const PAPER_CITATION =
  "Mach F. et al., 2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias. Eur Heart J 2025.";

export const TABLE3_VI: Record<RiskAssessment["riskCategory"], { title: string; criteria: string[] }> = {
  very_high: {
    title: "Rất cao (Very high risk)",
    criteria: [
      "ASCVD đã xác định (lâm sàng hoặc hình ảnh rõ ràng)",
      "ĐTĐ + tổn thương cơ quan đích, hoặc ≥3 yếu tố nguy cơ chính, hoặc T1DM khởi phát sớm >20 năm",
      "CKD nặng (eGFR <30 mL/min/1.73 m²)",
      "SCORE2/SCORE2-OP ≥20% (10 năm)",
      "FH + ASCVD hoặc + yếu tố nguy cơ chính khác",
    ],
  },
  high: {
    title: "Cao (High risk)",
    criteria: [
      "TC >8 mmol/L, LDL-C ≥4.9 mmol/L, hoặc BP ≥180/110 mmHg",
      "FH không kèm yếu tố nguy cơ chính khác",
      "ĐTĐ không tổn thương CK: thời gian ≥10 năm hoặc +1 yếu tố nguy cơ",
      "CKD trung bình (eGFR 30–59)",
      "SCORE2/SCORE2-OP ≥10% và <20%",
    ],
  },
  moderate: {
    title: "Trung bình (Moderate risk)",
    criteria: [
      "ĐTĐ trẻ (T1DM <35 tuổi; T2DM <50 tuổi), thời gian <10 năm, không yếu tố khác",
      "SCORE2/SCORE2-OP ≥2% và <10%",
    ],
  },
  low: {
    title: "Thấp (Low risk)",
    criteria: ["SCORE2/SCORE2-OP <2% (10 năm)"],
  },
};

export const LDL_GOALS_VI: Record<RiskAssessment["riskCategory"], { mmol: number; mg: number; class: string }> = {
  very_high: { mmol: 1.4, mg: 55, class: "Class I — giảm ≥50% so với baseline" },
  high: { mmol: 1.8, mg: 70, class: "Class IIa" },
  moderate: { mmol: 2.6, mg: 100, class: "Class IIa" },
  low: { mmol: 3.0, mg: 116, class: "Class IIb" },
};

export const BOX1_MODIFIERS_VI: { key: string; label: string; paper: string }[] = [
  { key: "hasPrematureFamilyHistory", label: "Tiền sử gia đình mắc CVD sớm", paper: "Nam <55 tuổi; nữ <60 tuổi (Box 1)" },
  { key: "hasSubclinicalPlaque", label: "Xơ vữa cận lâm sàng / CAC >300", paper: "Risk modifier — nâng phân tầng nếu low/moderate (Rec. Table 1)" },
  { key: "hasLpaElevated", label: "Lp(a) >50 mg/dL (>105 nmol/L)", paper: "Biomarker Box 1 — xem xét nâng phân tầng" },
  { key: "hasHiv", label: "HIV ≥40 tuổi", paper: "Rec. Table 6 — statin dự phòng tiên phát" },
  { key: "useDietarySupplements", label: "TPCN/vitamin tự phát", paper: "Rec. Table 8 — Class III, SPORT trial" },
  { key: "hasCancerToxicityRisk", label: "Ung thư — nguy cơ độc tim thuốc hóa trị", paper: "Rec. Table 7" },
];

export const LDL_COL_LABELS = [
  "<1.4 mmol/L (<55 mg/dL)",
  "1.4–<1.8 mmol/L (55–<70 mg/dL)",
  "1.8–<2.6 mmol/L (70–<100 mg/dL)",
  "2.6–<3.0 mmol/L (100–<116 mg/dL)",
  "3.0–<4.9 mmol/L (116–<190 mg/dL)",
  "≥4.9 mmol/L (≥190 mg/dL)",
];

export const ROW_LABELS_VI = [
  "Thấp (Low)",
  "Trung bình (Moderate)",
  "Cao (High)",
  "Rất cao — Tiên phát",
  "Rất cao — Thứ phát",
];

/** Chiến lược can thiệp Table 4 — đúng nội dung paper */
export const TABLE4_CELLS_VI: string[][] = [
  ["Tư vấn lối sống", "Tư vấn lối sống", "Tư vấn lối sống", "Tư vấn lối sống", "Điều chỉnh lối sống, cân nhắc thêm thuốc nếu không kiểm soát", "N/Aᵃ"],
  ["Tư vấn lối sống", "Tư vấn lối sống", "Tư vấn lối sống", "Điều chỉnh lối sống, cân nhắc thêm thuốc", "Điều chỉnh lối sống, cân nhắc thêm thuốc", "N/Aᵃ"],
  ["Tư vấn lối sống", "Tư vấn lối sống", "Điều chỉnh lối sống, cân nhắc thêm thuốc", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời"],
  ["Điều chỉnh lối sống & can thiệp thuốc đồng thời", "Điều chỉnh lối sống & can thiệp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời"],
  ["Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời", "Điều chỉnh lối sống & phối hợp thuốc đồng thời"],
];

export const TABLE4_FOOTNOTE_A =
  "Người có LDL-C chưa điều trị ≥4.9 mmol/L: nguy cơ CV tổng thể ít nhất là Cao (Table 3).";

export function getTable4Intervention(rowIdx: number, colIdx: number): string {
  return TABLE4_CELLS_VI[rowIdx]?.[colIdx] ?? "—";
}

export function getRiskCategoryLabelVi(cat: RiskAssessment["riskCategory"]): string {
  const map = { very_high: "Rất cao", high: "Cao", moderate: "Trung bình", low: "Thấp" };
  return map[cat];
}
