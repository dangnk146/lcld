const STORAGE_KEY = "cardioshield_patient_avatars";

export function loadPatientAvatars(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePatientAvatar(patientId: string, dataUrl: string) {
  const all = loadPatientAvatars();
  all[patientId] = dataUrl;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function buildAvatarPrompt(name: string, age: number, sex: "male" | "female", status: "alive" | "deceased"): string {
  const gender = sex === "female" ? "Vietnamese woman" : "Vietnamese man";
  const mood = status === "deceased" ? "calm dignified expression" : "warm friendly expression";
  return `Professional clinical patient portrait photograph, head and shoulders only, ${gender}, approximately ${age} years old, named ${name}, ${mood}, neutral soft hospital lighting, clean light blue medical background, realistic skin texture, wearing simple casual shirt, medical EHR avatar style, photorealistic, high quality, no text, no watermark`;
}
