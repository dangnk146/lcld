"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Activity,
  TrendingDown,
  AlertTriangle,
  Info,
  Sparkles,
  User,
  ShieldAlert,
  Brain,
  RefreshCw,
  Languages,
  Key,
  Send,
  Download,
  Copy,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { analyzePatientCardioRisk, PatientData, ChatMessage } from "./actions";

// Bilingual translations object
const t = {
  vi: {
    title: "CARDIO SHIELD 2025",
    subtitle: "Bảng tính Phân tầng Nguy cơ Tim mạch & Chiến lược Can thiệp Lipid theo ESC/EAS 2025",
    demographics: "1. Nhân khẩu học & Khu vực",
    name: "Họ và tên bệnh nhân",
    age: "Tuổi bệnh nhân",
    sex: "Giới tính",
    male: "Nam",
    female: "Nữ",
    riskRegion: "Khu vực nguy cơ quốc gia (ESC)",
    low: "Thấp",
    moderate: "Trung bình",
    high: "Cao",
    very_high: "Rất cao",
    lipidPanel: "2. Bộ chỉ số Lipid máu",
    unitSelect: "Đơn vị mỡ máu",
    totalChol: "Cholesterol toàn phần",
    hdlChol: "HDL Cholesterol (Tốt)",
    ldlChol: "LDL Cholesterol (Chưa điều trị)",
    triglycerides: "Triglycerides (Mỡ trung tính)",
    calculatedNonHdl: "Tính toán Non-HDL Cholesterol",
    bpAndLifestyle: "3. Huyết áp & Lối sống",
    sbp: "Huyết áp tâm thu (SBP)",
    dbp: "Huyết áp tâm trương (DBP)",
    smoking: "Hút thuốc lá hiện tại",
    smoker: "Có hút thuốc",
    nonSmoker: "Không hút thuốc",
    highRiskConditions: "4. Tiền sử & Bệnh lý đi kèm (Bảng 3)",
    hasAscvd: "Bệnh tim mạch do xơ vữa (ASCVD) đã xác định",
    ascvdHelp: "Đã có nhồi máu cơ tim, đột quỵ, TIA, can thiệp mạch, hẹp mạch >50% trên hình ảnh hoặc CAC >300.",
    diabetes: "Bệnh đái tháo đường (DM)",
    dmDuration: "Thời gian mắc đái tháo đường (năm)",
    dmTargetOrganDamage: "Có tổn thương cơ quan đích",
    dmTargetOrganHelp: "Có vi đạm niệu (microalbuminuria), bệnh võng mạc hoặc bệnh thần kinh do đái tháo đường.",
    dmRiskFactorsCount: "Số yếu tố nguy cơ chính kèm theo",
    ckd: "Bệnh thận mạn (CKD)",
    fh: "Tăng cholesterol máu gia đình (FH)",
    fhRiskHelp: "FH kèm theo ASCVD hoặc kèm theo ít nhất một yếu tố nguy cơ chính khác.",
    modifiers: "5. Các yếu tố tăng nguy cơ bổ trợ (Modifiers)",
    hasSubclinicalPlaque: "Có mảng xơ vữa cận lâm sàng hoặc CAC >300",
    hasPrematureFamilyHistory: "Tiền sử gia đình mắc bệnh tim mạch sớm",
    hasLpaElevated: "Lipoprotein(a) tăng cao (> 50 mg/dL hoặc > 105 nmol/L)",
    hasHiv: "Nhiễm HIV (Bệnh nhân >= 40 tuổi)",
    hasCancerToxicityRisk: "Ung thư có nguy cơ cao độc tính tim do hóa chất",
    useDietarySupplements: "Sử dụng thực phẩm chức năng tự phát hạ lipid",
    cardioRiskStratification: "KẾT QUẢ PHÂN TẦNG NGUY CƠ TIM MẠCH",
    riskLevel: "Mức nguy cơ tim mạch:",
    score2Estimator: "Điểm SCORE2 / SCORE2-OP ước tính:",
    score2Footnote: "Đây là điểm số SCORE2 ước tính 10 năm tỷ lệ tử vong và không tử vong tim mạch. Được tối ưu hóa cho người khỏe mạnh dự phòng tiên phát.",
    ldlTarget: "Mục tiêu điều trị LDL-C khuyến nghị:",
    currentLdl: "LDL-C hiện tại:",
    targetLdl: "LDL-C đích:",
    reductionNeeded: "Mức giảm cần thiết:",
    notRequired: "Đạt mục tiêu",
    reductionAlert: "Cần hạ thêm {pct}% để đạt đích khuyến nghị {goal} {unit}",
    table4Title: "BẢNG 4: CHIẾN LƯỢC CAN THIỆP THEO NGUY CƠ TIM MẠCH TỔNG THỂ VÀ MỨC LDL-C CHƯA ĐIỀU TRỊ",
    lifestyleAdvice: "Tư vấn lối sống",
    lifestyleModConsiderDrug: "Điều chỉnh lối sống, cân nhắc thêm thuốc nếu không kiểm soát được",
    lifestyleModConsiderDrugShort: "Điều chỉnh lối sống, cân nhắc thêm thuốc",
    lifestyleModDrug: "Điều chỉnh lối sống và can thiệp thuốc đồng thời",
    lifestyleModConcomitantDrug: "Điều chỉnh lối sống & phối hợp thuốc đồng thời",
    naFootnote: "Không áp dụng (N/A) - Người có LDL-C >= 4.9 mmol/L mặc định thuộc phân nhóm nguy cơ Cao hoặc Rất cao theo Table 3.",
    aiAssistant: "BÁC SĨ LÂM SÀNG TRỢ LÝ AI (ESC 2025)",
    aiWelcome: "Hệ thống AI đã sẵn sàng phân tích chuyên sâu ca lâm sàng này dựa trên cập nhật ESC/EAS 2025. Vui lòng nhập API Key để kích hoạt chẩn đoán.",
    enterApiKey: "Nhập OpenRouter API Key của bạn:",
    saveKey: "Lưu Key",
    keySaved: "Đã lưu Key thành công!",
    modelSelect: "Chọn mô hình AI:",
    runAiBtn: "KÍCH HOẠT AI CHUẨN ĐOÁN LÂM SÀNG",
    aiLoading: "AI đang phân tích toàn diện hồ sơ bệnh án bệnh nhân theo ESC/EAS 2025...",
    askAiPlaceholder: "Đặt câu hỏi lâm sàng bổ sung (ví dụ: Bệnh nhân này có phối hợp Bempedoic acid được không?)...",
    send: "Gửi",
    copy: "Sao chép",
    download: "Tải báo cáo",
    copied: "Đã sao chép vào bộ nhớ tạm!",
    reasonsTitle: "Tiêu chí phân tầng thỏa mãn:",
    normalBp: "Bình thường",
    highBp: "Tăng huyết áp độ 1-2",
    crisisBp: "Cơn tăng huyết áp (>=180/110)",
    nonHdlText: "Non-HDL Cholesterol tính bằng Cholesterol toàn phần trừ đi HDL-C. Đây là chỉ số phản ánh toàn bộ các lipoprotein chứa apolipoprotein B gây xơ vữa."
  },
  en: {
    title: "CARDIO SHIELD 2025",
    subtitle: "Cardiovascular Risk Stratification & Lipid Intervention Dashboard (ESC/EAS 2025)",
    demographics: "1. Demographics & Region",
    name: "Patient Name",
    age: "Patient Age",
    sex: "Sex",
    male: "Male",
    female: "Female",
    riskRegion: "Country Risk Region (ESC)",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    very_high: "Very High",
    lipidPanel: "2. Lipid Panel",
    unitSelect: "Lipid Unit",
    totalChol: "Total Cholesterol",
    hdlChol: "HDL Cholesterol (Good)",
    ldlChol: "LDL Cholesterol (Untreated)",
    triglycerides: "Triglycerides",
    calculatedNonHdl: "Calculated Non-HDL Cholesterol",
    bpAndLifestyle: "3. Blood Pressure & Lifestyle",
    sbp: "Systolic Blood Pressure (SBP)",
    dbp: "Diastolic Blood Pressure (DBP)",
    smoking: "Current Smoking Status",
    smoker: "Smoker",
    nonSmoker: "Non-smoker",
    highRiskConditions: "4. Pre-existing Conditions (Table 3)",
    hasAscvd: "Documented ASCVD",
    ascvdHelp: "Established MI, stroke, TIA, coronary revascularization, significant plaque (>50% stenosis) on imaging, or CAC >300.",
    diabetes: "Diabetes Mellitus (DM)",
    dmDuration: "Diabetes Duration (years)",
    dmTargetOrganDamage: "Target Organ Damage",
    dmTargetOrganHelp: "Microalbuminuria, retinopathy, or neuropathy due to diabetes.",
    dmRiskFactorsCount: "Additional Major Risk Factors",
    ckd: "Chronic Kidney Disease (CKD)",
    fh: "Familial Hypercholesterolemia (FH)",
    fhRiskHelp: "FH with ASCVD or with another major risk factor.",
    modifiers: "5. Risk Modifiers",
    hasSubclinicalPlaque: "Subclinical atherosclerosis or CAC >300",
    hasPrematureFamilyHistory: "Family history of premature CVD",
    hasLpaElevated: "Elevated Lipoprotein(a) (> 50 mg/dL or > 105 nmol/L)",
    hasHiv: "HIV positive (Patient aged >= 40)",
    hasCancerToxicityRisk: "High chemotherapy cardiotoxicity risk",
    useDietarySupplements: "Uses unproven dietary supplements for lipid lowering",
    cardioRiskStratification: "CARDIOVASCULAR RISK STRATIFICATION",
    riskLevel: "Cardiovascular Risk Level:",
    score2Estimator: "Estimated SCORE2 / SCORE2-OP:",
    score2Footnote: "This is an estimated 10-year risk of fatal and non-fatal cardiovascular events. Best suited for healthy primary prevention individuals.",
    ldlTarget: "Recommended LDL-C Target Goal:",
    currentLdl: "Current LDL-C:",
    targetLdl: "Target LDL-C:",
    reductionNeeded: "Reduction Required:",
    notRequired: "Target Achieved",
    reductionAlert: "Reduce by {pct}% to reach recommended target of {goal} {unit}",
    table4Title: "TABLE 4: INTERVENTION STRATEGIES AS A FUNCTION OF TOTAL CV RISK AND UNTREATED LDL-C LEVELS",
    lifestyleAdvice: "Lifestyle advice",
    lifestyleModConsiderDrug: "Lifestyle modification, consider adding drug if uncontrolled",
    lifestyleModConsiderDrugShort: "Lifestyle mod, consider drug if uncontrolled",
    lifestyleModDrug: "Lifestyle modification, consider adding drug",
    lifestyleModConcomitantDrug: "Lifestyle modification and concomitant drug intervention",
    naFootnote: "Not applicable (N/A) - Individuals with untreated LDL-C >= 4.9 mmol/L are already classified as High or Very High risk by default in Table 3.",
    aiAssistant: "AI CLINICAL ASSISTANT (ESC 2025)",
    aiWelcome: "The AI system is ready to provide a detailed clinical analysis based on the ESC/EAS 2025 focused update. Enter your API Key to activate.",
    enterApiKey: "Enter OpenRouter API Key:",
    saveKey: "Save Key",
    keySaved: "Key saved successfully!",
    modelSelect: "Select AI Model:",
    runAiBtn: "RUN AI CLINICAL DIAGNOSIS",
    aiLoading: "AI is performing a comprehensive clinical audit according to ESC/EAS 2025 guidelines...",
    askAiPlaceholder: "Ask follow-up clinical questions (e.g. Is bempedoic acid indicated here?)...",
    send: "Send",
    copy: "Copy",
    download: "Download Report",
    copied: "Copied to clipboard!",
    reasonsTitle: "Met Stratification Criteria:",
    normalBp: "Normal BP",
    highBp: "Stage 1-2 Hypertension",
    crisisBp: "Hypertensive Crisis (>=180/110)",
    nonHdlText: "Non-HDL Cholesterol is calculated as Total Cholesterol minus HDL-C. It represents the total concentration of atherogenic ApoB-containing lipoproteins."
  }
};

interface Visit {
  id: string;
  visitDate: string;
  patientData: PatientData;
  clinicalNotes: string;
  isFatalOutcome?: boolean;
}

interface PatientRecord {
  id: string;
  patientName: string;
  status: "alive" | "deceased";
  visits: Visit[];
}

const initialPatients: PatientRecord[] = [
  {
    id: "patient1",
    patientName: "Nguyễn Văn A (FH - 5 Visits)",
    status: "alive",
    visits: [
      {
        id: "p1-v1",
        visitDate: "Tuần 0 (Khám đầu)",
        clinicalNotes: "Lần đầu phát hiện tăng LDL-C rất cao. Tiền sử gia đình có bố bị nhồi máu cơ tim sớm (50 tuổi). Được chẩn đoán Tăng Cholesterol máu gia đình (FH) dự phòng tiên phát. Điều trị khởi trị đề xuất: Khởi trị ngay Statin hoạt lực mạnh Atorvastatin 40mg uống tối.",
        patientData: {
          name: "Nguyễn Văn A",
          age: 45,
          sex: "male",
          riskRegion: "low",
          smokingStatus: false,
          sbp: 140,
          dbp: 85,
          totalChol: 8.5,
          hdlChol: 1.2,
          ldlChol: 6.2,
          triglycerides: 2.1,
          unit: "mmol",
          hasAscvd: false,
          ascvdType: "primary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: true,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: false,
          hasPrematureFamilyHistory: true,
          hasLpaElevated: false,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p1-v2",
        visitDate: "Tuần 6 (Tái khám)",
        clinicalNotes: "Tái khám sau 6 tuần điều trị Atorvastatin 40mg. LDL-C giảm từ 6.2 mmol/L xuống 4.2 mmol/L (~32%). Tuy nhiên vẫn chưa đạt đích mục tiêu (< 1.4 mmol/L). Bệnh nhân dung nạp thuốc tốt, không có đau cơ. Khuyến cáo tăng bậc điều trị: Atorvastatin 80mg uống tối + phối hợp Ezetimibe 10mg/ngày.",
        patientData: {
          name: "Nguyễn Văn A",
          age: 45,
          sex: "male",
          riskRegion: "low",
          smokingStatus: false,
          sbp: 135,
          dbp: 82,
          totalChol: 6.5,
          hdlChol: 1.2,
          ldlChol: 4.2,
          triglycerides: 1.8,
          unit: "mmol",
          hasAscvd: false,
          ascvdType: "primary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: true,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: false,
          hasPrematureFamilyHistory: true,
          hasLpaElevated: false,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p1-v3",
        visitDate: "Tuần 12 (Tái khám)",
        clinicalNotes: "Tái khám sau 6 tuần dùng Atorvastatin 80mg + Ezetimibe 10mg. LDL-C giảm tiếp xuống 2.6 mmol/L (~58% so với nền ban đầu). Vẫn chưa đạt đích mục tiêu (< 1.4 mmol/L). Dựa trên khuyến nghị Cập nhật ESC 2025, quyết định phối hợp thêm Bempedoic Acid 180mg/ngày.",
        patientData: {
          name: "Nguyễn Văn A",
          age: 45,
          sex: "male",
          riskRegion: "low",
          smokingStatus: false,
          sbp: 130,
          dbp: 80,
          totalChol: 4.9,
          hdlChol: 1.2,
          ldlChol: 2.6,
          triglycerides: 1.6,
          unit: "mmol",
          hasAscvd: false,
          ascvdType: "primary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: true,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: false,
          hasPrematureFamilyHistory: true,
          hasLpaElevated: false,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p1-v4",
        visitDate: "Tuần 18 (Tái khám)",
        clinicalNotes: "Tái khám sau 6 tuần dùng thêm Bempedoic Acid. LDL-C đáp ứng tốt giảm xuống 1.6 mmol/L (~74% giảm so với nền). Rất gần đích mục tiêu 1.4 mmol/L. Thảo luận phối hợp thêm kháng thể đơn dòng PCSK9 inhibitor (Evolocumab 140mg tiêm dưới da mỗi 2 tuần) để kiểm soát mỡ máu tối đa cho ca bệnh FH này.",
        patientData: {
          name: "Nguyễn Văn A",
          age: 45,
          sex: "male",
          riskRegion: "low",
          smokingStatus: false,
          sbp: 128,
          dbp: 80,
          totalChol: 3.9,
          hdlChol: 1.2,
          ldlChol: 1.6,
          triglycerides: 1.5,
          unit: "mmol",
          hasAscvd: false,
          ascvdType: "primary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: true,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: false,
          hasPrematureFamilyHistory: true,
          hasLpaElevated: false,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p1-v5",
        visitDate: "Tuần 24 (Đích đạt)",
        clinicalNotes: "Tái khám tuần 24. Kết quả tuyệt vời sau 6 tuần dùng PCSK9i: LDL-C giảm sâu xuống còn 0.8 mmol/L. Đạt hoàn hảo mục tiêu đích điều trị (< 1.4 mmol/L và giảm >50% so với ban đầu). Bệnh nhân khỏe mạnh, dung nạp tốt toàn bộ phác đồ. Tiếp tục phác đồ duy trì.",
        patientData: {
          name: "Nguyễn Văn A",
          age: 45,
          sex: "male",
          riskRegion: "low",
          smokingStatus: false,
          sbp: 125,
          dbp: 78,
          totalChol: 3.1,
          hdlChol: 1.2,
          ldlChol: 0.8,
          triglycerides: 1.4,
          unit: "mmol",
          hasAscvd: false,
          ascvdType: "primary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: true,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: false,
          hasPrematureFamilyHistory: true,
          hasLpaElevated: false,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      }
    ]
  },
  {
    id: "patient2",
    patientName: "Trần Thị B (ACS & Đau cơ Statin - 10 Visits)",
    status: "alive",
    visits: [
      {
        id: "p2-v1",
        visitDate: "Tuần 0 (Nằm viện ACS)",
        clinicalNotes: "Bệnh nhân nữ 62 tuổi, nhập viện vì Hội chứng vành cấp (ACS) - Nhồi máu cơ tim cấp. Đã được can thiệp đặt stent mạch vành thành công. LDL-C chưa điều trị là 4.5 mmol/L. Áp dụng chiến lược 'Strike early, strike strong' của ESC 2025: Khởi trị ngay phối hợp Statin hoạt lực cực mạnh Rosuvastatin 40mg + Ezetimibe 10mg đồng thời ngay tại viện.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 155,
          dbp: 95,
          totalChol: 7.2,
          hdlChol: 1.0,
          ldlChol: 4.5,
          triglycerides: 2.5,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v2",
        visitDate: "Tuần 4 (Đau cơ cấp)",
        clinicalNotes: "Tái khám sau 4 tuần xuất viện. Bệnh nhân than phiền đau nhức cơ nặng toàn thân, mệt mỏi rã rời, yếu 2 chi dưới (Myalgia). Xét nghiệm thấy AST/ALT tăng gấp 3.5 lần giới hạn bình thường. Chẩn đoán: Không dung nạp statin cường độ cao (Statin intolerance). Quyết định: Ngừng ngay Rosuvastatin, chuyển sang điều trị thay thế bằng phối hợp Bempedoic Acid 180mg + Ezetimibe 10mg (Khuyến nghị Class I - ESC 2025).",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 135,
          dbp: 85,
          totalChol: 5.8,
          hdlChol: 1.0,
          ldlChol: 2.8,
          triglycerides: 2.2,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v3",
        visitDate: "Tuần 8 (Tái khám)",
        clinicalNotes: "Tái khám tuần 8. LDL-C là 2.8 mmol/L. Bệnh nhân đã hết hoàn toàn triệu chứng đau cơ, men gan AST/ALT trở lại bình thường. Do bệnh nhân thuộc nhóm nguy cơ RẤT CAO phòng ngừa thứ phát (sau ACS), đích LDL-C bắt buộc là < 1.4 mmol/L. Quyết định phối hợp thêm kháng thể đơn dòng PCSK9 inhibitor (Evolocumab 140mg tiêm dưới da mỗi 2 tuần).",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 130,
          dbp: 80,
          totalChol: 5.5,
          hdlChol: 1.0,
          ldlChol: 2.8,
          triglycerides: 2.1,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v4",
        visitDate: "Tuần 12 (Đích đạt)",
        clinicalNotes: "Tái khám tuần 12. LDL-C đo được là 1.3 mmol/L, chính thức đạt đích mục tiêu khuyến nghị (< 1.4 mmol/L và giảm >50%). Huyết áp kiểm soát tốt ở mức 125/80 mmHg. Bệnh nhân cảm thấy khỏe mạnh và tuân thủ rất tốt.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 125,
          dbp: 80,
          totalChol: 4.0,
          hdlChol: 1.0,
          ldlChol: 1.3,
          triglycerides: 1.8,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v5",
        visitDate: "Tuần 16 (Tái khám)",
        clinicalNotes: "Theo dõi định kỳ tuần 16. Mỡ máu và huyết áp ổn định tuyệt đối. Dung nạp thuốc hoàn hảo. Tiếp tục duy trì phác đồ hiện tại.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 125,
          dbp: 78,
          totalChol: 3.9,
          hdlChol: 1.0,
          ldlChol: 1.25,
          triglycerides: 1.75,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v6",
        visitDate: "Tuần 20 (Tái khám)",
        clinicalNotes: "Tái khám tuần 20. Bệnh nhân tích cực duy trì lối sống lành mạnh, ăn kiêng và tập đi bộ nhẹ. Tiếp tục duy trì điều trị thuốc Bempedoic + Ezetimibe + PCSK9i.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 124,
          dbp: 78,
          totalChol: 3.9,
          hdlChol: 1.0,
          ldlChol: 1.3,
          triglycerides: 1.7,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v7",
        visitDate: "Tuần 24 (Tái khám)",
        clinicalNotes: "Tái khám định kỳ 6 tháng. Kiểm tra chức năng gan thận thấy eGFR bình thường, men gan bình thường. Mỡ máu đạt mục tiêu xuất sắc.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 122,
          dbp: 75,
          totalChol: 3.8,
          hdlChol: 1.0,
          ldlChol: 1.28,
          triglycerides: 1.65,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v8",
        visitDate: "Tuần 28 (Tái khám)",
        clinicalNotes: "Kiểm tra định kỳ tuần 28. Bệnh nhân khỏe mạnh, vết mổ mạch vành và các vị trí đặt stent hoạt động tốt. Tiếp tục duy trì phác đồ.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 122,
          dbp: 75,
          totalChol: 3.8,
          hdlChol: 1.0,
          ldlChol: 1.3,
          triglycerides: 1.6,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v9",
        visitDate: "Tuần 36 (Tái khám)",
        clinicalNotes: "Tái khám tuần 36. Các xét nghiệm tim mạch chuyên sâu (siêu âm tim, điện tâm đồ) cho kết quả rất khả quan. Tiếp tục duy trì phác đồ mỡ máu ổn định.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 120,
          dbp: 75,
          totalChol: 3.8,
          hdlChol: 1.0,
          ldlChol: 1.25,
          triglycerides: 1.6,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p2-v10",
        visitDate: "Tuần 52 (Tròn 1 năm)",
        clinicalNotes: "Tái khám tròn 1 năm sau biến cố ACS mạch vành nguy kịch. Sức khỏe tim mạch của bệnh nhân được bảo vệ tối ưu. LDL-C duy trì cực tốt ở mức 1.1 mmol/L nhờ liệu pháp phối hợp Bempedoic + Ezetimibe + PCSK9i. Một thành công lâm sàng rực rỡ theo đúng ESC 2025.",
        patientData: {
          name: "Trần Thị B",
          age: 62,
          sex: "female",
          riskRegion: "very_high",
          smokingStatus: true,
          sbp: 120,
          dbp: 75,
          totalChol: 3.6,
          hdlChol: 1.0,
          ldlChol: 1.1,
          triglycerides: 1.5,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "none",
          dmDuration: 0,
          dmTargetOrganDamage: false,
          dmRiskFactorsCount: 0,
          ckd: "none",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      }
    ]
  },
  {
    id: "patient3",
    patientName: "Phạm Văn C (Suy thận & Đái tháo đường - 7 Visits - Tử vong)",
    status: "deceased",
    visits: [
      {
        id: "p3-v1",
        visitDate: "Tuần 0 (Sau mổ CABG)",
        clinicalNotes: "Bệnh nhân nam 68 tuổi, vừa phẫu thuật bắc cầu chủ-vành (CABG). Bệnh nền phức tạp: Đái tháo đường biến chứng thận mạn (CKD độ 3, eGFR = 35). LDL-C nền 3.8 mmol/L, Lp(a) cực cao 120 mg/dL (nguy cơ tồn dư xơ vữa cực lớn). Khởi trị đề xuất: Rosuvastatin 40mg + Ezetimibe 10mg.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 165,
          dbp: 95,
          totalChol: 6.8,
          hdlChol: 0.9,
          ldlChol: 3.8,
          triglycerides: 3.2,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p3-v2",
        visitDate: "Tuần 6 (Tái khám)",
        clinicalNotes: "Tái khám tuần 6. LDL-C giảm xuống 1.9 mmol/L (~50% giảm). Vẫn chưa đạt đích rất cao (< 1.4 mmol/L). Huyết áp còn cao. Quyết định thêm Bempedoic Acid 180mg để hạ sâu thêm mỡ máu cho nhóm nguy cơ rất cao này.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 150,
          dbp: 90,
          totalChol: 4.9,
          hdlChol: 0.9,
          ldlChol: 1.9,
          triglycerides: 2.8,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p3-v3",
        visitDate: "Tuần 12 (Đau khớp)",
        clinicalNotes: "Tái khám tuần 12. LDL-C giảm nhẹ còn 1.6 mmol/L. Huyết áp cải thiện. Bệnh nhân tuân thủ thuốc rất tốt nhưng bắt đầu xuất hiện những cơn đau nhức dữ dội sưng tấy đỏ ở khớp ngón chân cái bên phải.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 145,
          dbp: 88,
          totalChol: 4.6,
          hdlChol: 0.9,
          ldlChol: 1.6,
          triglycerides: 2.5,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p3-v4",
        visitDate: "Tuần 18 (Gút cấp)",
        clinicalNotes: "Cơn gút cấp bùng phát dữ dội do tác dụng phụ làm tăng acid uric máu của Bempedoic Acid trên nền suy thận sẵn eGFR = 35. Buộc lòng phải dừng hẳn Bempedoic Acid. LDL-C lập tức tăng vọt trở lại lên 2.1 mmol/L. Bệnh nhân lo lắng, tim mạch bất ổn.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 142,
          dbp: 88,
          totalChol: 5.1,
          hdlChol: 0.9,
          ldlChol: 2.1,
          triglycerides: 2.6,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p3-v5",
        visitDate: "Tuần 24 (Tái khám)",
        clinicalNotes: "Đã khống chế hoàn toàn cơn gút cấp. Bác sĩ quyết định bổ sung kháng thể đơn dòng PCSK9 inhibitor (Evolocumab 140mg tiêm dưới da mỗi 2 tuần) thay thế cho bempedoic acid. LDL-C giảm sâu xuống 1.3 mmol/L, thành công đạt đích huyết áp 135 mmHg.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 135,
          dbp: 85,
          totalChol: 4.3,
          hdlChol: 0.9,
          ldlChol: 1.3,
          triglycerides: 2.3,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: false
        }
      },
      {
        id: "p3-v6",
        visitDate: "Tuần 30 (Bỏ thuốc)",
        clinicalNotes: "Bệnh nhân tự ý bỏ tiêm PCSK9 inhibitor vì chi phí thuốc quá cao nằm ngoài khả năng chi trả. Nguy hại hơn, bệnh nhân tự ý mua thực phẩm chức năng tự phát trên mạng để tự điều trị mỡ máu (Chống chỉ định Class III - ESC 2025). LDL-C lập tức tăng vọt lên 1.9 mmol/L, huyết áp bất ổn.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 140,
          dbp: 88,
          totalChol: 4.9,
          hdlChol: 0.9,
          ldlChol: 1.9,
          triglycerides: 2.5,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: true
        }
      },
      {
        id: "p3-v7",
        visitDate: "Tuần 36 (KHÔNG QUA KHỎI)",
        isFatalOutcome: true,
        clinicalNotes: "BỆNH NHÂN ĐÃ TỬ VONG DỘT NGỘT DO BIẾN CỐ TIM MẠCH CẤP (NHỒI MÁU CƠ TIM CẤP DIỆN RỘNG TÁI PHÁT). Sự phối hợp của nhiều yếu tố nguy cơ cực lớn (ĐTĐ biến chứng thận nặng CKD, Lp(a) rất cao làm mảng xơ vữa bất ổn phát triển cực nhanh, kết hợp với việc ngưng tuân thủ điều trị PCSK9i vì rào cản chi phí và tự ý dùng TPCN tự phát) đã dẫn đến kết cục lâm sàng thương tâm này. Đây là bài học sâu sắc về quản lý tuân thủ điều trị và nguy cơ tồn dư (residual risk) rất lớn trong tim mạch.",
        patientData: {
          name: "Phạm Văn C",
          age: 68,
          sex: "male",
          riskRegion: "high",
          smokingStatus: false,
          sbp: 145,
          dbp: 90,
          totalChol: 5.2,
          hdlChol: 0.9,
          ldlChol: 2.2,
          triglycerides: 2.6,
          unit: "mmol",
          hasAscvd: true,
          ascvdType: "secondary",
          diabetes: "t2dm",
          dmDuration: 15,
          dmTargetOrganDamage: true,
          dmRiskFactorsCount: 2,
          ckd: "moderate",
          hasFh: false,
          fhHasMajorRiskFactor: false,
          hasSubclinicalPlaque: true,
          hasPrematureFamilyHistory: false,
          hasLpaElevated: true,
          hasHiv: false,
          hasCancerToxicityRisk: false,
          useDietarySupplements: true
        }
      }
    ]
  }
];

const MarkdownRenderer = ({ content }: { content: string }) => {
  // Simple custom markdown line-by-line parser to produce rich React nodes
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Basic bold **text** parsing
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-blue-700">{part}</strong>;
      }
      // Check for inline code or highlight
      const subParts = part.split(/`([^`]+)`/g);
      return subParts.map((sub, sIdx) => {
        if (sIdx % 2 === 1) {
          return <code key={sIdx} className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 border border-slate-200">{sub}</code>;
        }
        return sub;
      });
    });
  };

  const renderTable = (headers: string[], rows: string[][], tableKey: number) => {
    return (
      <div key={`table-${tableKey}`} className="my-4 overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-xs bg-white">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {headers.map((h, i) => (
                <th key={i} className="p-2.5 font-bold text-slate-700">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-slate-150 hover:bg-slate-50/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-slate-700 leading-normal">
                    {parseInlineStyles(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  let elementKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Table processing
    if (line.trim().startsWith("|")) {
      const parts = line.split("|").slice(1, -1);
      
      // Check if it's separator row (e.g. |:---|:---|)
      if (parts.every(p => p.trim().startsWith(":") || p.trim().startsWith("-"))) {
        // Skip separator line
        continue;
      }
      
      if (!inTable) {
        inTable = true;
        tableHeaders = parts;
        tableRows = [];
      } else {
        tableRows.push(parts);
      }
      continue;
    } else {
      if (inTable) {
        elements.push(renderTable(tableHeaders, tableRows, elementKey++));
        inTable = false;
      }
    }
    
    // Blockquote
    if (line.trim().startsWith(">")) {
      const cleanLine = line.trim().substring(1).trim();
      elements.push(
        <blockquote key={elementKey++} className="border-l-4 border-blue-500 bg-blue-50/50 pl-3.5 py-1.5 pr-2 my-3 rounded-r-xl text-[11px] text-slate-700 font-medium italic leading-relaxed">
          {parseInlineStyles(cleanLine)}
        </blockquote>
      );
      continue;
    }
    
    // Headers
    if (line.trim().startsWith("#")) {
      const match = line.trim().match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        
        if (level === 1) {
          elements.push(
            <h2 key={elementKey++} className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-1 mt-5 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-blue-600 rounded-sm"></span>
              {text}
            </h2>
          );
        } else if (level === 2) {
          elements.push(
            <h3 key={elementKey++} className="text-xs font-bold text-blue-600 mt-4 mb-2 uppercase tracking-wide">
              {text}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={elementKey++} className="text-[11px] font-bold text-slate-700 mt-3 mb-1.5">
              {text}
            </h4>
          );
        }
        continue;
      }
    }
    
    // Lists
    if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
      const cleanLine = line.trim().substring(1).trim();
      elements.push(
        <ul key={elementKey++} className="list-disc pl-4 space-y-1 my-1">
          <li className="text-[11px] text-slate-600 leading-normal">
            {parseInlineStyles(cleanLine)}
          </li>
        </ul>
      );
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      elements.push(
        <ol key={elementKey++} className="list-decimal pl-4 space-y-1 my-1">
          <li className="text-[11px] text-slate-600 leading-normal">
            <span className="font-bold text-slate-700 mr-1">{num}.</span>
            {parseInlineStyles(text)}
          </li>
        </ol>
      );
      continue;
    }
    
    // Paragraph / Empty line
    if (line.trim() === "") {
      elements.push(<div key={elementKey++} className="h-2" />);
    } else {
      elements.push(
        <p key={elementKey++} className="text-[11px] text-slate-600 leading-relaxed my-1.5">
          {parseInlineStyles(line)}
        </p>
      );
    }
  }
  
  // Flush final table if open
  if (inTable) {
    elements.push(renderTable(tableHeaders, tableRows, elementKey++));
  }
  
  return <div className="space-y-1">{elements}</div>;
};

export default function Dashboard() {
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [apiKey, setApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("deepseek/deepseek-v4-flash:free");

  // Longitudinal patient database state
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [activePatientId, setActivePatientId] = useState<string>("patient1");
  const [activeVisitIndex, setActiveVisitIndex] = useState<number>(0);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];
  const activeVisit = activePatient.visits[activeVisitIndex] || activePatient.visits[0];

  // Local synced edited patient state
  const [patient, setPatient] = useState<PatientData>(activeVisit.patientData);

  // Helper to determine severity level and text explanation for numeric inputs
  const getInputSeverity = (type: "totalChol" | "hdlChol" | "ldlChol" | "triglycerides" | "sbp" | "dbp", val: number) => {
    const isMmol = patient.unit === "mmol";
    const valMmol = isMmol ? val : val / 38.67;
    const valMmolTg = isMmol ? val : val / 88.57;

    let severity: "safe" | "warning" | "danger" = "safe";
    let text = "";

    if (type === "totalChol") {
      if (valMmol < 5.0) {
        severity = "safe";
        text = lang === "vi" 
          ? "Bình thường (< 5.0 mmol/L | < 193 mg/dL). Mức tối ưu cho dự phòng." 
          : "Normal (< 5.0 mmol/L | < 193 mg/dL). Optimal for prevention.";
      } else if (valMmol < 8.0) {
        severity = "warning";
        text = lang === "vi" 
          ? "Tăng nhẹ đến trung bình (5.0 - 7.9 mmol/L). Cần tối ưu lối sống." 
          : "Borderline High (5.0 - 7.9 mmol/L). Lifestyle optimization recommended.";
      } else {
        severity = "danger";
        text = lang === "vi" 
          ? "Tăng cực cao (≥ 8.0 mmol/L | ≥ 310 mg/dL). Gợi ý cao mắc Tăng cholesterol máu gia đình (FH)!" 
          : "Extremely High (≥ 8.0 mmol/L | ≥ 310 mg/dL). Strongly suggests Familial Hypercholesterolemia (FH)!";
      }
    } else if (type === "hdlChol") {
      const lowThreshold = patient.sex === "male" ? 1.0 : 1.2;
      if (valMmol < lowThreshold) {
        severity = "danger";
        text = lang === "vi" 
          ? `HDL-C thấp nguy hại (< ${lowThreshold} mmol/L). Tăng độc lập nguy cơ xơ vữa!` 
          : `Low HDL-C (< ${lowThreshold} mmol/L). Independently increases cardiovascular risk!`;
      } else {
        severity = "safe";
        text = lang === "vi" 
          ? `HDL-C tối ưu (≥ ${lowThreshold} mmol/L). Đóng vai trò bảo vệ thành mạch.` 
          : `Optimal HDL-C (≥ ${lowThreshold} mmol/L). Provides vascular protection.`;
      }
    } else if (type === "ldlChol") {
      if (valMmol < 1.4) {
        severity = "safe";
        text = lang === "vi" 
          ? "LDL-C lý tưởng (< 1.4 mmol/L | < 55 mg/dL). Đạt đích cho nguy cơ Rất Cao." 
          : "Optimal LDL-C (< 1.4 mmol/L | < 55 mg/dL). Reaches target for Very High risk.";
      } else if (valMmol < 1.8) {
        severity = "safe";
        text = lang === "vi" 
          ? "LDL-C thấp (1.4 - 1.7 mmol/L). Đạt đích cho nguy cơ Cao." 
          : "Low LDL-C (1.4 - 1.7 mmol/L). Reaches target for High risk.";
      } else if (valMmol < 3.0) {
        severity = "warning";
        text = lang === "vi" 
          ? "LDL-C trung bình (1.8 - 2.9 mmol/L). Xem xét dùng thuốc nếu nguy cơ từ Trung bình trở lên." 
          : "Moderate LDL-C (1.8 - 2.9 mmol/L). Consider drugs if risk is Moderate or higher.";
      } else if (valMmol < 4.9) {
        severity = "warning";
        text = lang === "vi" 
          ? "LDL-C cao (3.0 - 4.8 mmol/L). Thường cần khởi trị statin tích cực." 
          : "High LDL-C (3.0 - 4.8 mmol/L). Active statin initiation usually required.";
      } else {
        severity = "danger";
        text = lang === "vi" 
          ? "Tăng cực độ (≥ 4.9 mmol/L | ≥ 190 mg/dL). Tự động xếp vào nhóm nguy cơ CAO theo Bảng 3!" 
          : "Extremely High (≥ 4.9 mmol/L | ≥ 190 mg/dL). Automatically elevates to HIGH risk per Table 3!";
      }
    } else if (type === "triglycerides") {
      if (valMmolTg < 1.7) {
        severity = "safe";
        text = lang === "vi" 
          ? "Triglycerides bình thường (< 1.7 mmol/L | < 150 mg/dL)." 
          : "Normal Triglycerides (< 1.7 mmol/L | < 150 mg/dL).";
      } else if (valMmolTg < 5.0) {
        severity = "warning";
        text = lang === "vi" 
          ? "Tăng Triglycerides (1.7 - 4.9 mmol/L). Nguy cơ xơ vữa tồn dư, xem xét tối ưu chế độ ăn uống hoặc dùng Icosapent Ethyl." 
          : "Elevated Triglycerides (1.7 - 4.9 mmol/L). Residual risk, optimize diet or consider Icosapent Ethyl.";
      } else {
        severity = "danger";
        text = lang === "vi" 
          ? "Tăng Triglycerides cực độ (≥ 5.0 mmol/L | ≥ 442 mg/dL). Nguy cơ viêm tụy cấp tính cao, cần hạ lipid khẩn cấp!" 
          : "Extremely High Triglycerides (≥ 5.0 mmol/L | ≥ 442 mg/dL). High risk of acute pancreatitis, urgent lipid lowering required!";
      }
    } else if (type === "sbp") {
      if (val < 120) {
        severity = "safe";
        text = lang === "vi" ? "Huyết áp tối ưu (< 120 mmHg)." : "Optimal SBP (< 120 mmHg).";
      } else if (val < 130) {
        severity = "warning";
        text = lang === "vi" ? "Bình thường (120 - 129 mmHg)." : "Normal SBP (120 - 129 mmHg).";
      } else if (val < 140) {
        severity = "warning";
        text = lang === "vi" ? "Huyết áp bình thường cao (130 - 139 mmHg)." : "High Normal SBP (130 - 139 mmHg).";
      } else {
        severity = "danger";
        text = lang === "vi" ? "Tăng huyết áp thực sự (≥ 140 mmHg - từ Độ 1 trở lên). Bắt buộc can thiệp!" : "Hypertension (≥ 140 mmHg - Grade 1+). Intervention mandatory!";
      }
    } else if (type === "dbp") {
      if (val < 80) {
        severity = "safe";
        text = lang === "vi" ? "Huyết áp tâm trương bình thường (< 80 mmHg)." : "Optimal DBP (< 80 mmHg).";
      } else if (val < 90) {
        severity = "warning";
        text = lang === "vi" ? "Bình thường cao (80 - 89 mmHg)." : "High Normal DBP (80 - 89 mmHg).";
      } else {
        severity = "danger";
        text = lang === "vi" ? "Tăng huyết áp tâm trương thực sự (≥ 90 mmHg). Cần quản lý sát!" : "Diastolic Hypertension (≥ 90 mmHg). Needs close monitoring!";
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
  };

  // Sync loader when patient ID or visit changes
  useEffect(() => {
    const freshPatient = patients.find(p => p.id === activePatientId);
    if (freshPatient) {
      const freshVisit = freshPatient.visits[activeVisitIndex];
      if (freshVisit) {
        setPatient(freshVisit.patientData);
      }
    }
  }, [activePatientId, activeVisitIndex]);

  // Sync changes back to active visit and propagate to future visits
  useEffect(() => {
    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          const updatedVisits = p.visits.map((v, idx) => {
            if (idx === activeVisitIndex) {
              return { ...v, patientData: patient };
            } else if (idx > activeVisitIndex) {
              return {
                ...v,
                patientData: {
                  ...v.patientData,
                  riskRegion: patient.riskRegion,
                  smokingStatus: patient.smokingStatus,
                  sbp: patient.sbp,
                  dbp: patient.dbp,
                  totalChol: patient.totalChol,
                  hdlChol: patient.hdlChol,
                  ldlChol: patient.ldlChol,
                  triglycerides: patient.triglycerides,
                  unit: patient.unit,
                  hasAscvd: patient.hasAscvd,
                  ascvdType: patient.ascvdType,
                  diabetes: patient.diabetes,
                  dmDuration: patient.dmDuration,
                  dmTargetOrganDamage: patient.dmTargetOrganDamage,
                  dmRiskFactorsCount: patient.dmRiskFactorsCount,
                  ckd: patient.ckd,
                  hasFh: patient.hasFh,
                  fhHasMajorRiskFactor: patient.fhHasMajorRiskFactor,
                  hasSubclinicalPlaque: patient.hasSubclinicalPlaque,
                  hasPrematureFamilyHistory: patient.hasPrematureFamilyHistory,
                  hasLpaElevated: patient.hasLpaElevated,
                  hasHiv: patient.hasHiv,
                  hasCancerToxicityRisk: patient.hasCancerToxicityRisk,
                  useDietarySupplements: patient.useDietarySupplements,
                }
              };
            }
            return v;
          });
          return { ...p, visits: updatedVisits };
        }
        return p;
      });
    });
  }, [patient]);

  // AI chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load API key from local storage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowKeyInput(true);
    }
  }, []);

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingAi]);

  const saveApiKey = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    setKeyStatus(t[lang].keySaved);
    setTimeout(() => {
      setKeyStatus("");
      setShowKeyInput(false);
    }, 1500);
  };

  // Automated clinical risk assessment
  const assessment = calculateRisk(patient);

  // Helper to determine the LDL column index in Table 4
  const getLdlColumnIndex = () => {
    const ldlVal = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
    if (ldlVal < 1.4) return 0;
    if (ldlVal < 1.8) return 1;
    if (ldlVal < 2.6) return 2;
    if (ldlVal < 3.0) return 3;
    if (ldlVal < 4.9) return 4;
    return 5;
  };

  // Helper to determine row index in Table 4
  const getRowIndex = () => {
    if (assessment.rowType === "low") return 0;
    if (assessment.rowType === "moderate") return 1;
    if (assessment.rowType === "high") return 2;
    if (assessment.rowType === "very_high_primary") return 3;
    return 4; // very_high_secondary
  };

  const colIdx = getLdlColumnIndex();
  const rowIdx = getRowIndex();

  // Target LDL goals
  const getLdlGoal = () => {
    if (assessment.riskCategory === "very_high") return 1.4;
    if (assessment.riskCategory === "high") return 1.8;
    if (assessment.riskCategory === "moderate") return 2.6;
    return 3.0; // low risk
  };

  const targetGoalMmol = getLdlGoal();
  const targetGoalMg = Math.round(targetGoalMmol * 38.67);
  const currentLdlMmol = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
  const currentLdlMg = patient.unit === "mmol" ? Math.round(patient.ldlChol * 38.67) : patient.ldlChol;

  const currentValDisp = patient.unit === "mmol" ? patient.ldlChol : currentLdlMg;
  const goalValDisp = patient.unit === "mmol" ? targetGoalMmol : targetGoalMg;

  const reductionNeededPct = currentLdlMmol > targetGoalMmol
    ? Math.round(((currentLdlMmol - targetGoalMmol) / currentLdlMmol) * 100)
    : 0;

  // Perform AI diagnostic calculation
  const triggerAiAudit = async () => {
    setLoadingAi(true);
    setAiError("");
    setChatHistory([]);

    const result = await analyzePatientCardioRisk(
      patient,
      [],
      apiKey,
      aiModel
    );

    setLoadingAi(false);
    if (result.success && result.content) {
      setChatHistory([{ role: "assistant", content: result.content }]);
    } else {
      setAiError(result.error || "Có lỗi xảy ra khi phân tích.");
    }
  };

  // Handle follow up chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { role: "user" as const, content: userInput }];
    setChatHistory(newHistory);
    setUserInput("");
    setLoadingAi(true);
    setAiError("");

    const result = await analyzePatientCardioRisk(
      patient,
      newHistory,
      apiKey,
      aiModel
    );

    setLoadingAi(false);
    if (result.success && result.content) {
      setChatHistory([...newHistory, { role: "assistant", content: result.content }]);
    } else {
      setAiError(result.error || "Có lỗi xảy ra khi trao đổi.");
    }
  };

  // Download AI clinical report
  const downloadReport = () => {
    if (chatHistory.length === 0) return;
    const element = document.createElement("a");
    const file = new Blob([chatHistory[0].content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `CardioShield_Report_${patient.name || "Patient"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyReportToClipboard = () => {
    if (chatHistory.length === 0) return;
    navigator.clipboard.writeText(chatHistory[0].content);
    alert(t[lang].copied);
  };

  // Calculate automatically non-HDL
  const calculatedNonHdlVal = (patient.totalChol - patient.hdlChol).toFixed(2);

  // Dynamic clinical risk calculations (Table 3 promotion logic)
  function calculateRisk(patient: PatientData) {
    const reasons: string[] = [];
    let riskCategory: "low" | "moderate" | "high" | "very_high" = "low";
    let rowType: "low" | "moderate" | "high" | "very_high_primary" | "very_high_secondary" = "low";

    const ldlMmol = patient.unit === "mg" ? patient.ldlChol / 38.67 : patient.ldlChol;
    const tcMmol = patient.unit === "mg" ? patient.totalChol / 38.67 : patient.totalChol;

    const nonHdl = patient.totalChol - patient.hdlChol;
    const nonHdlMmol = patient.unit === "mg" ? nonHdl / 38.67 : nonHdl;

    // Custom mathematical approximation of SCORE2/SCORE2-OP 10-year CVD risk percentage
    const ageFactor = (patient.age - 60) * 0.07;
    const sbpFactor = (patient.sbp - 120) * 0.025;
    const cholFactor = (nonHdlMmol - 3.0) * 0.28;
    const smokeFactor = patient.smokingStatus ? 0.65 : 0;
    const sexFactor = patient.sex === "female" ? -0.45 : 0;
    const regionFactor = patient.riskRegion === "low" ? -0.6 : patient.riskRegion === "moderate" ? 0 : patient.riskRegion === "high" ? 0.45 : 0.9;

    const baseLogit = -2.6 + ageFactor + sbpFactor + cholFactor + smokeFactor + sexFactor + regionFactor;
    let estimatedScore2 = 100 / (1 + Math.exp(-baseLogit));
    estimatedScore2 = Math.min(Math.max(estimatedScore2, 0.5), 50.0);

    // Apply absolute promotional conditions in Table 3:

    // 1. Force High or Very High if untreated LDL-C >= 4.9 mmol/L (>= 190 mg/dL)
    const hasExtremeLdl = ldlMmol >= 4.9;

    // VERY HIGH RISK
    if (patient.hasAscvd) {
      riskCategory = "very_high";
      rowType = "very_high_secondary";
      reasons.push(lang === "vi"
        ? "Đã xác định Bệnh tim mạch do xơ vữa (Documented ASCVD) - Bắt buộc phòng ngừa thứ phát"
        : "Documented Atherosclerotic Cardiovascular Disease (ASCVD) - Secondary Prevention");
    } else {
      let isVeryHigh = false;

      if (patient.diabetes !== "none" && (patient.dmTargetOrganDamage || patient.dmDuration > 20 || patient.dmRiskFactorsCount >= 3)) {
        isVeryHigh = true;
        reasons.push(lang === "vi"
          ? "Đái tháo đường (DM) đi kèm tổn thương cơ quan đích, thời gian mắc >20 năm, hoặc có >=3 yếu tố nguy cơ chính"
          : "Diabetes Mellitus with target organ damage, duration >20 years, or >=3 major risk factors");
      }
      if (patient.ckd === "severe") {
        isVeryHigh = true;
        reasons.push(lang === "vi"
          ? "Bệnh thận mạn nặng (Severe CKD: eGFR < 30 mL/min/1.73 m²)"
          : "Severe Chronic Kidney Disease (CKD: eGFR < 30 mL/min/1.73 m²)");
      }
      if (patient.hasFh && patient.fhHasMajorRiskFactor) {
        isVeryHigh = true;
        reasons.push(lang === "vi"
          ? "Tăng cholesterol máu gia đình (FH) kèm bệnh lý xơ vữa hoặc kèm yếu tố nguy cơ chính khác"
          : "Familial Hypercholesterolaemia (FH) with ASCVD or another major risk factor");
      }
      if (estimatedScore2 >= 20.0) {
        isVeryHigh = true;
        reasons.push(lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm cực cao: ${estimatedScore2.toFixed(1)}% (>= 20%)`
          : `Extremely high calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (>= 20%)`);
      }

      if (isVeryHigh) {
        riskCategory = "very_high";
        rowType = "very_high_primary";
      }
    }

    // HIGH RISK (if not already very high)
    if (riskCategory !== "very_high") {
      let isHigh = false;

      if (tcMmol > 8.0) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? `Cholesterol toàn phần tăng cực mạnh: ${patient.totalChol} ${patient.unit} (> 8.0 mmol/L / 310 mg/dL)`
          : `Markedly elevated single risk factor: Total Cholesterol > 8.0 mmol/L / 310 mg/dL`);
      }
      if (hasExtremeLdl) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? `LDL Cholesterol tăng cực cao (Chưa điều trị): ${patient.ldlChol} ${patient.unit} (>= 4.9 mmol/L / 190 mg/dL) - Tự động nâng nguy cơ tim mạch lên ít nhất nhóm CAO`
          : `Markedly elevated single risk factor: Untreated LDL-C >= 4.9 mmol/L / 190 mg/dL - Promotes risk level to at least HIGH`);
      }
      if (patient.sbp >= 180 || patient.dbp >= 110) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? `Huyết áp tăng độ 3 rất nặng: ${patient.sbp}/${patient.dbp} mmHg (>= 180/110 mmHg)`
          : `Markedly elevated single risk factor: Severe Blood Pressure >= 180/110 mmHg`);
      }
      if (patient.hasFh && !patient.fhHasMajorRiskFactor) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? "Tăng cholesterol máu gia đình (FH) đơn thuần không đi kèm yếu tố nguy cơ khác"
          : "Familial Hypercholesterolaemia (FH) without other major risk factors");
      }
      if (patient.diabetes !== "none" && (patient.dmDuration >= 10 || patient.dmRiskFactorsCount >= 1)) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? "Đái tháo đường không tổn thương cơ quan đích nhưng có thời gian mắc >=10 năm hoặc có 1 yếu tố nguy cơ kèm theo"
          : "Diabetes Mellitus without organ damage but duration >=10 years or with 1 major risk factor");
      }
      if (patient.ckd === "moderate") {
        isHigh = true;
        reasons.push(lang === "vi"
          ? "Bệnh thận mạn mức độ trung bình (Moderate CKD: eGFR 30-59 mL/min/1.73 m²)"
          : "Moderate Chronic Kidney Disease (CKD: eGFR 30-59 mL/min/1.73 m²)");
      }
      if (estimatedScore2 >= 10.0 && estimatedScore2 < 20.0) {
        isHigh = true;
        reasons.push(lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm cao: ${estimatedScore2.toFixed(1)}% (10% - <20%)`
          : `High calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (10% - <20%)`);
      }

      if (isHigh) {
        riskCategory = "high";
        rowType = "high";
      }
    }

    // MODERATE RISK (if not very high or high)
    if (riskCategory !== "very_high" && riskCategory !== "high") {
      let isModerate = false;

      if (patient.diabetes !== "none") {
        if (patient.diabetes === "t1dm" && patient.age < 35 && patient.dmDuration < 10) {
          isModerate = true;
          reasons.push(lang === "vi"
            ? "Bệnh nhân ĐTĐ T1DM trẻ tuổi (< 35 tuổi), thời gian mắc bệnh ngắn < 10 năm và không có yếu tố nguy cơ khác"
            : "Young patient with T1DM (< 35 years) and duration < 10 years, without other risk factors");
        } else if (patient.diabetes === "t2dm" && patient.age < 50 && patient.dmDuration < 10) {
          isModerate = true;
          reasons.push(lang === "vi"
            ? "Bệnh nhân ĐTĐ T2DM trẻ tuổi (< 50 tuổi), thời gian mắc bệnh ngắn < 10 năm và không có yếu tố nguy cơ khác"
            : "Young patient with T2DM (< 50 years) and duration < 10 years, without other risk factors");
        }
      }

      if (estimatedScore2 >= 2.0 && estimatedScore2 < 10.0) {
        isModerate = true;
        reasons.push(lang === "vi"
          ? `Điểm SCORE2/SCORE2-OP 10 năm ở mức trung bình: ${estimatedScore2.toFixed(1)}% (2% - <10%)`
          : `Moderate calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (2% - <10%)`);
      }

      if (isModerate) {
        riskCategory = "moderate";
        rowType = "moderate";
      }
    }

    // LOW RISK
    if (riskCategory === "low") {
      rowType = "low";
      reasons.push(lang === "vi"
        ? `Điểm SCORE2/SCORE2-OP 10 năm thấp: ${estimatedScore2.toFixed(1)}% (< 2%) và không có bệnh lý đi kèm đặc biệt`
        : `Low calculated 10-year SCORE2/SCORE2-OP: ${estimatedScore2.toFixed(1)}% (< 2%) without pre-existing conditions`);
    }

    // Apply clinical modifiers to potential risk reclassification
    // e.g. elevated Lp(a) or subclinical plaque could support reclassification around thresholds
    const hasModifiers = patient.hasLpaElevated || patient.hasSubclinicalPlaque || patient.hasPrematureFamilyHistory;
    if (hasModifiers && (riskCategory === "low" || riskCategory === "moderate")) {
      const modifierLabels = [];
      if (patient.hasLpaElevated) modifierLabels.push("Lipoprotein(a) > 50 mg/dL");
      if (patient.hasSubclinicalPlaque) modifierLabels.push(lang === "vi" ? "Mảng xơ vữa cận lâm sàng" : "Subclinical plaque");
      if (patient.hasPrematureFamilyHistory) modifierLabels.push(lang === "vi" ? "Tiền sử gia đình mắc bệnh sớm" : "Premature family history");

      reasons.push(lang === "vi"
        ? `* Yếu tố bổ trợ hiện diện (${modifierLabels.join(", ")}): Khuyến nghị lâm sàng xem xét nâng phân tầng điều trị do các mảng xơ vữa cận lâm sàng và Lp(a) làm tăng nguy cơ thực tế.`
        : `* Risk modifiers present (${modifierLabels.join(", ")}): Clinical judgment suggests reclassifying to a higher treatment intensity due to subclinical burden.`);
    }

    return {
      riskCategory,
      reasons,
      rowType,
      estimatedScore2
    };
  }

  // Get table cell styling based on active/inactive status
  const getCellClass = (r: number, c: number) => {
    const isTarget = r === rowIdx && c === colIdx;

    // Check if cell is N/A (Low/Moderate risk with LDL >= 4.9 is N/A because Table 3 elevates it)
    const isNA = (r === 0 || r === 1) && c === 5;

    let base = "p-3 text-xs text-center border transition-all duration-300 relative ";

    // Determine the baseline color category based on standard ESC 2025 table color map
    let colorClass = "";
    if (isNA) {
      colorClass = "bg-slate-100 text-slate-400 border-slate-200/60 line-through select-none";
    } else {
      if (r === 0) { // Low
        if (c <= 3) colorClass = "bg-emerald-600 text-white border-emerald-700";
        else if (c === 4) colorClass = "bg-yellow-400 text-slate-900 border-yellow-500";
      } else if (r === 1) { // Moderate
        if (c <= 2) colorClass = "bg-emerald-600 text-white border-emerald-700";
        else if (c === 3 || c === 4) colorClass = "bg-yellow-400 text-slate-900 border-yellow-500";
      } else if (r === 2) { // High
        if (c <= 1) colorClass = "bg-emerald-600 text-white border-emerald-700";
        else if (c === 2) colorClass = "bg-yellow-400 text-slate-900 border-yellow-500";
        else colorClass = "bg-red-700 text-white border-red-800";
      } else if (r === 3) { // Very High: Primary
        if (c === 0 || c === 1) colorClass = "bg-yellow-400 text-slate-900 border-yellow-500";
        else colorClass = "bg-red-700 text-white border-red-800";
      } else if (r === 4) { // Very High: Secondary
        colorClass = "bg-red-700 text-white border-red-800";
      }
    }

    base += colorClass + " ";

    if (isTarget) {
      base += "ring-4 ring-blue-500 ring-offset-2 ring-offset-white font-extrabold scale-[1.03] z-10 shadow-[0_8px_20px_rgba(59,130,246,0.35)] ";
    } else {
      base += "hover:brightness-105 ";
    }

    return base;
  };

  const tcInfo = getInputSeverity("totalChol", patient.totalChol);
  const hdlInfo = getInputSeverity("hdlChol", patient.hdlChol);
  const ldlInfo = getInputSeverity("ldlChol", patient.ldlChol);
  const tgInfo = getInputSeverity("triglycerides", patient.triglycerides);
  const sbpInfo = getInputSeverity("sbp", patient.sbp);
  const dbpInfo = getInputSeverity("dbp", patient.dbp);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">

      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center animate-pulse">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-slate-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
              {t[lang].title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {t[lang].subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* OpenRouter Key Toggle */}
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${apiKey
                ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100/70"
                : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/70"
              }`}
          >
            <Key className="w-4 h-4" />
            <span>{apiKey ? "API Key Loaded" : "No API Key"}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            <Languages className="w-4 h-4 text-blue-500" />
            <span>{lang === "vi" ? "English" : "Tiếng Việt"}</span>
          </button>
        </div>
      </header>

      {/* API Key Modal / Expandable Panel */}
      {showKeyInput && (
        <div className="bg-slate-100 border-b border-slate-200 p-4 transition-all duration-300">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {t[lang].enterApiKey}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-white border border-slate-350 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Model Selector */}
            <div className="w-full md:w-64">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {t[lang].modelSelect}
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-white border border-slate-350 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="deepseek/deepseek-v4-flash:free">DeepSeek v4 Flash (Free)</option>
                <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Recom.)</option>
                <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro (Deep)</option>
                <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B Instruct</option>
              </select>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={saveApiKey}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {t[lang].saveKey}
              </button>
            </div>
          </div>
          {keyStatus && (
            <p className="text-center text-xs text-blue-600 mt-2 font-medium">
              {keyStatus}
            </p>
          )}
        </div>
      )}

      {/* Main Grid Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* Fatal Outcome alert block */}
        {activeVisit?.isFatalOutcome && (
          <div className="bg-gradient-to-r from-rose-600 to-red-700 border border-rose-700 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-center gap-4 animate-pulse">
            <AlertTriangle className="w-10 h-10 shrink-0 text-rose-100" />
            <div>
              <h3 className="font-bold text-base uppercase tracking-wider">Cảnh báo: Bệnh nhân không qua khỏi (Tử vong)</h3>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                Bệnh nhân đã tử vong đột ngột do Nhồi máu cơ tim cấp diện rộng tái phát vào tuần 36. 
                Giao diện điều chỉnh lâm sàng đã bị khóa để lưu trữ hồ sơ bệnh án lịch sử. 
                Đây là trường hợp lâm sàng thực tế phản ánh nguy cơ tim mạch tồn dư cực cao ở bệnh nhân có CKD nặng, Đái tháo đường biến chứng thận và nồng độ Lp(a) tăng vọt vượt ngưỡng.
              </p>
            </div>
          </div>
        )}

        {/* Longitudinal Patient & Visit Selection Header */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Quản lý Bệnh nhân & Theo dõi Dọc (ESC 2025)
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Chọn bệnh nhân để theo dõi hành trình điều trị rối loạn lipid máu qua các lần tái khám.</p>
            </div>
            
            {/* Patient Selector */}
            <div className="flex flex-wrap gap-2">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePatientId(p.id);
                    setActiveVisitIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    activePatientId === p.id
                      ? p.status === "deceased"
                        ? "bg-rose-50 text-rose-600 border-rose-250 ring-2 ring-rose-500/20"
                        : "bg-blue-50 text-blue-600 border-blue-200 ring-2 ring-blue-500/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {p.id === "patient1" ? "BN 1 (Tăng lipid máu FH)" : p.id === "patient2" ? "BN 2 (Bệnh mạch vành ACS)" : "BN 3 (Suy thận + ĐTĐ)"}
                </button>
              ))}
            </div>
          </div>

          {/* Visits Timeline */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hành trình tái khám (Visits Timeline):</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {activePatient?.visits.map((v, idx) => {
                const isSelected = activeVisitIndex === idx;
                const isFatal = v.isFatalOutcome;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveVisitIndex(idx)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isFatal
                          ? "bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-500/20"
                          : "bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20"
                        : isFatal
                        ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {isFatal ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{v.visitDate}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical notes for the current visit */}
          {activeVisit && (
            <div className={`p-3.5 rounded-xl border ${
              activeVisit.isFatalOutcome 
                ? "bg-rose-50 border-rose-200 text-rose-800" 
                : "bg-blue-50/40 border-blue-100 text-slate-700"
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                {activeVisit.isFatalOutcome ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Brain className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                <span>{activeVisit.isFatalOutcome ? "Diễn biến lâm sàng đặc biệt" : "Ghi chú Lâm sàng & Thuốc điều trị"}</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">{activeVisit.clinicalNotes}</p>
            </div>
          )}
        </section>

        {/* Clinical Inputs */}
        <section className={`flex flex-col gap-6 w-full ${activeVisit?.isFatalOutcome ? "pointer-events-none opacity-60" : ""}`}>

          {/* Card 1: Demographics */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-4">
              <User className="w-4 h-4" />
              {t[lang].demographics}
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].name}</label>
                <input
                  type="text"
                  placeholder="e.g. Nguyen Van A"
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].age}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                    className="w-20 bg-slate-50/50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-2 py-2 text-sm text-slate-800 text-center focus:outline-none"
                  />
                  <input
                    type="range"
                    min="35"
                    max="90"
                    value={patient.age}
                    onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-3 accent-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].sex}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPatient({ ...patient, sex: "male" })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${patient.sex === "male"
                        ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                        : "bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100/50"
                      }`}
                  >
                    {t[lang].male}
                  </button>
                  <button
                    onClick={() => setPatient({ ...patient, sex: "female" })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${patient.sex === "female"
                        ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                        : "bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100/50"
                      }`}
                  >
                    {t[lang].female}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                  <span>{t[lang].riskRegion}</span>
                  <span title="Europe is split into Low, Mod, High, Very High countries based on CVD mortality rates. Western Europe is typically Low, Eastern Europe is Very High.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </span>
                </label>
                <select
                  value={patient.riskRegion}
                  onChange={(e: any) => setPatient({ ...patient, riskRegion: e.target.value })}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="low">{t[lang].low}</option>
                  <option value="moderate">{t[lang].moderate}</option>
                  <option value="high">{t[lang].high}</option>
                  <option value="very_high">{t[lang].very_high}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Lipid Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t[lang].lipidPanel}
              </h2>

              {/* Unit Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => {
                    if (patient.unit === "mg") {
                      setPatient({
                        ...patient,
                        unit: "mmol",
                        totalChol: parseFloat((patient.totalChol / 38.67).toFixed(1)),
                        hdlChol: parseFloat((patient.hdlChol / 38.67).toFixed(1)),
                        ldlChol: parseFloat((patient.ldlChol / 38.67).toFixed(1)),
                        triglycerides: parseFloat((patient.triglycerides / 88.57).toFixed(1))
                      });
                    }
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${patient.unit === "mmol" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  mmol/L
                </button>
                <button
                  onClick={() => {
                    if (patient.unit === "mmol") {
                      setPatient({
                        ...patient,
                        unit: "mg",
                        totalChol: Math.round(patient.totalChol * 38.67),
                        hdlChol: Math.round(patient.hdlChol * 38.67),
                        ldlChol: Math.round(patient.ldlChol * 38.67),
                        triglycerides: Math.round(patient.triglycerides * 88.57)
                      });
                    }
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${patient.unit === "mg" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  mg/dL
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].totalChol}</label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.totalChol}
                  onChange={(e) => setPatient({ ...patient, totalChol: parseFloat(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:outline-none ${tcInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${tcInfo.textClass}`}>{tcInfo.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].hdlChol}</label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.hdlChol}
                  onChange={(e) => setPatient({ ...patient, hdlChol: parseFloat(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:outline-none ${hdlInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${hdlInfo.textClass}`}>{hdlInfo.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-600 mb-1.5 font-bold">{t[lang].ldlChol}</label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.ldlChol}
                  onChange={(e) => setPatient({ ...patient, ldlChol: parseFloat(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-semibold transition-all focus:outline-none ${ldlInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${ldlInfo.textClass}`}>{ldlInfo.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].triglycerides}</label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.triglycerides}
                  onChange={(e) => setPatient({ ...patient, triglycerides: parseFloat(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:outline-none ${tgInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${tgInfo.textClass}`}>{tgInfo.text}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/30 rounded-xl border border-blue-100 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">{t[lang].calculatedNonHdl}: </span>
                <span className="text-blue-600 font-bold">{calculatedNonHdlVal} {patient.unit === "mmol" ? "mmol/L" : "mg/dL"}</span>
                <p className="mt-0.5 text-[10px] text-slate-400">{t[lang].nonHdlText}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Blood Pressure & Smoking */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" />
              {t[lang].bpAndLifestyle}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].sbp}</label>
                <input
                  type="number"
                  value={patient.sbp}
                  onChange={(e) => setPatient({ ...patient, sbp: parseInt(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:outline-none ${sbpInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${sbpInfo.textClass}`}>{sbpInfo.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t[lang].dbp}</label>
                <input
                  type="number"
                  value={patient.dbp}
                  onChange={(e) => setPatient({ ...patient, dbp: parseInt(e.target.value) || 0 })}
                  className={`w-full border rounded-xl px-3 py-2 text-sm transition-all focus:outline-none ${dbpInfo.borderClass}`}
                />
                <p className={`text-[10px] mt-1.5 leading-tight ${dbpInfo.textClass}`}>{dbpInfo.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">{t[lang].smoking}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPatient({ ...patient, smokingStatus: true })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${patient.smokingStatus === true
                        ? "bg-rose-50 text-rose-600 border-rose-250 shadow-sm"
                        : "bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100/50"
                      }`}
                  >
                    {t[lang].smoker}
                  </button>
                  <button
                    onClick={() => setPatient({ ...patient, smokingStatus: false })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${patient.smokingStatus === false
                        ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                        : "bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100/50"
                      }`}
                  >
                    {t[lang].nonSmoker}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: High Risk Conditions (Table 3 promotion) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              {t[lang].highRiskConditions}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Documented ASCVD */}
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                patient.hasAscvd 
                  ? "border-rose-500 bg-rose-50/30" 
                  : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">{t[lang].hasAscvd}</label>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{t[lang].ascvdHelp}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasAscvd}
                    onChange={(e) => setPatient({ ...patient, hasAscvd: e.target.checked })}
                    className="w-4.5 h-4.5 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasAscvd && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200 grid grid-cols-2 gap-2 animate-fadeIn">
                    <button
                      onClick={() => setPatient({ ...patient, ascvdType: "secondary" })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${patient.ascvdType === "secondary"
                          ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200"
                        }`}
                    >
                      {lang === "vi" ? "Thứ phát (Mắc rồi)" : "Secondary Prevention"}
                    </button>
                    <button
                      onClick={() => setPatient({ ...patient, ascvdType: "primary" })}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${patient.ascvdType === "primary"
                          ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200"
                        }`}
                    >
                      {lang === "vi" ? "Tiên phát (Chưa lâm sàng)" : "Primary Prevention"}
                    </button>
                  </div>
                )}
                {patient.hasAscvd && (
                  <p className="text-[10px] text-rose-600 mt-2 font-semibold">
                    {lang === "vi" 
                      ? "⚠️ Đã xác định ASCVD: Bệnh nhân tự động xếp vào Nguy cơ RẤT CAO theo ESC 2025. Không cần xét SCORE2!"
                      : "⚠️ Documented ASCVD: Patient is automatically classified as VERY HIGH risk. SCORE2 is bypassed."}
                  </p>
                )}
              </div>

              {/* Diabetes */}
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                patient.diabetes !== "none" 
                  ? patient.dmTargetOrganDamage 
                    ? "border-rose-500 bg-rose-50/30" 
                    : "border-yellow-500 bg-yellow-50/20" 
                  : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 block">{t[lang].diabetes}</label>
                  <select
                    value={patient.diabetes}
                    onChange={(e: any) => setPatient({ ...patient, diabetes: e.target.value })}
                    className="bg-white border border-slate-250 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="none">{lang === "vi" ? "Không mắc" : "None"}</option>
                    <option value="t1dm">T1DM (Tuýp 1)</option>
                    <option value="t2dm">T2DM (Tuýp 2)</option>
                  </select>
                </div>
                {patient.diabetes !== "none" && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-col gap-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-500">{t[lang].dmDuration}</label>
                      <input
                        type="number"
                        min="0"
                        value={patient.dmDuration}
                        onChange={(e) => setPatient({ ...patient, dmDuration: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-white border border-slate-250 rounded px-1.5 py-0.5 text-center text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] text-slate-700 block">{t[lang].dmTargetOrganDamage}</label>
                        <span className="text-[9px] text-slate-500 leading-none">{t[lang].dmTargetOrganHelp}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={patient.dmTargetOrganDamage}
                        onChange={(e) => setPatient({ ...patient, dmTargetOrganDamage: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-white border-slate-350 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-500">{t[lang].dmRiskFactorsCount} (Huyết áp, Hút thuốc, Lipid cao)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={patient.dmRiskFactorsCount}
                        onChange={(e) => setPatient({ ...patient, dmRiskFactorsCount: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-white border border-slate-250 rounded px-1.5 py-0.5 text-center text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <p className={`text-[10px] mt-1 font-semibold ${patient.dmTargetOrganDamage ? "text-rose-600" : "text-yellow-600"}`}>
                      {patient.dmTargetOrganDamage 
                        ? (lang === "vi" 
                            ? "⚠️ Đái tháo đường có tổn thương cơ quan đích → Tự động xếp vào Nguy cơ RẤT CAO!" 
                            : "⚠️ Diabetes with target organ damage → Automatically classified as VERY HIGH risk!")
                        : (lang === "vi"
                            ? "⚠️ Đái tháo đường không biến chứng tổn thương cơ quan đích → Xếp vào Nguy cơ CAO hoặc TRUNG BÌNH tùy thời gian mắc và yếu tố nguy cơ kèm theo."
                            : "⚠️ Diabetes without organ damage → Classified as HIGH or MODERATE risk depending on duration and risk factors.")}
                    </p>
                  </div>
                )}
              </div>

              {/* CKD */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-2 ${
                patient.ckd === "severe" 
                  ? "border-rose-500 bg-rose-50/30" 
                  : patient.ckd === "moderate"
                  ? "border-yellow-500 bg-yellow-50/20"
                  : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">{t[lang].ckd}</label>
                  <select
                    value={patient.ckd}
                    onChange={(e: any) => setPatient({ ...patient, ckd: e.target.value })}
                    className="bg-white border border-slate-250 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="none">{lang === "vi" ? "Không mắc hoặc Nhẹ (eGFR >= 60)" : "None/Mild (eGFR >= 60)"}</option>
                    <option value="moderate">{lang === "vi" ? "Trung bình (eGFR 30-59)" : "Moderate (eGFR 30-59)"}</option>
                    <option value="severe">{lang === "vi" ? "Nặng (eGFR < 30)" : "Severe (eGFR < 30)"}</option>
                  </select>
                </div>
                {patient.ckd !== "none" && (
                  <p className={`text-[10px] font-semibold ${patient.ckd === "severe" ? "text-rose-600" : "text-yellow-600"}`}>
                    {patient.ckd === "severe"
                      ? (lang === "vi" 
                          ? "⚠️ Bệnh thận mạn giai đoạn Nặng (eGFR < 30 mL/min) → Tự động xếp vào Nguy cơ RẤT CAO!" 
                          : "⚠️ Severe CKD (eGFR < 30 mL/min) → Automatically classified as VERY HIGH risk!")
                      : (lang === "vi"
                          ? "⚠️ Bệnh thận mạn giai đoạn Trung bình (eGFR 30-59 mL/min) → Tự động xếp vào Nguy cơ CAO!"
                          : "⚠️ Moderate CKD (eGFR 30-59 mL/min) → Automatically classified as HIGH risk!")}
                  </p>
                )}
              </div>

              {/* Familial Hypercholesterolemia */}
              <div className={`p-3 rounded-xl border transition-all duration-300 ${
                patient.hasFh 
                  ? "border-rose-500 bg-rose-50/30" 
                  : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">{t[lang].fh}</label>
                  <input
                    type="checkbox"
                    checked={patient.hasFh}
                    onChange={(e) => setPatient({ ...patient, hasFh: e.target.checked })}
                    className="w-4.5 h-4.5 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasFh && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200 flex items-center justify-between animate-fadeIn">
                    <label className="text-[11px] text-slate-500 leading-tight max-w-[200px]">{t[lang].fhRiskHelp}</label>
                    <input
                      type="checkbox"
                      checked={patient.fhHasMajorRiskFactor}
                      onChange={(e) => setPatient({ ...patient, fhHasMajorRiskFactor: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-350 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}
                {patient.hasFh && (
                  <p className="text-[10px] text-rose-600 mt-2 font-semibold">
                    {patient.fhHasMajorRiskFactor
                      ? (lang === "vi" 
                          ? "⚠️ Tăng cholesterol máu gia đình (FH) đi kèm yếu tố nguy cơ chính khác hoặc kèm theo ASCVD → Tự động xếp vào Nguy cơ RẤT CAO!" 
                          : "⚠️ Familial Hypercholesterolemia (FH) with another major risk factor or ASCVD → Classified as VERY HIGH risk!")
                      : (lang === "vi"
                          ? "⚠️ Tăng cholesterol máu gia đình (FH) đơn thuần không có yếu tố nguy cơ khác → Tự động xếp vào Nguy cơ CAO!"
                          : "⚠️ Familial Hypercholesterolemia (FH) alone without other major risk factors → Classified as HIGH risk!")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Modifiers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300/60 transition-all duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" />
              {t[lang].modifiers}
            </h2>
            <div className="flex flex-col gap-3">
              {/* Plaque / CAC */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.hasSubclinicalPlaque 
                  ? "border-yellow-400 bg-yellow-50/20" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-slate-800 block">{t[lang].hasSubclinicalPlaque}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Làm tăng phân lớp điều trị nếu ở ranh giới" : "Can prompt higher therapy intensity"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasSubclinicalPlaque}
                    onChange={(e) => setPatient({ ...patient, hasSubclinicalPlaque: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasSubclinicalPlaque && (
                  <p className="text-[10px] text-yellow-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "⚡ Có mảng xơ vữa hoặc CAC >300: Yếu tố thúc đẩy điều trị tích cực hơn ngay cả khi chỉ số SCORE2 ở mức ranh giới."
                      : "⚡ Plaque/CAC >300 present: Modifies risk upward, favoring aggressive lipid-lowering therapy."}
                  </p>
                )}
              </div>

              {/* Premature family history */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.hasPrematureFamilyHistory 
                  ? "border-yellow-400 bg-yellow-50/20" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-slate-800 block">{t[lang].hasPrematureFamilyHistory}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Nam <55 tuổi, Nữ <60 tuổi" : "Male <55, Female <60"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasPrematureFamilyHistory}
                    onChange={(e) => setPatient({ ...patient, hasPrematureFamilyHistory: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasPrematureFamilyHistory && (
                  <p className="text-[10px] text-yellow-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "⚡ Tiền sử gia đình mắc bệnh tim mạch sớm: Làm tăng gấp 1.5 - 2 lần nguy cơ tim mạch thực tế của bệnh nhân so với tính toán lý thuyết."
                      : "⚡ Premature family history: Multiplies calculated cardiovascular risk by 1.5 - 2.0x."}
                  </p>
                )}
              </div>

              {/* Elevated Lp(a) */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.hasLpaElevated 
                  ? "border-rose-500 bg-rose-50/30" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-slate-800 block">{t[lang].hasLpaElevated}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Lp(a) >50 mg/dL (105 nmol/L) - Yếu tố nguy cơ chính 2025" : "Lp(a) >50 mg/dL (105 nmol/L)"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasLpaElevated}
                    onChange={(e) => setPatient({ ...patient, hasLpaElevated: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasLpaElevated && (
                  <p className="text-[10px] text-rose-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "⚠️ Lipoprotein(a) tăng rất cao: Đây là yếu tố di truyền gây xơ vữa và huyết khối cực mạnh, được ESC 2025 nâng thành yếu tố nguy cơ độc lập chính. Chỉ định hạ lipid tích cực!"
                      : "⚠️ Extremely elevated Lp(a): Strong genetic driver of atherosclerosis. Upgraded to a major independent risk modifier in 2025."}
                  </p>
                )}
              </div>

              {/* HIV */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.hasHiv 
                  ? "border-emerald-500 bg-emerald-50/20" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-slate-800 block">{t[lang].hasHiv}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Cập nhật 2025: Chỉ định Statin ngay (Class I, REPRIEVE)" : "REPRIEVE: Statin indicated regardless of LDL-C"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasHiv}
                    onChange={(e) => setPatient({ ...patient, hasHiv: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasHiv && (
                  <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "🟢 Hướng dẫn mới 2025 (REPRIEVE): Khuyến cáo chỉ định Statin phòng ngừa tiên phát ngay cho bệnh nhân nhiễm HIV ≥40 tuổi (Class I), bất kể điểm SCORE2 hay mức LDL-C nền ban đầu!"
                      : "🟢 New 2025 Guideline (REPRIEVE): Primary prevention statin is recommended for HIV patients aged ≥40 (Class I) regardless of risk scores."}
                  </p>
                )}
              </div>

              {/* Cancer Toxicity */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.hasCancerToxicityRisk 
                  ? "border-emerald-500 bg-emerald-50/20" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-slate-800 block">{t[lang].hasCancerToxicityRisk}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Cập nhật 2025: Dùng statin bảo vệ tim do hóa trị (STOP-CA)" : "STOP-CA: Cardioprotection during chemotherapy"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.hasCancerToxicityRisk}
                    onChange={(e) => setPatient({ ...patient, hasCancerToxicityRisk: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-350 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                </div>
                {patient.hasCancerToxicityRisk && (
                  <p className="text-[10px] text-emerald-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "🟢 Hướng dẫn mới 2025 (STOP-CA): Bệnh nhân ung thư đang điều trị hóa chất có độc tính tim (anthracyclines) được khuyến cáo dùng statin để bảo vệ cơ tim, ngăn ngừa suy tim do hóa trị."
                      : "🟢 New 2025 Guideline (STOP-CA): Statin therapy protects against chemotherapy-induced cardiotoxicity during anthracycline treatment."}
                  </p>
                )}
              </div>

              {/* Dietary Supplements */}
              <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                patient.useDietarySupplements 
                  ? "border-rose-450 bg-rose-50/25" 
                  : "bg-slate-50/40 border-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <label className="text-xs font-semibold text-rose-600 block">{t[lang].useDietarySupplements}</label>
                    <span className="text-[10px] text-slate-500">{lang === "vi" ? "Cập nhật 2025: KHÔNG khuyên dùng hạ tim mạch (Class III, SPORT)" : "Class III: Not recommended for CVD protection"}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={patient.useDietarySupplements}
                    onChange={(e) => setPatient({ ...patient, useDietarySupplements: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 bg-white border-slate-350 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                  />
                </div>
                {patient.useDietarySupplements && (
                  <p className="text-[10px] text-rose-600 font-semibold leading-tight">
                    {lang === "vi"
                      ? "⚠️ Cảnh báo mới 2025 (SPORT): Thực phẩm chức năng hạ lipid tự phát (như men gạo đỏ, tỏi, phytosterols) KHÔNG có bằng chứng lâm sàng giúp giảm tiêu chí gộp tim mạch và có nguy cơ trì hoãn thời gian khởi trị statin chuẩn (Khuyến cáo chống chỉ định - Class III)."
                      : "⚠️ New 2025 Warning (SPORT): Red yeast rice and other unregulated supplements are not recommended (Class III) due to lack of CV benefit and risk of delaying standard care."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results, Matrix, AI */}
        <section className="flex flex-col gap-6 w-full">

          {/* Section: Clinical Diagnosis Summaries */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" />
              {t[lang].cardioRiskStratification}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* Stat Card 1: Total CV Risk */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">{t[lang].riskLevel}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-lg font-bold px-3 py-1 rounded-lg ${assessment.riskCategory === "very_high"
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : assessment.riskCategory === "high"
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : assessment.riskCategory === "moderate"
                            ? "bg-yellow-50 text-yellow-750 border border-yellow-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      }`}>
                      {assessment.riskCategory === "very_high"
                        ? (lang === "vi" ? "RẤT CAO" : "VERY HIGH")
                        : assessment.riskCategory === "high"
                          ? (lang === "vi" ? "CAO" : "HIGH")
                          : assessment.riskCategory === "moderate"
                            ? (lang === "vi" ? "TRUNG BÌNH" : "MODERATE")
                            : (lang === "vi" ? "THẤP" : "LOW")
                      }
                    </span>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t[lang].reasonsTitle}</span>
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                    {assessment.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-blue-500 shrink-0 mt-0.5">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stat Card 2: SCORE2 Estimator */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">{t[lang].score2Estimator}</span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center relative bg-white shadow-[0_2px_8px_rgba(59,130,246,0.06)]">
                      <span className="text-[11px] font-bold text-slate-800">{assessment.estimatedScore2.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium leading-tight block">{t[lang].score2Estimator}</span>
                      <span className={`text-sm font-bold block ${assessment.estimatedScore2 >= 20
                          ? "text-rose-600"
                          : assessment.estimatedScore2 >= 10
                            ? "text-amber-600"
                            : assessment.estimatedScore2 >= 2
                              ? "text-yellow-600"
                              : "text-emerald-600"
                        }`}>
                        {assessment.estimatedScore2 >= 20
                          ? (lang === "vi" ? "Cực kỳ cao" : "Extremely High")
                          : assessment.estimatedScore2 >= 10
                            ? (lang === "vi" ? "Cao" : "High")
                            : assessment.estimatedScore2 >= 2
                              ? (lang === "vi" ? "Trung bình" : "Moderate")
                              : (lang === "vi" ? "Thấp" : "Low")
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 leading-tight bg-slate-100 p-2 rounded-lg border border-slate-200">
                  {t[lang].score2Footnote}
                </div>
              </div>
            </div>

            {/* LDL-C Comparison Bar */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold mb-2 block">{t[lang].ldlTarget}</span>
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-500">{t[lang].currentLdl} <span className="text-slate-800">{currentValDisp} {patient.unit}/L</span></span>
                <span className="text-blue-600">{t[lang].targetLdl} <span className="underline">&lt; {goalValDisp} {patient.unit}/L</span></span>
              </div>

              {/* Graphic Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative border border-slate-300">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${reductionNeededPct > 0 ? "bg-gradient-to-r from-blue-500 to-rose-500" : "bg-blue-500"
                    }`}
                  style={{ width: `${Math.min(100, Math.max(15, (goalValDisp / currentValDisp) * 100))}%` }}
                />
              </div>

              {reductionNeededPct > 0 ? (
                <div className="mt-3 flex items-start gap-1.5 text-xs text-rose-600 font-medium leading-relaxed bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                  <span>
                    {t[lang].reductionAlert
                      .replace("{pct}", reductionNeededPct.toString())
                      .replace("{goal}", goalValDisp.toString())
                      .replace("{unit}", patient.unit === "mmol" ? "mmol/L" : "mg/dL")}
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-start gap-1.5 text-xs text-emerald-600 font-medium leading-relaxed bg-emerald-50 p-2 rounded-lg border border-emerald-250">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t[lang].notRequired}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Table 4 Matrix (HTML visual representation) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 overflow-x-auto shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4" />
              {t[lang].table4Title}
            </h2>

            <table className="w-full text-left border-collapse mt-2 min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border border-slate-200">
                  <th className="p-3 text-[10px] uppercase font-bold tracking-wider border border-slate-200 w-24">
                    {lang === "vi" ? "Mức nguy cơ" : "CV Risk"}
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    &lt;1.4 mmol/L<br />(&lt;55 mg/dL)
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    1.4 to &lt;1.8 mmol/L<br />(55 to &lt;70 mg/dL)
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    1.8 to &lt;2.6 mmol/L<br />(70 to &lt;100 mg/dL)
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    2.6 to &lt;3.0 mmol/L<br />(100 to &lt;116 mg/dL)
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    3.0 to &lt;4.9 mmol/L<br />(116 to &lt;190 mg/dL)
                  </th>
                  <th className="p-3 text-[9px] font-bold border border-slate-200 text-center">
                    &ge;4.9 mmol/L<br />(&ge;190 mg/dL)ᵃ
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row Low */}
                <tr className={rowIdx === 0 ? "bg-blue-50/30" : ""}>
                  <td className="p-3 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">{lang === "vi" ? "Thấp (Low)" : "Low"}</td>
                  <td className={getCellClass(0, 0)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(0, 1)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(0, 2)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(0, 3)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(0, 4)}>{t[lang].lifestyleModConsiderDrugShort}</td>
                  <td className={getCellClass(0, 5)}>N/Aᵃ</td>
                </tr>

                {/* Row Moderate */}
                <tr className={rowIdx === 1 ? "bg-blue-50/30" : ""}>
                  <td className="p-3 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">{lang === "vi" ? "T.Bình (Mod.)" : "Moderate"}</td>
                  <td className={getCellClass(1, 0)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(1, 1)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(1, 2)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(1, 3)}>{t[lang].lifestyleModConsiderDrugShort}</td>
                  <td className={getCellClass(1, 4)}>{t[lang].lifestyleModConsiderDrugShort}</td>
                  <td className={getCellClass(1, 5)}>N/Aᵃ</td>
                </tr>

                {/* Row High */}
                <tr className={rowIdx === 2 ? "bg-blue-50/30" : ""}>
                  <td className="p-3 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">{lang === "vi" ? "Cao (High)" : "High"}</td>
                  <td className={getCellClass(2, 0)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(2, 1)}>{t[lang].lifestyleAdvice}</td>
                  <td className={getCellClass(2, 2)}>{t[lang].lifestyleModConsiderDrugShort}</td>
                  <td className={getCellClass(2, 3)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(2, 4)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(2, 5)}>{t[lang].lifestyleModConcomitantDrug}</td>
                </tr>

                {/* Row Very High (Primary) */}
                <tr className={rowIdx === 3 ? "bg-blue-50/30" : ""}>
                  <td className="p-3 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 leading-tight">
                    {lang === "vi" ? "Rất cao: Tiên phát" : "Very High: Primary"}
                  </td>
                  <td className={getCellClass(3, 0)}>{t[lang].lifestyleModDrug}</td>
                  <td className={getCellClass(3, 1)}>{t[lang].lifestyleModDrug}</td>
                  <td className={getCellClass(3, 2)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(3, 3)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(3, 4)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(3, 5)}>{t[lang].lifestyleModConcomitantDrug}</td>
                </tr>

                {/* Row Very High (Secondary) */}
                <tr className={rowIdx === 4 ? "bg-blue-50/30" : ""}>
                  <td className="p-3 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 leading-tight">
                    {lang === "vi" ? "Rất cao: Thứ phát" : "Very High: Secondary"}
                  </td>
                  <td className={getCellClass(4, 0)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(4, 1)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(4, 2)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(4, 3)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(4, 4)}>{t[lang].lifestyleModConcomitantDrug}</td>
                  <td className={getCellClass(4, 5)}>{t[lang].lifestyleModConcomitantDrug}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 text-[10px] text-slate-500 leading-normal flex items-start gap-1">
              <span className="text-rose-500">*</span>
              <span>{t[lang].naFootnote}</span>
            </div>
          </div>

          {/* Section: AI Clinical Diagnostic Assistant */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col flex-1 min-h-[400px] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            
            {/* Inline API Configuration Box */}
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>OpenRouter API Key (Lưu trình duyệt & Tự động nạp từ .env):</span>
                </label>
                <input
                  type="password"
                  placeholder="sk-or-v1-... (Để trống nếu muốn dùng khóa từ file .env)"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem("openrouter_api_key", e.target.value);
                  }}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
              
              <div className="w-full md:w-56 shrink-0">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mô hình AI trợ lý:
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="deepseek/deepseek-v4-flash:free">DeepSeek v4 Flash (Free)</option>
                  <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                  <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                {t[lang].aiAssistant}
              </h2>

              {chatHistory.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyReportToClipboard}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                    title={t[lang].copy}
                  >
                    <span title="Copy to clipboard">
                      <Copy className="w-4 h-4" />
                    </span>
                  </button>
                  <button
                    onClick={downloadReport}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                    title={t[lang].download}
                  >
                    <span title="Download report">
                      <Download className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Chat Screen / Console */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between overflow-y-auto max-h-[450px]">

              {chatHistory.length === 0 ? (
                /* Welcome State */
                <div className="flex flex-col items-center justify-center text-center p-8 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1.5">{lang === "vi" ? "Bác sĩ ảo AI đã sẵn sàng" : "AI Clinical Auditor Ready"}</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    {apiKey
                      ? (lang === "vi" ? "Click nút dưới để khởi chạy phân tích và đối soát phác đồ thuốc tim mạch theo ESC/EAS 2025" : "Click below to evaluate and generate treatment targets & drug recommendations.")
                      : t[lang].aiWelcome}
                  </p>

                  {!apiKey && (
                    <button
                      onClick={() => setShowKeyInput(true)}
                      className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs px-3 py-1.5 rounded-lg hover:bg-rose-100/70 font-bold transition-all"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{lang === "vi" ? "Nhập OpenRouter API Key" : "Enter API Key"}</span>
                    </button>
                  )}

                  {apiKey && (
                    <button
                      onClick={triggerAiAudit}
                      disabled={loadingAi}
                      className="mt-6 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      {loadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      <span>{t[lang].runAiBtn}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Dialogue Messages */
                <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1`}>
                        {msg.role === "user" ? "Doctor" : "AI Clinical Consultant (ESC 2025)"}
                      </div>
                      <div
                        className={`text-xs p-3.5 rounded-2xl max-w-[90%] leading-relaxed border shadow-sm ${msg.role === "user"
                            ? "bg-blue-600 text-white border-transparent rounded-tr-none"
                            : "bg-white text-slate-800 border-slate-200 rounded-tl-none markdown-body"
                          }`}
                      >
                        {msg.role === "user" ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {loadingAi && (
                    <div className="flex flex-col items-start">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                        AI Clinical Consultant (ESC 2025)
                      </div>
                      <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-4 w-[75%] rounded-tl-none shadow-sm">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                        <span className="text-xs text-slate-500 font-medium animate-pulse">{t[lang].aiLoading}</span>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-start gap-2 mt-2">
                      <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Chat Input form */}
            {chatHistory.length > 0 && (
              <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder={t[lang].askAiPlaceholder}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={loadingAi}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={loadingAi || !userInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl font-bold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

            {chatHistory.length > 0 && (
              <button
                onClick={triggerAiAudit}
                disabled={loadingAi}
                className="mt-3 self-center flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-medium transition-colors p-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? "animate-spin" : ""}`} />
                <span>{lang === "vi" ? "Chạy lại toàn bộ chẩn đoán" : "Recalculate AI analysis"}</span>
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white text-center py-4 px-6 text-slate-500 text-[10px] leading-relaxed shadow-sm">
        CardioShield Dashboard © 2026 • Được xây dựng dựa trên Đồng thuận Lâm sàng ESC/EAS 2025 Focused Update.
        <br />
        Bảng dữ liệu can thiệp và chỉ định thuốc tuân thủ nghiêm ngặt theo Hướng dẫn Hội Tim mạch Châu Âu. Mọi quyết định lâm sàng thực tế cần được ký duyệt bởi Bác sĩ chuyên khoa.
      </footer>
    </div>
  );
}
