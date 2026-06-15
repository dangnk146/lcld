"use client";

import { useApp } from "@/context/AppContext";
import { getRiskCategoryLabelVi } from "@/lib/esc2025-reference";
import { LDL_COL_LABELS, ROW_LABELS_VI } from "@/lib/esc2025-reference";

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 py-1.5 border-b border-sky-50 text-[11px] ${highlight ? "bg-orange-50/50 -mx-2 px-2 rounded" : ""}`}>
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

export function PatientStatusPanel() {
  const {
    patient,
    activePatientId,
    activeVisit,
    activeVisitIndex,
    patientAvatars,
    assessment,
    rowIdx,
    colIdx,
    currentValDisp,
    goalValDisp,
    reductionNeededPct,
    calculatedNonHdlVal,
  } = useApp();

  const unit = patient.unit === "mmol" ? "mmol/L" : "mg/dL";
  const dmLabel =
    patient.diabetes === "none"
      ? "Không"
      : patient.diabetes === "t1dm"
        ? `T1DM (${patient.dmDuration} năm)`
        : `T2DM (${patient.dmDuration} năm)`;
  const ckdLabel =
    patient.ckd === "none" ? "Không" : patient.ckd === "moderate" ? "CKD TB (eGFR 30–59)" : "CKD nặng (eGFR <30)";

  return (
    <div className="h-full">
      <div className="px-4 py-3 bg-sky-700 text-white rounded-t-xl flex items-center gap-3">
        {patientAvatars[activePatientId] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={patientAvatars[activePatientId]}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border-2 border-white/30 shrink-0"
          />
        )}
        <div>
          <h2 className="text-xs font-semibold">Tình trạng bệnh nhân</h2>
          <p className="text-[10px] text-sky-100 mt-0.5">Giai đoạn {activeVisitIndex + 1} · Dữ liệu lâm sàng</p>
        </div>
      </div>
      <div className="p-4 bg-white border border-sky-100 border-t-0 rounded-b-xl">
        <Section title="Hành chính">
          <Row label="Họ tên" value={patient.name} />
          <Row label="Tuổi / Giới" value={`${patient.age} · ${patient.sex === "male" ? "Nam" : "Nữ"}`} />
          <Row label="Ngày khám" value={activeVisit?.visitDate} />
        </Section>

        {activeVisit?.clinicalNotes && (
          <Section title="Ghi chú lâm sàng">
            <p className="text-[11px] text-slate-700 leading-relaxed bg-sky-50/60 rounded-lg p-2.5 border border-sky-50">
              {activeVisit.clinicalNotes}
            </p>
          </Section>
        )}

        <Section title="Lipid máu (chưa điều trị)">
          <Row label="TC" value={`${patient.totalChol} ${unit}`} />
          <Row label="HDL-C" value={`${patient.hdlChol} ${unit}`} />
          <Row label="LDL-C" value={`${patient.ldlChol} ${unit}`} highlight />
          <Row label="Non-HDL-C" value={`${calculatedNonHdlVal} ${unit}`} />
          <Row label="Triglycerides" value={`${patient.triglycerides} ${unit}`} />
        </Section>

        <Section title="Yếu tố nguy cơ">
          <Row label="Huyết áp" value={`${patient.sbp}/${patient.dbp} mmHg`} />
          <Row label="Hút thuốc" value={patient.smokingStatus ? "Có" : "Không"} />
          <Row label="Vùng SCORE2" value={patient.riskRegion} />
          <Row label="ASCVD" value={patient.hasAscvd ? `Có (${patient.ascvdType})` : "Không"} />
          <Row label="Đái tháo đường" value={dmLabel} />
          <Row label="CKD" value={ckdLabel} />
          <Row label="FH" value={patient.hasFh ? (patient.fhHasMajorRiskFactor ? "Có + yếu tố chính" : "Có") : "Không"} />
        </Section>

        <Section title="Risk modifiers (Box 1)">
          <Row label="Lp(a) cao" value={patient.hasLpaElevated ? "Có" : "Không"} />
          <Row label="Mảng xơ vữa / CAC" value={patient.hasSubclinicalPlaque ? "Có" : "Không"} />
          <Row label="Gia đình CVD sớm" value={patient.hasPrematureFamilyHistory ? "Có" : "Không"} />
          <Row label="HIV ≥40" value={patient.hasHiv ? "Có" : "Không"} />
        </Section>

        <Section title="Kết quả tính toán (ESC 2025)">
          <Row label="SCORE2 ước tính" value={`${assessment.estimatedScore2.toFixed(1)}% / 10 năm`} highlight />
          <Row label="Phân tầng Table 3" value={getRiskCategoryLabelVi(assessment.riskCategory)} highlight />
          <Row label="Mục tiêu LDL đích" value={`<${goalValDisp} ${patient.unit}`} />
          <Row label="LDL hiện tại" value={`${currentValDisp} ${patient.unit}`} />
          <Row
            label="Cần giảm thêm"
            value={reductionNeededPct > 0 ? `${reductionNeededPct}%` : "Đạt mục tiêu"}
            highlight={reductionNeededPct > 0}
          />
          <Row label="Vị trí Bảng 4" value={`${ROW_LABELS_VI[rowIdx]} × ${LDL_COL_LABELS[colIdx]}`} highlight />
        </Section>
      </div>
    </div>
  );
}
