"use server";

export interface GenerateAvatarResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
  model?: string;
  latencyMs?: number;
}

/**
 * Sinh ảnh đại diện bệnh nhân bằng dịch vụ miễn phí Robohash.
 */
export async function generatePatientAvatar(
  prompt: string
): Promise<GenerateAvatarResult> {
  const started = Date.now();
  
  const seed = prompt.replace(/\s+/g, "_");
  const avatarUrl = `https://robohash.org/${encodeURIComponent(seed)}.png?size=150x150&set=set5`;

  return {
    success: true,
    dataUrl: avatarUrl,
    model: "robohash-free",
    latencyMs: Date.now() - started,
  };
}
