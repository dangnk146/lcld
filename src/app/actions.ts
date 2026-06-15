"use server";

import fs from "fs";
import path from "path";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";


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

// System prompts for the 5 Specialist Agents and the Master Synthesizer Agent

const CARDIOLOGIST_PROMPT = `Bạn là một Bác sĩ Tim mạch học cao cấp, chuyên sâu về phòng ngừa bệnh tim mạch và chẩn đoán lâm sàng theo Hướng dẫn ESC/EAS 2025.
Nhiệm vụ của bạn là đánh giá các thông tin sau từ hồ sơ bệnh nhân:
- Huyết áp tâm thu (SBP) và tâm trương (DBP).
- Tiền sử bệnh tim mạch do xơ vữa (ASCVD) đã xác định (lâm sàng hoặc hình ảnh học rõ ràng như hẹp >50% trên chụp mạch, điểm canxi mạch vành CAC >300).
- Tính toán ước tính điểm SCORE2 hoặc SCORE2-OP (10 năm nguy cơ tim mạch tử vong và không tử vong).
Sau đó, hãy xác định chính xác Phân độ Nguy cơ Tim mạch tổng thể (Total CV Risk: Thấp, Trung bình, Cao, Rất cao) của bệnh nhân dựa trên Bảng 3 (Table 3) của ESC 2025. Giải thích lý do cụ thể vì sao phân loại như vậy. Hãy viết ngắn gọn, tập trung hoàn toàn vào góc độ tim mạch và đưa ra kết luận rõ ràng.`;

const LIPIDOLOGIST_PROMPT = `Bạn là một Chuyên gia Lipid máu hàng đầu, chuyên điều trị rối loạn lipid máu và dự phòng xơ vữa động mạch theo Hướng dẫn ESC/EAS 2025.
Nhiệm vụ của bạn là phân tích chi tiết bộ chỉ số lipid máu của bệnh nhân:
- Cholesterol toàn phần, HDL-C, LDL-C chưa điều trị, Triglycerides.
- Tính toán Non-HDL-C.
- Dựa trên phân loại nguy cơ tim mạch tổng thể (Thấp/Trung bình/Cao/Rất cao) và mức LDL-C hiện tại, hãy thiết lập mục tiêu LDL-C đích chính xác (theo mmol/L và mg/dL) và tính toán tỷ lệ % LDL-C cần giảm thêm.
- Đề xuất chiến lược hạ lipid máu tối ưu (loại statin hoạt lực mạnh, Ezetimibe, Bempedoic Acid cập nhật 2025, PCSK9i hoặc Icosapent ethyl) và tư vấn lối sống phù hợp. Hãy viết súc tích, tập trung vào tối ưu hóa lipid.`;

const ENDOCRINOLOGIST_PROMPT = `Bạn là một Bác sĩ Nội tiết lâm sàng, chuyên quản lý đái tháo đường (DM) và các biến chứng chuyển hóa ảnh hưởng đến tim mạch theo Hướng dẫn ESC/EAS 2025.
Nhiệm vụ của bạn là đánh giá tình trạng đái tháo đường của bệnh nhân (nếu có):
- Phân loại đái tháo đường (T1DM/T2DM), thời gian mắc bệnh, số yếu tố nguy cơ chính kèm theo.
- Có tổn thương cơ quan đích (như vi đạm niệu microalbuminuria, bệnh võng mạc hoặc bệnh thần kinh do đái tháo đường) hay không.
- Phân tích xem đái tháo đường đóng vai trò thế nào trong việc nâng mức nguy cơ tim mạch tổng thể (Table 3).
- Đề xuất các biện pháp tối ưu hóa chuyển hóa và lựa chọn thuốc hạ đường huyết có lợi ích bảo vệ tim mạch đã được chứng minh (như SGLT2 inhibitors hoặc GLP-1 RAs). Hãy viết ngắn gọn, tập trung vào góc độ nội tiết.`;

const NEPHROLOGIST_PROMPT = `Bạn là một Bác sĩ Thận học chuyên sâu, phụ trách đánh giá chức năng thận và an toàn điều trị ở bệnh nhân tim mạch theo Hướng dẫn ESC/EAS 2025.
Nhiệm vụ của bạn là đánh giá chức năng thận của bệnh nhân:
- Phân loại bệnh thận mạn (CKD) dựa trên mức độ suy giảm chức năng thận (eGFR).
- Phân tích vai trò của suy thận trong việc nâng hạng phân tầng nguy cơ tim mạch tổng thể (Table 3).
- Cảnh báo và kiểm tra an toàn của các thuốc điều trị lipid máu trên bệnh nhân này. Lưu ý đặc biệt: Bempedoic Acid có tác dụng phụ làm tăng nồng độ Acid Uric máu và có nguy cơ cao bùng phát cơn Gút cấp ở bệnh nhân suy thận (eGFR < 60 mL/min). Hãy đưa ra các khuyến nghị bảo vệ thận và điều chỉnh liều thuốc an toàn. Hãy viết súc tích, tập trung vào góc độ thận học.`;

const PHARMACOLOGIST_PROMPT = `Bạn là một Dược sĩ Lâm sàng chuyên về tối ưu hóa sử dụng thuốc, phát hiện tương tác thuốc, tác dụng phụ và y học cá thể hóa theo Hướng dẫn ESC/EAS 2025.
Nhiệm vụ của bạn là kiểm tra các yếu tố bổ trợ và hoàn cảnh đặc biệt của bệnh nhân:
- Nhiễm HIV (tuổi >= 40): Chỉ định Statin tiên phát ngay theo nghiên cứu REPRIEVE (khuyên dùng Pitavastatin 4mg/ngày để tránh tương tác với thuốc kháng virus ART).
- Ung thư đang điều trị hóa chất có nguy cơ độc tính tim cao (Anthracyclines): Chỉ định Statin bảo vệ cơ tim (STOP-CA).
- Lp(a) tăng cao (> 50 mg/dL): Tái phân tầng nguy cơ và chỉ định hạ lipid tích cực.
- Không dung nạp Statin (đau cơ do statin): Đề xuất giải pháp thay thế bằng Bempedoic Acid phối hợp Ezetimibe.
- Thực phẩm chức năng tự phát hạ lipid (men gạo đỏ, v.v.): Cảnh báo chống chỉ định Class III (SPORT trial).
Kiểm tra kỹ tương tác thuốc, phản ứng có hại và sự tuân thủ điều trị của bệnh nhân. Hãy viết ngắn gọn, tập trung vào dược lâm sàng.`;

const MASTER_PROMPT = `Bạn là Trưởng khoa Tim mạch kiêm Chủ tịch Hội đồng Chẩn đoán đa chuyên khoa (MDT Board). Nhiệm vụ của bạn là tổng hợp các ý kiến lâm sàng chuyên sâu từ 5 chuyên gia: Bác sĩ Tim mạch, Chuyên gia Lipid máu, Bác sĩ Nội tiết, Bác sĩ Thận học, và Dược sĩ Lâm sàng.
Hãy phân tích sự đồng thuận và giải quyết bất kỳ mâu thuẫn chuyên môn nào (ví dụ: việc dùng Bempedoic Acid bị giới hạn bởi bệnh thận mạn/gút, hay tương tác thuốc kháng virus ở bệnh nhân HIV).
Sau đó, hãy đưa ra báo cáo chẩn đoán và phác đồ điều trị cá thể hóa cuối cùng tốt nhất cho bệnh nhân dưới dạng Markdown chuyên nghiệp bằng tiếng Việt.

Yêu cầu báo cáo phải cực kỳ chi tiết, khoa học và bao gồm các phần sau:
1. **Tóm tắt Ca lâm sàng**: Hồ sơ bệnh nhân dưới góc nhìn đa chuyên khoa.
2. **Chẩn đoán & Phân tầng Nguy cơ Tim mạch**: Nêu rõ phân hạng nguy cơ (Low/Moderate/High/Very High) và các tiêu chí thỏa mãn theo Table 3.
3. **Đối chiếu Vị trí Bảng 4 (Table 4)**: Chỉ rõ Hàng và Cột tương ứng cùng chiến lược can thiệp đề xuất.
4. **Mục tiêu Điều trị LDL-C đích**: Ghi cụ thể con số đích và tỉ lệ % cần giảm thêm.
5. **Phác đồ Điều trị Cá thể hóa cuối cùng (CỰC KỲ CHI TIẾT - LÀM NỔI BẬT PHẦN THUỐC)**:
   - Thuốc hạ lipid máu & huyết áp (ghi rõ hoạt chất, liều lượng cụ thể, thời gian theo dõi 4-6 tuần).
   - Biện pháp lối sống.
6. **Cảnh báo Lâm sàng quan trọng**: Tương tác thuốc, tác dụng phụ cần theo dõi (đau cơ, acid uric, gút), cảnh báo thực phẩm chức năng tự phát (SPORT trial, Class III).
7. **Kết luận của Hội đồng**: Lời nhắn gửi của trưởng khoa về việc theo dõi và tuân thủ.

Hãy giữ giọng điệu chuyên nghiệp, đồng cảm, khoa học của một giáo sư tim mạch hàng đầu đầu ngành.`;

async function callAgent(
  systemPrompt: string,
  humanContent: string,
  apiKey: string,
  modelName: string
): Promise<string> {
  const chat = new ChatOpenAI({
    apiKey: apiKey,
    openAIApiKey: apiKey,
    modelName: modelName || "google/gemini-2.5-flash",
    temperature: 0.3,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(humanContent),
  ];

  const response = await chat.invoke(messages);
  return response.content.toString();
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

    // Multi-agent diagnostic logic when initial run (chatHistory empty)
    if (chatHistory.length === 0) {
      console.log("CardioShield Multi-Agent System - Launching 5 Specialists in Parallel...");
      
      const [cardiologist, lipidologist, endocrinologist, nephrologist, pharmacologist] = await Promise.all([
        callAgent(CARDIOLOGIST_PROMPT, clinicalSummary, finalApiKey, modelName),
        callAgent(LIPIDOLOGIST_PROMPT, clinicalSummary, finalApiKey, modelName),
        callAgent(ENDOCRINOLOGIST_PROMPT, clinicalSummary, finalApiKey, modelName),
        callAgent(NEPHROLOGIST_PROMPT, clinicalSummary, finalApiKey, modelName),
        callAgent(PHARMACOLOGIST_PROMPT, clinicalSummary, finalApiKey, modelName),
      ]);

      console.log("CardioShield Multi-Agent System - Specialists finished. Invoking Master Synthesizer...");

      const masterInput = `
${clinicalSummary}

--- Ý KIẾN CHẨN ĐOÁN LÂM SÀNG TỪ HỘI ĐỒNG 5 CHUYÊN GIA ---

1. Ý KIẾN BÁC SĨ TIM MẠCH:
${cardiologist}

2. Ý KIẾN CHUYÊN GIA LIPID MÁU:
${lipidologist}

3. Ý KIẾN BÁC SĨ NỘI TIẾT:
${endocrinologist}

4. Ý KIẾN BÁC SĨ THẬN HỌC:
${nephrologist}

5. Ý KIẾN DƯỢC SĨ LÂM SÀNG:
${pharmacologist}

---
`;

      const masterContent = await callAgent(MASTER_PROMPT, masterInput, finalApiKey, modelName);

      return {
        success: true,
        content: masterContent,
        agents: {
          cardiologist,
          lipidologist,
          endocrinologist,
          nephrologist,
          pharmacologist,
        }
      };
    } else {
      // Normal follow-up chat with Master Agent
      console.log("CardioShield Multi-Agent System - Follow up chat with Master Agent...");
      
      const chat = new ChatOpenAI({
        apiKey: finalApiKey,
        openAIApiKey: finalApiKey,
        modelName: modelName || "google/gemini-2.5-flash",
        temperature: 0.3,
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
        },
      });

      const messages: BaseMessage[] = [
        new SystemMessage(MASTER_PROMPT),
      ];

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

      const response = await chat.invoke(messages);

      return {
        success: true,
        content: response.content.toString(),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Đã xảy ra lỗi hệ thống: ${error.message || error}`,
    };
  }
}
