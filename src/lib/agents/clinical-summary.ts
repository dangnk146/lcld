import type { PatientData } from "@/app/actions";

export function buildClinicalSummary(
  patientData: PatientData,
  options?: { clinicalNotes?: string; visitDate?: string }
): string {
  const lipidUnit = patientData.unit === "mmol" ? "mmol/L" : "mg/dL";
  const calculatedNonHdl = (patientData.totalChol - patientData.hdlChol).toFixed(2);

  const visitBlock =
    options?.clinicalNotes || options?.visitDate
      ? `
--- BỐI CẢNH LẦN KHÁM HIỆN TẠI ---
- Ngày/Tuần khám: ${options.visitDate || "Không ghi"}
- Ghi chú lâm sàng & phác đồ đang dùng:
${options.clinicalNotes || "(Không có ghi chú bổ sung)"}
---
`
      : "";

  return `${visitBlock}
--- HỒ SƠ BỆNH NHÂN (DỮ LIỆU STRUCTURED) ---
- Họ và tên: ${patientData.name || "Bệnh nhân ẩn danh"}
- Tuổi: ${patientData.age}
- Giới tính: ${patientData.sex === "male" ? "Nam" : "Nữ"}
- Vùng nguy cơ tim mạch quốc gia (ESC): ${patientData.riskRegion.toUpperCase()}
- Tiền sử hút thuốc: ${patientData.smokingStatus ? "Có hút thuốc" : "Không hút thuốc"}
- Huyết áp tâm thu (SBP): ${patientData.sbp} mmHg
- Huyết áp tâm trương (DBP): ${patientData.dbp} mmHg
- Bộ mỡ máu (Lipid Panel) [Đơn vị: ${lipidUnit}]:
  + Cholesterol toàn phần: ${patientData.totalChol}
  + HDL Cholesterol: ${patientData.hdlChol}
  + Non-HDL Cholesterol (Tính toán): ${calculatedNonHdl}
  + LDL Cholesterol (Chưa điều trị): ${patientData.ldlChol}
  + Triglycerides: ${patientData.triglycerides}
- Tiền sử & Bệnh lý đi kèm (Table 3 — ESC/EAS 2025):
  + ASCVD đã xác định: ${patientData.hasAscvd ? `Có (${patientData.ascvdType === "secondary" ? "Phòng ngừa thứ phát" : "Phòng ngừa tiên phát"})` : "Không"}
  + Đái tháo đường: ${patientData.diabetes === "none" ? "Không" : `${patientData.diabetes.toUpperCase()} | Thời gian: ${patientData.dmDuration} năm | Tổn thương cơ quan đích: ${patientData.dmTargetOrganDamage ? "Có" : "Không"} | Yếu tố nguy cơ kèm: ${patientData.dmRiskFactorsCount}`}
  + CKD: ${patientData.ckd === "none" ? "Không" : patientData.ckd === "moderate" ? "Trung bình (eGFR 30-59)" : "Nặng (eGFR < 30)"}
  + FH: ${patientData.hasFh ? `Có (${patientData.fhHasMajorRiskFactor ? "kèm ASCVD/yếu tố nguy cơ" : "đơn thuần"})` : "Không"}
- Risk Modifiers:
  + Mảng xơ vữa cận lâm sàng / CAC > 300: ${patientData.hasSubclinicalPlaque ? "Có" : "Không"}
  + Tiền sử gia đình mắc bệnh tim sớm: ${patientData.hasPrematureFamilyHistory ? "Có" : "Không"}
  + Lp(a) cao (> 50 mg/dL): ${patientData.hasLpaElevated ? "Có" : "Không"}
  + HIV (tuổi >= 40): ${patientData.hasHiv ? "Có" : "Không"}
  + Nguy cơ độc tính tim do hóa trị: ${patientData.hasCancerToxicityRisk ? "Có" : "Không"}
  + TPCN tự phát hạ lipid: ${patientData.useDietarySupplements ? "Có" : "Không"}
---
`;
}
