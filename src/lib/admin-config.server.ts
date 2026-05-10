// Server-only helpers for the local admin config file.
// The config holds a single admin's email + password (PLAIN TEXT — local app only).
// This file is read/written via Node's fs because the project is intended to run locally.
import { promises as fs } from "node:fs";
import path from "node:path";

export type AdminConfig = { email: string; password: string };

const CONFIG_PATH = path.resolve(process.cwd(), "config/admin.config.json");

const DEFAULTS: AdminConfig = { email: "admin@example.com", password: "admin123" };

export async function readAdminConfig(): Promise<AdminConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AdminConfig>;
    return {
      email: parsed.email ?? DEFAULTS.email,
      password: parsed.password ?? DEFAULTS.password,
    };
  } catch {
    // If the file is missing, fall back to defaults so login still works.
    return { ...DEFAULTS };
  }
}

export async function writeAdminConfig(next: AdminConfig): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
}

/** Decode the `x-admin-auth: Bearer base64(email:password)` header. */
export function decodeAdminToken(headerValue: string | null): { email: string; password: string } | null {
  if (!headerValue) return null;
  const token = headerValue.startsWith("Bearer ") ? headerValue.slice(7) : headerValue;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { email: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const cfg = await readAdminConfig();
  return cfg.email.trim().toLowerCase() === email.trim().toLowerCase() && cfg.password === password;
}
