"use server";

import { MASTER_AGENT, SPECIALIST_AGENTS } from "@/lib/agents/config";
import { callLLM } from "@/lib/agents/llm";
import type { AgentKey } from "@/lib/types";

export interface ModelTestResult {
  key: AgentKey;
  roleVi: string;
  provider: string;
  model: string;
  ok: boolean;
  latencyMs: number;
  preview?: string;
  error?: string;
}

function getAgentMeta(key: AgentKey) {
  if (key === "master") return MASTER_AGENT;
  return SPECIALIST_AGENTS.find((a) => a.key === key)!;
}

export async function testAgentModel(
  agentKey: AgentKey
): Promise<ModelTestResult> {
  const agent = getAgentMeta(agentKey);
  const started = Date.now();

  try {
    const content = await callLLM({
      systemPrompt: "You are a connectivity test assistant. Reply briefly.",
      humanContent: 'Reply with exactly one word: "OK"',
      model: agent.model,
      temperature: 0,
      agentKey,
    });

    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      ok: true,
      latencyMs: Date.now() - started,
      preview: content.slice(0, 80),
    };
  } catch (err: unknown) {
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      ok: false,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function testAllAgentModels(): Promise<ModelTestResult[]> {
  const keys: AgentKey[] = [
    ...SPECIALIST_AGENTS.map((a) => a.key),
    "master",
  ];

  return Promise.all(keys.map((k) => testAgentModel(k)));
}
