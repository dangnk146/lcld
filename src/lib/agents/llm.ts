import type { ChatMessage } from "@/app/actions";

const OPENCLAW_BASE = "http://127.0.0.1:18789/v1";
const OPENCLAW_API_KEY = "openclaw-gateway-secure-token-2026";

/**
 * Gọi OpenClaw Gateway — endpoint /v1/chat/completions.
 * Sử dụng header `x-openclaw-agent-id` để định tuyến tới agent tương ứng.
 */
export async function callLLM(params: {
  systemPrompt: string;
  humanContent: string;
  model: string;
  temperature?: number;
  agentKey?: string;
}): Promise<string> {
  const { systemPrompt, humanContent, model, temperature = 0.3, agentKey } = params;

  const mappedAgentId = agentKey === "master" ? "main" : agentKey || "main";

  const response = await fetch(`${OPENCLAW_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENCLAW_API_KEY}`,
      "x-openclaw-agent-id": mappedAgentId,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: humanContent },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenClaw Gateway lỗi ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}

/**
 * Gọi OpenClaw Gateway với lịch sử chat (multi-turn).
 */
export async function callLLMWithChat(params: {
  systemPrompt: string;
  chatHistory: ChatMessage[];
  model: string;
  temperature?: number;
  agentKey?: string;
}): Promise<string> {
  const { systemPrompt, chatHistory, model, temperature = 0.35, agentKey } = params;

  const mappedAgentId = agentKey === "master" ? "main" : agentKey || "main";

  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  const response = await fetch(`${OPENCLAW_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENCLAW_API_KEY}`,
      "x-openclaw-agent-id": mappedAgentId,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenClaw Gateway lỗi ${response.status}: ${text}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}
