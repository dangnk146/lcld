import type { PatientData } from "@/app/actions";
import type { InputSeverity, Lang, RiskAssessment } from "./types";

export function getLdlColumnIndex(patient: PatientData): number {
  const ldlVal = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
  if (ldlVal < 1.4) return 0;
  if (ldlVal < 1.8) return 1;
  if (ldlVal < 2.6) return 2;
  if (ldlVal < 3.0) return 3;
  if (ldlVal < 4.9) return 4;
  return 5;
}

export function getRowIndex(rowType: RiskAssessment["rowType"]): number {
  if (rowType === "low") return 0;
  if (rowType === "moderate") return 1;
  if (rowType === "high") return 2;
  if (rowType === "very_high_primary") return 3;
  return 4;
}

export function getLdlGoal(riskCategory: RiskAssessment["riskCategory"]): number {
  if (riskCategory === "very_high") return 1.4;
  if (riskCategory === "high") return 1.8;
  if (riskCategory === "moderate") return 2.6;
  return 3.0;
}

export function calculateRisk(patient: PatientData, lang: Lang): RiskAssessment {
  const reasons: string[] = [];
  let riskCategory: RiskAssessment["riskCategory"] = "low";
  let rowType: RiskAssessment["rowType"] = "low";

  const ldlMmol = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
  const tcMmol = patient.unit === "mg" ? patient.totalChol / 38.67 : patient.totalChol;
  const nonHdl = patient.totalChol - patient.hdlChol;
  const nonHdlMmol = patient.unit === "mg" ? nonHdl / 38.67 : nonHdl;

  const ageFactor = (patient.age - 60) * 0.07;
  const sbpFactor = (patient.sbp - 120) * 0.025;
  const cholFactor = (nonHdlMmol - 3.0) * 0.28;
  const smokeFactor = patient.smokingStatus ? 0.65 : 0;
  const sexFactor = patient.sex === "female" ? -0.45 : 0;
  const regionFactor =
    patient.riskRegion === "low"
      ? -0.6
      : patient.riskRegion === "moderate"
        ? 0
        : patient.riskRegion === "high"
          ? 0.45
          : 0.9;

  const baseLogit = -2.6 + ageFactor + sbpFactor + cholFactor + smokeFactor + sexFactor + regionFactor;
  let estimatedScore2 = 100 / (1 + Math.exp(-baseLogit));
  estimatedScore2 = Math.min(Math.max(estimatedScore2, 0.5), 50.0);

  const hasExtremeLdl = ldlMmol >= 4.9;

  if (patient.hasAscvd) {
    riskCategory = "very_high";
    rowType = "very_high_secondary";
    reasons.push(
      lang === "vi"
        ? "Đã xác định Bệnh tim mạch do xơ vữa (Documented ASCVD) - Bắt buộc phòng ngừa thứ phát"
        : "Documented Atherosclerotic Cardiovascular Disease (ASCVD) - Secondary Prevention"
    );
  } else {
    let isVeryHigh = false;

    if (
      patient.diabetes !== "none" &&
      (patient.dmTargetOrganDamage || patient.dmDuration > 20 || patient.dmRiskFactorsCount >= 3)
    ) {
      isVeryHigh = true;
      reasons.push(
        lang === "vi"
          ? "Đái tháo đường (DM) đi kèm tổn thương cơ quan đích, thời gian mắc >20 năm, hoặc có >=3 yếu tố nguy cơ chính"
          : "Diabetes Mellitus with target organ damage, duration >20 years, or >=3 major risk factors"
      );
    }
    if (patient.ckd === "severe") {
      isVeryHigh = true;
      reasons.push(
        lang === "vi"
          ? "Bệnh thận mạn nặng (Severe CKD: eGFR < 30 mL/min/1.73 m²)"
          : "Severe Chronic Kidney Disease (CKD: eGFR < 30 mL/min/1.73 m²)"
      );
    }
    if (patient.hasFh && patient.fhHasMajorRiskFactor) {
      isVeryHigh = true;
      reasons.push(
        lang === "vi"
          ? "Tăng cholesterol máu gia đình (FH) kèm bệnh lý xơ vữa hoặc kèm yếu tố nguy cơ chính khác"
          : "Familial Hypercholesterolaemia (FH) with ASCVD or another major risk factor"
      );
    }
    if (estimatedScore2 >= 20.0) {
      isVeryHigh = true;
      reasons.push(
        lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm cực cao: ${estimatedScore2.toFixed(1)}% (>= 20%)`
          : `Extremely high calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (>= 20%)`
      );
    }

    if (isVeryHigh) {
      riskCategory = "very_high";
      rowType = "very_high_primary";
    }
  }

  if (riskCategory !== "very_high") {
    let isHigh = false;

    if (tcMmol > 8.0) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? `Cholesterol toàn phần tăng cực mạnh: ${patient.totalChol} ${patient.unit} (> 8.0 mmol/L / 310 mg/dL)`
          : "Markedly elevated single risk factor: Total Cholesterol > 8.0 mmol/L / 310 mg/dL"
      );
    }
    if (hasExtremeLdl) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? `LDL Cholesterol tăng cực cao (Chưa điều trị): ${patient.ldlChol} ${patient.unit} (>= 4.9 mmol/L / 190 mg/dL)`
          : "Markedly elevated single risk factor: Untreated LDL-C >= 4.9 mmol/L / 190 mg/dL"
      );
    }
    if (patient.sbp >= 180 || patient.dbp >= 110) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? `Huyết áp tăng độ 3 rất nặng: ${patient.sbp}/${patient.dbp} mmHg (>= 180/110 mmHg)`
          : "Markedly elevated single risk factor: Severe Blood Pressure >= 180/110 mmHg"
      );
    }
    if (patient.hasFh && !patient.fhHasMajorRiskFactor) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? "Tăng cholesterol máu gia đình (FH) đơn thuần không đi kèm yếu tố nguy cơ khác"
          : "Familial Hypercholesterolaemia (FH) without other major risk factors"
      );
    }
    if (patient.diabetes !== "none" && (patient.dmDuration >= 10 || patient.dmRiskFactorsCount >= 1)) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? "Đái tháo đường không tổn thương cơ quan đích nhưng có thời gian mắc >=10 năm hoặc có 1 yếu tố nguy cơ kèm theo"
          : "Diabetes Mellitus without organ damage but duration >=10 years or with 1 major risk factor"
      );
    }
    if (patient.ckd === "moderate") {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? "Bệnh thận mạn mức độ trung bình (Moderate CKD: eGFR 30-59 mL/min/1.73 m²)"
          : "Moderate Chronic Kidney Disease (CKD: eGFR 30-59 mL/min/1.73 m²)"
      );
    }
    if (estimatedScore2 >= 10.0 && estimatedScore2 < 20.0) {
      isHigh = true;
      reasons.push(
        lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm cao: ${estimatedScore2.toFixed(1)}% (10% - <20%)`
          : `High calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (10% - <20%)`
      );
    }

    if (isHigh) {
      riskCategory = "high";
      rowType = "high";
    }
  }

  if (riskCategory !== "very_high" && riskCategory !== "high") {
    let isModerate = false;

    if (patient.diabetes !== "none") {
      if (patient.diabetes === "t1dm" && patient.age < 35 && patient.dmDuration < 10) {
        isModerate = true;
        reasons.push(
          lang === "vi"
            ? "Bệnh nhân ĐTĐ T1DM trẻ tuổi (< 35 tuổi), thời gian mắc bệnh ngắn < 10 năm"
            : "Young patient with T1DM (< 35 years) and duration < 10 years"
        );
      } else if (patient.diabetes === "t2dm" && patient.age < 50 && patient.dmDuration < 10) {
        isModerate = true;
        reasons.push(
          lang === "vi"
            ? "Bệnh nhân ĐTĐ T2DM trẻ tuổi (< 50 tuổi), thời gian mắc bệnh ngắn < 10 năm"
            : "Young patient with T2DM (< 50 years) and duration < 10 years"
        );
      }
    }

    if (estimatedScore2 >= 2.0 && estimatedScore2 < 10.0) {
      isModerate = true;
      reasons.push(
        lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm ở mức trung bình: ${estimatedScore2.toFixed(1)}% (2% - <10%)`
          : `Moderate calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (2% - <10%)`
      );
    }

    if (isModerate) {
      riskCategory = "moderate";
      rowType = "moderate";
    }
  }

  if (riskCategory === "low") {
    rowType = "low";
    reasons.push(
      lang === "vi"
        ? `Điểm SCORE2/SCORE2-OP 10 năm thấp: ${estimatedScore2.toFixed(1)}% (< 2%) và không có bệnh lý đi kèm đặc biệt`
        : `Low calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (< 2%) without pre-existing conditions`
    );
  }

  const hasModifiers =
    patient.hasLpaElevated || patient.hasSubclinicalPlaque || patient.hasPrematureFamilyHistory;
  if (hasModifiers && (riskCategory === "low" || riskCategory === "moderate")) {
    const modifierLabels: string[] = [];
    if (patient.hasLpaElevated) modifierLabels.push("Lipoprotein(a) > 50 mg/dL");
    if (patient.hasSubclinicalPlaque)
      modifierLabels.push(lang === "vi" ? "Mảng xơ vữa cận lâm sàng" : "Subclinical plaque");
    if (patient.hasPrematureFamilyHistory)
      modifierLabels.push(lang === "vi" ? "Tiền sử gia đình mắc bệnh sớm" : "Premature family history");

    reasons.push(
      lang === "vi"
        ? `* Yếu tố bổ trợ hiện diện (${modifierLabels.join(", ")}): Khuyến nghị xem xét nâng phân tầng điều trị.`
        : `* Risk modifiers present (${modifierLabels.join(", ")}): Consider reclassifying to higher treatment intensity.`
    );
  }

  return { riskCategory, reasons, rowType, estimatedScore2 };
}

export function getInputSeverity(
  type: "totalChol" | "hdlChol" | "ldlChol" | "triglycerides" | "sbp" | "dbp",
  val: number,
  patient: PatientData,
  lang: Lang
): InputSeverity {
  const isMmol = patient.unit === "mmol";
  const valMmol = isMmol ? val : val / 38.67;
  const valMmolTg = isMmol ? val : val / 88.57;

  let severity: InputSeverity["severity"] = "safe";
  let text = "";

  if (type === "totalChol") {
    if (valMmol < 5.0) {
      severity = "safe";
      text =
        lang === "vi"
          ? "Bình thường (< 5.0 mmol/L | < 193 mg/dL)."
          : "Normal (< 5.0 mmol/L | < 193 mg/dL).";
    } else if (valMmol < 8.0) {
      severity = "warning";
      text =
        lang === "vi"
          ? "Tăng nhẹ đến trung bình (5.0 - 7.9 mmol/L)."
          : "Borderline High (5.0 - 7.9 mmol/L).";
    } else {
      severity = "danger";
      text =
        lang === "vi"
          ? "Tăng cực cao (≥ 8.0 mmol/L). Gợi ý FH!"
          : "Extremely High (≥ 8.0 mmol/L). Suggests FH!";
    }
  } else if (type === "hdlChol") {
    const lowThreshold = patient.sex === "male" ? 1.0 : 1.2;
    if (valMmol < lowThreshold) {
      severity = "danger";
      text =
        lang === "vi"
          ? `HDL-C thấp nguy hại (< ${lowThreshold} mmol/L).`
          : `Low HDL-C (< ${lowThreshold} mmol/L).`;
    } else {
      severity = "safe";
      text =
        lang === "vi"
          ? `HDL-C tối ưu (≥ ${lowThreshold} mmol/L).`
          : `Optimal HDL-C (≥ ${lowThreshold} mmol/L).`;
    }
  } else if (type === "ldlChol") {
    if (valMmol < 1.4) {
      severity = "safe";
      text = lang === "vi" ? "LDL-C lý tưởng (< 1.4 mmol/L)." : "Optimal LDL-C (< 1.4 mmol/L).";
    } else if (valMmol < 1.8) {
      severity = "safe";
      text = lang === "vi" ? "LDL-C thấp (1.4 - 1.7 mmol/L)." : "Low LDL-C (1.4 - 1.7 mmol/L).";
    } else if (valMmol < 3.0) {
      severity = "warning";
      text =
        lang === "vi"
          ? "LDL-C trung bình (1.8 - 2.9 mmol/L)."
          : "Moderate LDL-C (1.8 - 2.9 mmol/L).";
    } else if (valMmol < 4.9) {
      severity = "warning";
      text = lang === "vi" ? "LDL-C cao (3.0 - 4.8 mmol/L)." : "High LDL-C (3.0 - 4.8 mmol/L).";
    } else {
      severity = "danger";
      text =
        lang === "vi"
          ? "Tăng cực độ (≥ 4.9 mmol/L). Tự động xếp nhóm CAO theo Bảng 3!"
          : "Extremely High (≥ 4.9 mmol/L). Elevates to HIGH risk per Table 3!";
    }
  } else if (type === "triglycerides") {
    if (valMmolTg < 1.7) {
      severity = "safe";
      text = lang === "vi" ? "Triglycerides bình thường." : "Normal Triglycerides.";
    } else if (valMmolTg < 5.0) {
      severity = "warning";
      text = lang === "vi" ? "Tăng Triglycerides (1.7 - 4.9 mmol/L)." : "Elevated Triglycerides.";
    } else {
      severity = "danger";
      text =
        lang === "vi"
          ? "Tăng Triglycerides cực độ (≥ 5.0 mmol/L)."
          : "Extremely High Triglycerides (≥ 5.0 mmol/L).";
    }
  } else if (type === "sbp") {
    if (val < 120) {
      severity = "safe";
      text = lang === "vi" ? "Huyết áp tối ưu (< 120 mmHg)." : "Optimal SBP (< 120 mmHg).";
    } else if (val < 140) {
      severity = "warning";
      text = lang === "vi" ? "Huyết áp bình thường cao." : "High Normal SBP.";
    } else {
      severity = "danger";
      text = lang === "vi" ? "Tăng huyết áp (≥ 140 mmHg)." : "Hypertension (≥ 140 mmHg).";
    }
  } else if (type === "dbp") {
    if (val < 80) {
      severity = "safe";
      text = lang === "vi" ? "DBP bình thường (< 80 mmHg)." : "Optimal DBP (< 80 mmHg).";
    } else if (val < 90) {
      severity = "warning";
      text = lang === "vi" ? "DBP bình thường cao." : "High Normal DBP.";
    } else {
      severity = "danger";
      text = lang === "vi" ? "Tăng huyết áp tâm trương (≥ 90 mmHg)." : "Diastolic Hypertension.";
    }
  }

  const borderClass =
    severity === "safe"
      ? "border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:bg-white text-emerald-800"
      : severity === "warning"
        ? "border-yellow-500 bg-yellow-50/20 focus:border-yellow-600 focus:bg-white text-yellow-800"
        : "border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:bg-white text-rose-800";

  const textClass =
    severity === "safe"
      ? "text-emerald-600"
      : severity === "warning"
        ? "text-yellow-600 font-medium"
        : "text-rose-600 font-semibold";

  return { severity, text, borderClass, textClass };
}

/** Màu nền nhạt theo vùng can thiệp ESC (xanh / vàng / đỏ) */
function getZoneClass(r: number, c: number): string {
  const isNA = (r === 0 || r === 1) && c === 5;
  if (isNA) return "bg-slate-50 text-slate-400 border-slate-100 line-through";

  let zone: "green" | "yellow" | "red" = "green";
  if (r === 0) zone = c <= 3 ? "green" : "yellow";
  else if (r === 1) zone = c <= 2 ? "green" : c <= 4 ? "yellow" : "red";
  else if (r === 2) zone = c <= 1 ? "green" : c === 2 ? "yellow" : "red";
  else if (r === 3) zone = c <= 1 ? "yellow" : "red";
  else zone = "red";

  if (zone === "green") return "bg-emerald-50/80 text-emerald-900 border-slate-100";
  if (zone === "yellow") return "bg-amber-50/80 text-amber-950 border-slate-100";
  return "bg-rose-50/80 text-rose-900 border-slate-100";
}

export function getCellClass(r: number, c: number, rowIdx: number, colIdx: number): string {
  const isTarget = r === rowIdx && c === colIdx;
  const inTargetRow = r === rowIdx;
  const inTargetCol = c === colIdx;

  let base = "p-3 text-[11px] text-center border relative leading-snug ";

  if (isTarget) {
    return (
      base +
      "table4-cell-selected bg-white text-slate-800 font-semibold z-10 "
    );
  }

  base += getZoneClass(r, c) + " ";

  if (inTargetRow || inTargetCol) {
    base += "bg-sky-50/50 ";
  }

  return base;
}
