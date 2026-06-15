"use server";

import fs from "fs";
import path from "path";
import type { ChatMessage, PatientData } from "@/app/actions";
import { buildClinicalSummary } from "@/lib/agents/clinical-summary";
import { MASTER_AGENT, SPECIALIST_AGENTS } from "@/lib/agents/config";
import { callLLM, callLLMWithChat } from "@/lib/agents/llm";
import { getAllEffectivePrompts } from "@/lib/agents/prompts";
import type { AgentKey, SpecialistKey } from "@/lib/types";

function readEnvKey(name: string): string {
  const fromProcess = process.env[name] || "";
  if (fromProcess) return fromProcess.trim();

  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, "m"));
      if (match?.[1]) return match[1].replace(/\r/g, "").trim().replace(/['"]/g, "");
    }
  } catch {
    /* ignore */
  }
  return "";
}

function resolveKeys(openRouterKey: string, nvidiaKey: string) {
  return {
    openRouter: openRouterKey || readEnvKey("OPENROUTER_API_KEY"),
    nvidia: nvidiaKey || readEnvKey("NVIDIA_API_KEY"),
  };
}

function getAgentMeta(key: AgentKey) {
  if (key === "master") return MASTER_AGENT;
  return SPECIALIST_AGENTS.find((a) => a.key === key)!;
}

export interface AgentRunResult {
  key: AgentKey;
  roleVi: string;
  provider: string;
  model: string;
  content: string;
  error?: string;
}

export interface MDTAnalysisResult {
  success: boolean;
  error?: string;
  clinicalSummary?: string;
  specialists?: AgentRunResult[];
  masterReport?: string;
  agents?: Record<SpecialistKey, string>;
}

type PromptOverrides = Partial<Record<AgentKey, string>>;

function buildHumanPrompt(clinicalSummary: string, mode: "analyze" | "chat") {
  if (mode === "chat") {
    return `${clinicalSummary}

Bạn đang trao đổi với bác sĩ về hồ sơ bệnh nhân trên. Trả lời ngắn gọn, chính xác, dựa trên dữ liệu giai đoạn hiện tại.`;
  }
  return `${clinicalSummary}

Hãy phân tích hồ sơ bệnh nhân trên theo đúng 5 PHASE trong system prompt. Trình bày đầy đủ suy luận từng bước.`;
}

export async function runSingleAgent(
  agentKey: AgentKey,
  patientData: PatientData,
  openRouterKey: string,
  nvidiaKey: string,
  options?: {
    clinicalNotes?: string;
    visitDate?: string;
    customPrompts?: PromptOverrides;
    specialistOutputs?: Partial<Record<SpecialistKey, string>>;
  }
): Promise<AgentRunResult> {
  const keys = resolveKeys(openRouterKey, nvidiaKey);
  const agent = getAgentMeta(agentKey);
  const prompts = getAllEffectivePrompts(options?.customPrompts);
  const clinicalSummary = buildClinicalSummary(patientData, {
    clinicalNotes: options?.clinicalNotes,
    visitDate: options?.visitDate,
  });

  let humanContent: string;
  if (agentKey === "master") {
    const specBlock = SPECIALIST_AGENTS.map((s, i) => {
      const content = options?.specialistOutputs?.[s.key] || "(Chưa có phân tích)";
      return `### ${i + 1}. ${s.roleVi}\n${content}`;
    }).join("\n\n");
    humanContent = `${clinicalSummary}

--- Ý KIẾN 5 CHUYÊN GIA ---

${specBlock}

---
Hãy tổng hợp thành BÁO CÁO MDT hoàn chỉnh theo MASTER prompt.`;
  } else {
    humanContent = buildHumanPrompt(clinicalSummary, "analyze");
  }

  try {
    const content = await callLLM({
      systemPrompt: prompts[agentKey],
      humanContent,
      model: agent.model,
      provider: agent.provider,
      openRouterKey: keys.openRouter,
      nvidiaKey: keys.nvidia,
      temperature: agentKey === "master" ? 0.25 : 0.3,
    });
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      content,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      content: "",
      error: message,
    };
  }
}

export async function runAgentChat(
  agentKey: AgentKey,
  patientData: PatientData,
  chatHistory: ChatMessage[],
  openRouterKey: string,
  nvidiaKey: string,
  options?: {
    clinicalNotes?: string;
    visitDate?: string;
    customPrompts?: PromptOverrides;
  }
): Promise<AgentRunResult> {
  const keys = resolveKeys(openRouterKey, nvidiaKey);
  const agent = getAgentMeta(agentKey);
  const prompts = getAllEffectivePrompts(options?.customPrompts);
  const clinicalSummary = buildClinicalSummary(patientData, {
    clinicalNotes: options?.clinicalNotes,
    visitDate: options?.visitDate,
  });

  const enrichedSystem = `${prompts[agentKey]}\n\n---\nDỮ LIỆU HỒ SƠ GIAI ĐOẠN HIỆN TẠI (chỉ dùng thông tin này):\n${clinicalSummary}`;

  try {
    const content = await callLLMWithChat({
      systemPrompt: enrichedSystem,
      chatHistory,
      model: agent.model,
      provider: agent.provider,
      openRouterKey: keys.openRouter,
      nvidiaKey: keys.nvidia,
    });
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      content,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      content: "",
      error: message,
    };
  }
}

export async function runMultiAgentMDTAnalysis(
  patientData: PatientData,
  openRouterKey: string,
  nvidiaKey: string,
  options?: { clinicalNotes?: string; visitDate?: string; customPrompts?: PromptOverrides }
): Promise<MDTAnalysisResult> {
  try {
    const keys = resolveKeys(openRouterKey, nvidiaKey);

    if (!keys.nvidia) {
      return {
        success: false,
        error:
          "Thiếu NVIDIA API Key. Đăng ký tại https://build.nvidia.com, tạo API key và thêm NVIDIA_API_KEY vào .env.",
      };
    }

    const clinicalSummary = buildClinicalSummary(patientData, options);
    const prompts = getAllEffectivePrompts(options?.customPrompts);

    console.log("[MDT] Launching 5 specialist agents (parallel)...");

    const specialistResults = await Promise.all(
      SPECIALIST_AGENTS.map((agent) =>
        runSingleAgent(agent.key, patientData, keys.openRouter, keys.nvidia, {
          ...options,
          customPrompts: prompts,
        })
      )
    );

    const failed = specialistResults.filter((r) => r.error);
    if (failed.length === specialistResults.length) {
      return {
        success: false,
        error: `Tất cả 5 chuyên gia đều lỗi. Ví dụ: ${failed[0].error}`,
        clinicalSummary,
        specialists: specialistResults,
      };
    }

    const specialistOutputs = Object.fromEntries(
      specialistResults.filter((r) => r.content).map((r) => [r.key, r.content])
    ) as Partial<Record<SpecialistKey, string>>;

    console.log("[MDT] Invoking Master Agent...");
    const masterResult = await runSingleAgent("master", patientData, keys.openRouter, keys.nvidia, {
      ...options,
      customPrompts: prompts,
      specialistOutputs,
    });

    if (masterResult.error && !masterResult.content) {
      return {
        success: false,
        error: `5 chuyên gia hoàn thành nhưng Master Agent lỗi: ${masterResult.error}`,
        clinicalSummary,
        specialists: specialistResults,
      };
    }

    const agents = Object.fromEntries(
      specialistResults.filter((r) => r.content).map((r) => [r.key, r.content])
    ) as Record<SpecialistKey, string>;

    return {
      success: true,
      clinicalSummary,
      specialists: specialistResults,
      masterReport: masterResult.content,
      agents,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Lỗi hệ thống MDT: ${message}` };
  }
}
