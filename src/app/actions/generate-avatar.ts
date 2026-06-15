"use server";

import { readEnvKey } from "./test-models-env";

const FLUX_SCHNELL_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";

export interface GenerateAvatarResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  model?: string;
  latencyMs?: number;
}

export async function generatePatientAvatar(
  prompt: string,
  nvidiaKey: string
): Promise<GenerateAvatarResult> {
  const apiKey = nvidiaKey || readEnvKey("NVIDIA_API_KEY");
  if (!apiKey) {
    return { success: false, error: "Thiếu NVIDIA API Key. Lưu key tại tab Cấu hình." };
  }

  const started = Date.now();

  try {
    const response = await fetch(FLUX_SCHNELL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        steps: 4,
        seed: 0,
      }),
    });

    const bodyText = await response.text();
    if (!response.ok) {
      return {
        success: false,
        error: `NVIDIA FLUX lỗi ${response.status}: ${bodyText.slice(0, 300)}`,
        latencyMs: Date.now() - started,
      };
    }

    const data = JSON.parse(bodyText) as {
      artifacts?: { base64?: string; finishReason?: string }[];
    };

    const artifact = data.artifacts?.[0];
    if (!artifact?.base64) {
      return {
        success: false,
        error: "API không trả về ảnh (artifacts rỗng)",
        latencyMs: Date.now() - started,
      };
    }

    if (artifact.finishReason === "CONTENT_FILTERED") {
      return {
        success: false,
        error: "Ảnh bị content filter. Thử lại hoặc đổi mô tả.",
        latencyMs: Date.now() - started,
      };
    }

    if (artifact.finishReason === "ERROR") {
      return {
        success: false,
        error: "Model báo lỗi khi sinh ảnh",
        latencyMs: Date.now() - started,
      };
    }

    return {
      success: true,
      dataUrl: `data:image/jpeg;base64,${artifact.base64}`,
      model: "black-forest-labs/flux.1-schnell",
      latencyMs: Date.now() - started,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - started,
    };
  }
}
