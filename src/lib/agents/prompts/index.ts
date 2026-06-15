import { CARDIOLOGIST_PROMPT } from "./cardiologist";
import { ENDOCRINOLOGIST_PROMPT } from "./endocrinologist";
import { LIPIDOLOGIST_PROMPT } from "./lipidologist";
import { MASTER_PROMPT } from "./master";
import { NEPHROLOGIST_PROMPT } from "./nephrologist";
import { PHARMACOLOGIST_PROMPT } from "./pharmacologist";
import type { AgentKey } from "@/lib/types";

export { PHASED_REASONING_RULES } from "./shared";
export { CARDIOLOGIST_PROMPT } from "./cardiologist";
export { LIPIDOLOGIST_PROMPT } from "./lipidologist";
export { ENDOCRINOLOGIST_PROMPT } from "./endocrinologist";
export { NEPHROLOGIST_PROMPT } from "./nephrologist";
export { PHARMACOLOGIST_PROMPT } from "./pharmacologist";
export { MASTER_PROMPT } from "./master";

/** Map bot → file prompt (để hiển thị trên Tab 3) */
export const PROMPT_FILE_MAP: Record<AgentKey, { file: string; label: string }> = {
  cardiologist: { file: "src/lib/agents/prompts/cardiologist.ts", label: "Bác sĩ Tim mạch" },
  lipidologist: { file: "src/lib/agents/prompts/lipidologist.ts", label: "Chuyên gia Lipid" },
  endocrinologist: { file: "src/lib/agents/prompts/endocrinologist.ts", label: "Bác sĩ Nội tiết" },
  master: { file: "src/lib/agents/prompts/master.ts", label: "Master — Hội đồng MDT" },
};

export const DEFAULT_PROMPTS: Record<AgentKey, string> = {
  cardiologist: CARDIOLOGIST_PROMPT,
  lipidologist: LIPIDOLOGIST_PROMPT,
  endocrinologist: ENDOCRINOLOGIST_PROMPT,
  master: MASTER_PROMPT,
};

const STORAGE_KEY = "cardioshield_prompt_overrides";

export function loadPromptOverrides(): Partial<Record<AgentKey, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePromptOverride(key: AgentKey, prompt: string) {
  const all = loadPromptOverrides();
  all[key] = prompt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function resetPromptOverride(key: AgentKey) {
  const all = loadPromptOverrides();
  delete all[key];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getEffectivePrompt(key: AgentKey, overrides?: Partial<Record<AgentKey, string>>): string {
  return overrides?.[key] || DEFAULT_PROMPTS[key];
}

export function getAllEffectivePrompts(overrides?: Partial<Record<AgentKey, string>>): Record<AgentKey, string> {
  const keys = Object.keys(DEFAULT_PROMPTS) as AgentKey[];
  return Object.fromEntries(keys.map((k) => [k, getEffectivePrompt(k, overrides)])) as Record<AgentKey, string>;
}
