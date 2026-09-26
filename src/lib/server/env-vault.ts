import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT, ensureProjectRoot } from "@/lib/server/paths";

const VAULT_FILE = "akiro-env-vault.json";

export type VaultEntry = {
  id: string;
  key: string;
  /** AES-GCM ciphertext as base64(iv + tag + data) opaque blob */
  ciphertext: string;
  maskedPreview: string;
  updatedAt: string;
};

type VaultFile = { version: 1; entries: VaultEntry[] };

function vaultPath(): string {
  ensureProjectRoot();
  return path.join(PROJECT_ROOT, VAULT_FILE);
}

function getSecret(): Buffer | null {
  const raw = process.env.ENV_VAULT_SECRET;
  if (!raw || raw.length < 16) return null;
  // Derive 32-byte key
  return crypto.createHash("sha256").update(raw).digest();
}

export function vaultConfigured(): boolean {
  return getSecret() !== null;
}

function mask(value: string): string {
  if (value.length <= 4) return "••••";
  return `${value.slice(0, 2)}${"•".repeat(Math.min(12, value.length - 2))}`;
}

function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(blob: string, key: Buffer): string {
  const buf = Buffer.from(blob, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

function readFile(): VaultFile {
  const p = vaultPath();
  if (!fs.existsSync(p)) return { version: 1, entries: [] };
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as VaultFile;
  } catch {
    return { version: 1, entries: [] };
  }
}

function writeFile(data: VaultFile): void {
  fs.writeFileSync(vaultPath(), JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
}

export function listVaultEntries(): {
  configured: boolean;
  entries: Omit<VaultEntry, "ciphertext">[];
} {
  const configured = vaultConfigured();
  if (!configured) return { configured: false, entries: [] };
  const file = readFile();
  return {
    configured: true,
    entries: file.entries.map(({ id, key, maskedPreview, updatedAt }) => ({
      id,
      key,
      maskedPreview,
      updatedAt,
    })),
  };
}

export function upsertVaultEntry(
  key: string,
  value: string,
): { ok: true; entries: Omit<VaultEntry, "ciphertext">[] } | { ok: false; error: string } {
  const secret = getSecret();
  if (!secret) {
    return {
      ok: false,
      error:
        "ENV_VAULT_SECRET is not set. Add a strong secret to .env.local (see .env.example).",
    };
  }
  if (!key.trim()) return { ok: false, error: "Key is required" };
  const file = readFile();
  const entries = file.entries.filter((e) => e.key !== key.trim());
  entries.push({
    id: `env-${Date.now()}`,
    key: key.trim(),
    ciphertext: encrypt(value, secret),
    maskedPreview: mask(value),
    updatedAt: new Date().toISOString(),
  });
  writeFile({ version: 1, entries });
  return {
    ok: true,
    entries: entries.map(({ id, key: k, maskedPreview, updatedAt }) => ({
      id,
      key: k,
      maskedPreview,
      updatedAt,
    })),
  };
}

export function removeVaultEntry(id: string): {
  ok: true;
  entries: Omit<VaultEntry, "ciphertext">[];
} | { ok: false; error: string } {
  if (!vaultConfigured()) {
    return { ok: false, error: "ENV_VAULT_SECRET is not set." };
  }
  const file = readFile();
  const entries = file.entries.filter((e) => e.id !== id);
  writeFile({ version: 1, entries });
  return {
    ok: true,
    entries: entries.map(({ id: i, key, maskedPreview, updatedAt }) => ({
      id: i,
      key,
      maskedPreview,
      updatedAt,
    })),
  };
}

export function revealVaultEntry(
  id: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const secret = getSecret();
  if (!secret) return { ok: false, error: "ENV_VAULT_SECRET is not set." };
  const entry = readFile().entries.find((e) => e.id === id);
  if (!entry) return { ok: false, error: "Entry not found" };
  try {
    return { ok: true, value: decrypt(entry.ciphertext, secret) };
  } catch {
    return { ok: false, error: "Decryption failed" };
  }
}
