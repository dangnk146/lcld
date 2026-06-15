"use server";

import { MASTER_AGENT, SPECIALIST_AGENTS } from "@/lib/agents/config";
import { callLLM } from "@/lib/agents/llm";
import type { AgentKey } from "@/lib/types";
import { readEnvKey } from "./test-models-env";

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

function resolveKeys(openRouterKey: string, nvidiaKey: string) {
  return {
    openRouter: openRouterKey || readEnvKey("OPENROUTER_API_KEY"),
    nvidia: nvidiaKey || readEnvKey("NVIDIA_API_KEY"),
  };
}

export async function testAgentModel(
  agentKey: AgentKey,
  openRouterKey: string,
  nvidiaKey: string
): Promise<ModelTestResult> {
  const agent = getAgentMeta(agentKey);
  const keys = resolveKeys(openRouterKey, nvidiaKey);
  const started = Date.now();

  const needsOpenRouter = agent.provider === "openrouter";
  const needsNvidia = agent.provider === "nvidia";

  if (needsOpenRouter && !keys.openRouter) {
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      ok: false,
      latencyMs: 0,
      error: "Thiếu OpenRouter API Key",
    };
  }
  if (needsNvidia && !keys.nvidia) {
    return {
      key: agentKey,
      roleVi: agent.roleVi,
      provider: agent.providerLabel,
      model: agent.model,
      ok: false,
      latencyMs: 0,
      error: "Thiếu NVIDIA API Key",
    };
  }

  try {
    const content = await callLLM({
      systemPrompt: "You are a connectivity test assistant. Reply briefly.",
      humanContent: 'Reply with exactly one word: "OK"',
      model: agent.model,
      provider: agent.provider,
      openRouterKey: keys.openRouter,
      nvidiaKey: keys.nvidia,
      temperature: 0,
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

export async function testAllAgentModels(
  openRouterKey: string,
  nvidiaKey: string
): Promise<ModelTestResult[]> {
  const keys: AgentKey[] = [
    ...SPECIALIST_AGENTS.map((a) => a.key),
    "master",
  ];

  return Promise.all(keys.map((k) => testAgentModel(k, openRouterKey, nvidiaKey)));
}
