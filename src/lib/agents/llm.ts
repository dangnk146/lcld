import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatMessage } from "@/app/actions";
import type { LLMProvider } from "./config";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";

export async function callLLM(params: {
  systemPrompt: string;
  humanContent: string;
  model: string;
  provider: LLMProvider;
  openRouterKey: string;
  nvidiaKey: string;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, humanContent, model, provider, openRouterKey, nvidiaKey, temperature = 0.3 } = params;

  const apiKey = provider === "nvidia" ? nvidiaKey : openRouterKey;
  const baseURL = provider === "nvidia" ? NVIDIA_BASE : OPENROUTER_BASE;

  if (!apiKey) {
    throw new Error(
      provider === "nvidia"
        ? "Thiếu NVIDIA API Key. Lấy tại https://build.nvidia.com và thêm NVIDIA_API_KEY vào .env"
        : "Thiếu OpenRouter API Key"
    );
  }

  const chat = new ChatOpenAI({
    apiKey,
    openAIApiKey: apiKey,
    modelName: model,
    temperature,
    configuration: { baseURL },
  });

  const response = await chat.invoke([new SystemMessage(systemPrompt), new HumanMessage(humanContent)]);
  return response.content.toString();
}

export async function callLLMWithChat(params: {
  systemPrompt: string;
  chatHistory: ChatMessage[];
  model: string;
  provider: LLMProvider;
  openRouterKey: string;
  nvidiaKey: string;
  temperature?: number;
}): Promise<string> {
  const { systemPrompt, chatHistory, model, provider, openRouterKey, nvidiaKey, temperature = 0.35 } = params;

  const apiKey = provider === "nvidia" ? nvidiaKey : openRouterKey;
  const baseURL = provider === "nvidia" ? NVIDIA_BASE : OPENROUTER_BASE;

  if (!apiKey) {
    throw new Error(
      provider === "nvidia"
        ? "Thiếu NVIDIA API Key. Lấy tại https://build.nvidia.com và thêm NVIDIA_API_KEY vào .env"
        : "Thiếu OpenRouter API Key"
    );
  }

  const chat = new ChatOpenAI({
    apiKey,
    openAIApiKey: apiKey,
    modelName: model,
    temperature,
    configuration: { baseURL },
  });

  const messages = [
    new SystemMessage(systemPrompt),
    ...chatHistory.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
  ];

  const response = await chat.invoke(messages);
  return response.content.toString();
}
