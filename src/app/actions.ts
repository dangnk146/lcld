"use server";

import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

function getEnvKeyManually(): string {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^OPENROUTER_API_KEY\s*=\s*(.*)$/m);
      if (match && match[1]) {
        return match[1].replace(/\r/g, "").trim().replace(/['"]/g, ""); // remove carriage returns, trim, remove quotes
      }
    }
  } catch (e) {
    console.error("Failed to read .env file manually:", e);
  }
  return "";
}

export interface PatientData {
  name: string;
  age: number;
  sex: "male" | "female";
  riskRegion: "low" | "moderate" | "high" | "very_high";
  smokingStatus: boolean;
  sbp: number; // Systolic BP
  dbp: number; // Diastolic BP
  totalChol: number; // mmol/L or mg/dL
  hdlChol: number; // mmol/L or mg/dL
  ldlChol: number; // Untreated LDL-C levels
  triglycerides: number; // mmol/L or mg/dL
  unit: "mmol" | "mg"; // units used for lipids

  // High risk conditions (Table 3)
  hasAscvd: boolean; // Documented ASCVD
  ascvdType: "primary" | "secondary"; // Secondary prevention if established ASCVD
  diabetes: "none" | "t1dm" | "t2dm";
  dmDuration: number;
  dmTargetOrganDamage: boolean;
  dmRiskFactorsCount: number; // Major risk factors count for DM
  ckd: "none" | "moderate" | "severe"; // Moderate: eGFR 30-59, Severe: <30
  hasFh: boolean; // Familial Hypercholesterolaemia
  fhHasMajorRiskFactor: boolean; // FH with ASCVD or another major risk factor
  
  // Custom modifiers
  hasSubclinicalPlaque: boolean; // subclinical atherosclerosis on imaging or CAC > 300
  hasPrematureFamilyHistory: boolean; // Family history of premature CVD
  hasLpaElevated: boolean; // Elevated Lp(a) > 50 mg/dL
  hasHiv: boolean; // HIV positive aged >= 40
  hasCancerToxicityRisk: boolean; // Cancer patient with high chemotherapy cardiotoxicity risk
  useDietarySupplements: boolean; // Uses unproven dietary supplements/vitamins
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function analyzePatientCardioRisk(
  patientData: PatientData,
  chatHistory: ChatMessage[],
  apiKey: string,
  modelName: string
) {
  try {
    let finalApiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
    if (!finalApiKey) {
      finalApiKey = getEnvKeyManually();
    }
    console.log("CardioShield AI System - Key loaded from client:", apiKey ? "YES" : "NO", "Key loaded from process.env:", process.env.OPENROUTER_API_KEY ? "YES" : "NO", "Key loaded manually:", finalApiKey ? "YES" : "NO");
    if (!finalApiKey) {
      return {
        success: false,
        error: "Vui lòng cung cấp OpenRouter API Key trong .env hoặc nhập trực tiếp trên giao diện.",
      };
    }

    const lipidUnit = patientData.unit === "mmol" ? "mmol/L" : "mg/dL";
    const calculatedNonHdl = (patientData.totalChol - patientData.hdlChol).toFixed(2);
    
    const clinicalSummary = `
--- THÔNG TIN LÂM SÀNG BỆNH NHÂN ---
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
  + Triglycerides (Mỡ trung tính): ${patientData.triglycerides}
- Tiền sử & Bệnh lý đi kèm (Tiêu chuẩn Table 3):
  + Bệnh tim mạch do xơ vữa (ASCVD) đã xác định: ${patientData.hasAscvd ? `Có (${patientData.ascvdType === "secondary" ? "Phòng ngừa thứ phát" : "Phòng ngừa tiên phát"})` : "Không"}
  + Đái tháo đường (DM): ${patientData.diabetes === "none" ? "Không" : `${patientData.diabetes.toUpperCase()} (Thời gian mắc: ${patientData.dmDuration} năm, Tổn thương cơ quan đích: ${patientData.dmTargetOrganDamage ? "Có" : "Không"}, Số yếu tố nguy cơ chính kèm theo: ${patientData.dmRiskFactorsCount})`}
  + Bệnh thận mạn (CKD): ${patientData.ckd === "none" ? "Không" : patientData.ckd === "moderate" ? "Trung bình (eGFR 30-59)" : "Nặng (eGFR < 30)"}
  + Tăng cholesterol máu gia đình (FH): ${patientData.hasFh ? `Có (${patientData.fhHasMajorRiskFactor ? "Có kèm ASCVD hoặc yếu tố nguy cơ chính khác" : "Không kèm yếu tố nguy cơ khác"})` : "Không"}
- Các yếu tố bổ trợ nguy cơ (Risk Modifiers):
  + Mảng xơ vữa cận lâm sàng / Điểm canxi mạch vành CAC > 300: ${patientData.hasSubclinicalPlaque ? "Có" : "Không"}
  + Tiền sử gia đình mắc bệnh tim mạch sớm: ${patientData.hasPrematureFamilyHistory ? "Có" : "Không"}
  + Nồng độ Lipoprotein(a) [Lp(a)] cao (> 50 mg/dL hoặc > 105 nmol/L): ${patientData.hasLpaElevated ? "Có" : "Không"}
  + Nhiễm HIV (tuổi >= 40): ${patientData.hasHiv ? "Có" : "Không"}
  + Nguy cơ độc tính hóa trị ung thư: ${patientData.hasCancerToxicityRisk ? "Có" : "Không"}
  + Sử dụng thực phẩm chức năng tự phát hạ lipid: ${patientData.useDietarySupplements ? "Có" : "Không"}
---
`;

    const systemPrompt = `Bạn là một chuyên gia Tim mạch học cao cấp hàng đầu thế giới, chuyên sâu về điều trị rối loạn lipid máu và dự phòng bệnh tim mạch do xơ vữa (ASCVD), tuân thủ cực kỳ nghiêm ngặt và cập nhật chi tiết theo Hướng dẫn Đồng thuận và Cập nhật Tập trung năm 2025 (2025 Focused Update of the 2019 ESC/EAS Guidelines for the management of dyslipidaemias) của Hội Tim mạch Châu Âu (ESC) và Hội Xơ vữa động mạch Châu Âu (EAS).

Nhiệm vụ của bạn là phân tích thông tin bệnh nhân, xác định chính xác phân độ nguy cơ tim mạch tổng thể (Total CV Risk - Low, Moderate, High, Very High) theo Bảng 3 (Table 3), xác định ô chiến lược can thiệp tương ứng theo Bảng 4 (Table 4) dưới đây và đưa ra các khuyến nghị điều trị tối ưu nhất (cả không dùng thuốc và dùng thuốc) dựa trên các cập nhật mới nhất năm 2025.

DƯỚI ĐÂY LÀ BẢNG 4 (TABLE 4) ĐỂ BẠN ĐỐI CHIẾU VÀ LÂM SÀNG HÓA:
| Total CV risk | <1.4 mmol/L (<55 mg/dL) | 1.4 to <1.8 mmol/L (55 to <70 mg/dL) | 1.8 to <2.6 mmol/L (70 to <100 mg/dL) | 2.6 to <3.0 mmol/L (100 to <116 mg/dL) | 3.0 to <4.9 mmol/L (116 to <190 mg/dL) | >=4.9 mmol/L (>=190 mg/dL) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Low** | Lifestyle advice | Lifestyle advice | Lifestyle advice | Lifestyle advice | Lifestyle modification, consider adding drug if uncontrolled | N/A |
| **Moderate** | Lifestyle advice | Lifestyle advice | Lifestyle advice | Lifestyle modification, consider adding drug if uncontrolled | Lifestyle modification, consider adding drug if uncontrolled | N/A |
| **High** | Lifestyle advice | Lifestyle advice | Lifestyle modification, consider adding drug if uncontrolled | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention |
| **Very high:** primary prevention | Lifestyle modification, consider adding drug | Lifestyle modification, consider adding drug | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention |
| **Very high:** secondary prevention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention | Lifestyle modification and concomitant drug intervention |

Hãy tuân thủ các quy tắc lâm sàng cực kỳ quan trọng sau từ Cập nhật 2025:
1. PHÂN ĐỘ NGUY CƠ TIM MẠCH (Bảng 3 - Table 3):
   - NGUY CƠ RẤT CAO (VERY HIGH):
     + Đã có ASCVD (lâm sàng hoặc chẩn đoán hình ảnh rõ ràng như hẹp >50% trên chụp mạch, CAC >300, v.v.).
     + Đái tháo đường (DM) có tổn thương cơ quan đích (microalbuminuria, bệnh võng mạc, bệnh thần kinh), HOẶC có ít nhất 3 yếu tố nguy cơ chính, HOẶC đái tháo đường tuýp 1 khởi phát sớm và kéo dài (>20 năm).
     + Bệnh thận mạn nặng (CKD với eGFR < 30 mL/min/1.73 m2).
     + Điểm SCORE2 hoặc SCORE2-OP >= 20%.
     + Tăng cholesterol máu gia đình (FH) kèm theo ASCVD hoặc yếu tố nguy cơ chính khác.
   - NGUY CƠ CAO (HIGH):
     + Có duy nhất một yếu tố nguy cơ tăng cực cao: TC > 8 mmol/L (>310 mg/dL), LDL-C > 4.9 mmol/L (>190 mg/dL), hoặc HA >= 180/110 mmHg.
     + FH không kèm theo yếu tố nguy cơ khác.
     + Đái tháo đường (DM) không có tổn thương cơ quan đích nhưng có thời gian mắc >= 10 năm HOẶC có kèm 1 yếu tố nguy cơ chính khác.
     + Bệnh thận mạn trung bình (CKD với eGFR 30-59 mL/min/1.73 m2).
     + Điểm SCORE2 hoặc SCORE2-OP từ 10% đến <20%.
   - NGUY CƠ TRUNG BÌNH (MODERATE):
     + Bệnh nhân trẻ tuổi (T1DM < 35 tuổi, T2DM < 50 tuổi) có thời gian mắc bệnh ĐTĐ < 10 năm, không kèm yếu tố nguy cơ khác.
     + Điểm SCORE2 hoặc SCORE2-OP từ 2% đến <10%.
   - NGUY CƠ THẤP (LOW):
     + Điểm SCORE2 hoặc SCORE2-OP < 2%.

2. CÁC THAY ĐỔI VÀ KHUYẾN NGHỊ MỚI NĂM 2025 (CỰC KỲ QUAN TRỌNG - PHẢI ĐƯA VÀO ĐỂ TẠO KHÁC BIỆT):
   - Thay thế hoàn toàn thuật toán SCORE cũ bằng SCORE2 (cho người khỏe mạnh < 70 tuổi) và SCORE2-OP (cho người khỏe mạnh >= 70 tuổi) để tính toán nguy cơ tim mạch 10 năm (bao gồm cả tử vong và không tử vong).
   - Khuyến nghị mạnh mẽ về Bempedoic Acid (Thuốc ức chế ATP-citrate lyase đường uống):
     + Bempedoic acid được KHUYẾN NGHỊ (Class I, Level B) cho những bệnh nhân KHÔNG DUNG NẠP ĐƯỢC STATIN để giúp đạt mục tiêu LDL-C.
     + Phối hợp thêm Bempedoic acid vào liều Statin tối đa dung nạp được kèm hoặc không kèm Ezetimibe NÊN ĐƯỢC CÂN NHẮC (Class IIa, Level C) ở bệnh nhân nguy cơ CAO hoặc RẤT CAO chưa đạt mục tiêu LDL-C.
   - Hội chứng vành cấp (ACS): Khuyến nghị "Strike early, strike strong".
     + Khởi trị ngay liệu pháp phối hợp Statin cường độ cao + Ezetimibe trong lúc nằm viện đối với bệnh nhân chưa từng dùng thuốc điều trị mỡ máu (treatment-naïve) mà không kỳ vọng đạt mục tiêu chỉ với statin đơn trị (Class IIa, Level B).
     + Tăng cường điều trị trong lúc nằm viện cho bệnh nhân ĐÃ dùng thuốc mỡ máu trước đó (Class I, Level C).
   - Lipoprotein(a): Nồng độ Lp(a) > 50 mg/dL (>105 nmol/L) là một yếu tố làm tăng nguy cơ tim mạch (CV risk-enhancing factor) (Class IIa, Level B). Đo Lp(a) ít nhất 1 lần trong đời. Cân nhắc tái phân độ nguy cơ cho bệnh nhân ở nhóm nguy cơ trung bình hoặc cận kề ranh giới điều trị.
   - Bệnh nhân HIV (REPRIEVE trial): KHUYẾN NGHỊ (Class I, Level B) điều trị STATIN cho người nhiễm HIV tuổi >= 40 tuổi trong dự phòng tiên phát, BẤT KỂ mức nguy cơ tim mạch ước tính hay nồng độ LDL-C ban đầu. Thuốc được thử nghiệm lâm sàng tốt là Pitavastatin 4mg/ngày (không tương tác thuốc kháng virus ART).
   - Bệnh nhân Ung thư (STOP-CA trial): Nên cân nhắc STATIN (Class IIa, Level B) ở người lớn có nguy cơ độc tính tim mạch cao hoặc rất cao do hóa trị (đặc biệt là Anthracyclines) để giảm nguy cơ suy chức năng tim.
   - Tăng Triglyceride: Cân nhắc Icosapent ethyl liều cao (2g x 2 lần/ngày) phối hợp statin ở bệnh nhân nguy cơ cao/rất cao có Triglyceride 135-499 mg/dL (Class IIa, Level B). Đối với Tăng TG nặng do hội chứng Chylomicron gia đình (FCS) gây nguy cơ viêm tụy cấp, cân nhắc Volanesorsen 300mg/tuần (Class IIa, Level B).
   - Thực phẩm chức năng hạ lipid (Red Yeast Rice, v.v.): KHÔNG KHUYẾN NGHỊ (Class III, Level B) tự ý sử dụng các thực phẩm chức năng hoặc vitamin không rõ tính an toàn và hiệu quả để hạ nguy cơ xơ vữa tim mạch.

3. MỤC TIÊU ĐIỀU TRỊ LDL-C CHO TỪNG NHÓM NGUY CƠ:
   - Nguy cơ RẤT CAO: < 1.4 mmol/L (< 55 mg/dL) VÀ giảm ít nhất 50% so với trị số nền ban đầu.
   - Nguy cơ CAO: < 1.8 mmol/L (< 70 mg/dL) VÀ giảm ít nhất 50% so với trị số nền ban đầu.
   - Nguy cơ TRUNG BÌNH: < 2.6 mmol/L (< 100 mg/dL).
   - Nguy cơ THẤP: < 3.0 mmol/L (< 116 mg/dL).

HÃY PHẢN HỒI BẰNG TIẾNG VIỆT, TRÌNH BÀY ĐẸP MẮT, CHI TIẾT VÀ KHOA HỌC DƯỚI DẠNG MARKDOWN CHUYÊN NGHIỆP:
- Đầu tiên, tóm tắt hồ sơ lâm sàng bệnh nhân dưới góc nhìn chuyên khoa sâu.
- Phân tích chi tiết Phân độ nguy cơ tim mạch tổng thể (Low/Moderate/High/Very High) dựa trên các tiêu chí cụ thể của Table 3 mà bệnh nhân thỏa mãn. Giải thích rõ vì sao xếp vào nhóm đó.
- CỰC KỲ QUAN TRỌNG: Chỉ rõ vị trí của bệnh nhân trong Bảng 4 (Table 4) bằng cách chỉ rõ Hàng (ví dụ: "High" hoặc "Very high: primary prevention") và Cột (ví dụ: "1.8 to <2.6 mmol/L"). Giải thích ô can thiệp đó khuyên gì (Lifestyle advice, Lifestyle modification, consider adding drug, hoặc Lifestyle modification and concomitant drug intervention).
- SOI SÁNG VÀ LÀM NỔI BẬT PHÁC ĐỒ THUỐC (STRIKE SHINING ON DRUGS): Bạn phải trình bày cực kỳ chi tiết, rõ ràng và làm nổi bật hẳn phần PHÁC ĐỒ THUỐC CẦN DÙNG CHO BỆNH NHÂN. Chỉ rõ loại hoạt chất Statin (ví dụ: Atorvastatin 40-80mg, Rosuvastatin 20mg), kế hoạch phối hợp Ezetimibe, Bempedoic Acid (Cập nhật 2025), hay kháng thể đơn dòng PCSK9 inhibitor. Nêu rõ liều lượng và thời điểm tăng bậc điều trị.
- Đặt ra Mục tiêu LDL-C đích cụ thể (theo cả mmol/L và mg/dL) cùng khuyến cáo về mức độ giảm tối thiểu (giảm >=50% so với ban đầu đối với High/Very High).
- Đưa ra Phác đồ điều trị chi tiết & Cá thể hóa theo Cập nhật 2025:
  + Dược lý (Pharmacological therapy): Khởi trị bằng thuốc gì, liều lượng thế nào, khi nào cần phối hợp thuốc (Statin, Ezetimibe, Bempedoic acid, PCSK9 mAb, Icosapent ethyl, Pitavastatin, v.v.), kế hoạch theo dõi (đo lại lipid sau 4-6 tuần). Cực kỳ lưu ý các tình huống đặc biệt như HIV, Ung thư, Không dung nạp statin, hoặc Triglycerides cao, Lp(a) cao!
  + Lối sống (Lifestyle & Non-pharmacological): Chế độ ăn uống, tập luyện, bỏ thuốc lá, hạn chế rượu bia phù hợp với bệnh nhân.
  + Cảnh báo lâm sàng (Clinical Warnings): Các lưu ý về tác dụng phụ của thuốc, tương tác thuốc (đặc biệt nếu dùng thuốc kháng HIV ART), hoặc việc không tự ý sử dụng các thực phẩm chức năng tự phát (Class III).
  
Hãy giữ giọng điệu chuyên nghiệp, đồng cảm, khoa học của một giáo sư tim mạch hàng đầu đầu ngành.`;

    const chat = new ChatOpenAI({
      apiKey: finalApiKey,
      openAIApiKey: finalApiKey,
      modelName: modelName || "google/gemini-2.5-flash",
      temperature: 0.3,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });

    const messages = [
      new SystemMessage(systemPrompt),
    ];

    if (chatHistory.length === 0) {
      messages.push(new HumanMessage(`${clinicalSummary}\n\nHãy tiến hành phân tích toàn diện ca lâm sàng này dựa trên thông tin lâm sàng trên và đưa ra chẩn đoán, nguy cơ tim mạch tổng thể, mục tiêu LDL-C, ô can thiệp Table 4, và phác đồ điều trị cá thể hóa chi tiết nhất theo ESC/EAS 2025.`));
    } else {
      chatHistory.forEach((msg, idx) => {
        if (msg.role === "user") {
          if (idx === chatHistory.length - 1) {
            messages.push(new HumanMessage(`${clinicalSummary}\n\nCâu hỏi/Yêu cầu của người dùng: ${msg.content}`));
          } else {
            messages.push(new HumanMessage(msg.content));
          }
        } else {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    const response = await chat.invoke(messages);

    return {
      success: true,
      content: response.content.toString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Đã xảy ra lỗi hệ thống: ${error.message || error}`,
    };
  }
}
