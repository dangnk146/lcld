/** @deprecated Dùng src/lib/agents/prompts/ — file này giữ tương thích import cũ */
export {
  DEFAULT_PROMPTS,
  getAllEffectivePrompts,
  getEffectivePrompt,
  loadPromptOverrides,
  MASTER_PROMPT as MASTER_SYNTHESIS_PROMPT,
  PROMPT_FILE_MAP,
  savePromptOverride,
  resetPromptOverride,
} from "./prompts/index";

import { DEFAULT_PROMPTS } from "./prompts/index";
import type { SpecialistKey } from "@/lib/types";

export const SPECIALIST_PROMPTS: Record<SpecialistKey, string> = {
  cardiologist: DEFAULT_PROMPTS.cardiologist,
  lipidologist: DEFAULT_PROMPTS.lipidologist,
  endocrinologist: DEFAULT_PROMPTS.endocrinologist,
  nephrologist: DEFAULT_PROMPTS.nephrologist,
  pharmacologist: DEFAULT_PROMPTS.pharmacologist,
};
