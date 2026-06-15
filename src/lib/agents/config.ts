import type { SpecialistKey } from "@/lib/types";

export type LLMProvider = "openrouter" | "nvidia";

export interface AgentConfig {
  key: SpecialistKey;
  roleVi: string;
  roleEn: string;
  provider: LLMProvider;
  model: string;
  providerLabel: string;
}

/** Mỗi chuyên gia = 1 model khác nhau trên NVIDIA NIM (build.nvidia.com) */
export const SPECIALIST_AGENTS: AgentConfig[] = [
  {
    key: "cardiologist",
    roleVi: "Bác sĩ Tim mạch",
    roleEn: "Cardiologist",
    provider: "nvidia",
    model: "nvidia/nemotron-3.5-content-safety",
    providerLabel: "NVIDIA NIM",
  },
  {
    key: "lipidologist",
    roleVi: "Chuyên gia Lipid máu",
    roleEn: "Lipidologist",
    provider: "nvidia",
    model: "meta/llama-3.3-70b-instruct",
    providerLabel: "NVIDIA NIM",
  },
  {
    key: "endocrinologist",
    roleVi: "Bác sĩ Nội tiết",
    roleEn: "Endocrinologist",
    provider: "nvidia",
    model: "google/gemma-4-31b-it",
    providerLabel: "NVIDIA NIM",
  },
  {
    key: "nephrologist",
    roleVi: "Bác sĩ Thận học",
    roleEn: "Nephrologist",
    provider: "nvidia",
    model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    providerLabel: "NVIDIA NIM",
  },
  {
    key: "pharmacologist",
    roleVi: "Dược sĩ Lâm sàng",
    roleEn: "Clinical Pharmacologist",
    provider: "nvidia",
    model: "deepseek-ai/deepseek-v4-pro",
    providerLabel: "NVIDIA NIM",
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
  provider: "nvidia",
  model: "deepseek-ai/deepseek-v4-pro",
  providerLabel: "NVIDIA NIM",
};
