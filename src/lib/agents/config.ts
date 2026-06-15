import type { SpecialistKey } from "@/lib/types";

export type LLMProvider = "openclaw";

export interface AgentConfig {
  key: SpecialistKey;
  roleVi: string;
  roleEn: string;
  provider: LLMProvider;
  model: string;
  providerLabel: string;
}

/** Mỗi chuyên gia kết nối qua OpenClaw Gateway sử dụng mô hình Ollama cục bộ */
export const SPECIALIST_AGENTS: AgentConfig[] = [
  {
    key: "cardiologist",
    roleVi: "Bác sĩ Tim mạch",
    roleEn: "Cardiologist",
    provider: "openclaw",
    model: "openclaw",
    providerLabel: "OpenClaw (Ollama)",
  },
  {
    key: "endocrinologist",
    roleVi: "Bác sĩ Nội tiết",
    roleEn: "Endocrinologist",
    provider: "openclaw",
    model: "openclaw",
    providerLabel: "OpenClaw (Ollama)",
  },
  {
    key: "lipidologist",
    roleVi: "Chuyên gia Lipid máu",
    roleEn: "Lipidologist",
    provider: "openclaw",
    model: "openclaw",
    providerLabel: "OpenClaw (Ollama)",
  },
];

export interface MasterAgentConfig {
  key: "master";
  roleVi: string;
  roleEn: string;
  provider: LLMProvider;
  model: string;
  providerLabel: string;
}

export const MASTER_AGENT: MasterAgentConfig = {
  key: "master",
  roleVi: "Trưởng khoa Tim mạch — Hội đồng MDT",
  roleEn: "Chief Cardiologist — MDT Board Chair",
  provider: "openclaw",
  model: "openclaw",
  providerLabel: "OpenClaw (Ollama)",
};
