import { NextResponse } from "next/server";
import { getFeatureStatuses } from "@/lib/server/config-status";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    features: getFeatureStatuses(),
    walletConnectProjectId: Boolean(
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim(),
    ),
    aiConfigured: Boolean(process.env.AI_API_KEY?.trim()),
    githubConfigured: Boolean(
      process.env.GITHUB_CLIENT_ID?.trim() &&
        process.env.GITHUB_CLIENT_SECRET?.trim(),
    ),
    ipfsConfigured: Boolean(
      process.env.IPFS_JWT?.trim() || process.env.WEB3_STORAGE_TOKEN?.trim(),
    ),
    vercelConfigured: Boolean(process.env.VERCEL_TOKEN?.trim()),
    envVaultConfigured: Boolean(process.env.ENV_VAULT_SECRET?.trim()),
  });
}
