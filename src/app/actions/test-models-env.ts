import fs from "fs";
import path from "path";

export function readEnvKey(name: string): string {
  const fromProcess = process.env[name] || "";
  if (fromProcess) return fromProcess.trim();

  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, "m"));
      if (match?.[1]) return match[1].replace(/\r/g, "").trim().replace(/['"]/g, "");
    }
  } catch {
    /* ignore */
  }
  return "";
}
