import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Settings"
        description="Preferences, account, and environment configuration for Akiro."
      />
      <div className="grid max-w-3xl gap-4">
        <Card>
          <CardHeader
            title="Appearance"
            description="Theme is dark (near-black #080B0D). Accents: green, blue, gold."
            action={<Badge variant="available">Available</Badge>}
          />
          <p className="text-xs text-muted">
            Language: British English (en-GB). Skip-to-content link is enabled on all shell pages.
          </p>
        </Card>
        <Card>
          <CardHeader
            title="Account & authentication"
            description="Guest mode is labelled. GitHub OAuth Needs configuration until server env vars are set."
            action={<Badge variant="configured">Needs configuration</Badge>}
          />
          <p className="text-xs text-muted font-mono">
            GITHUB_CLIENT_ID · GITHUB_CLIENT_SECRET — server only
          </p>
          <p className="mt-2 text-xs text-muted">
            See{" "}
            <Link href="/integrations" className="text-accent-blue hover:underline">
              Integrations
            </Link>{" "}
            and{" "}
            <Link href="/sign-in" className="text-accent-blue hover:underline">
              Sign in
            </Link>
            .
          </p>
        </Card>
        <Card>
          <CardHeader
            title="Environment variables"
            description="AES-GCM vault on disk (ENV_VAULT_SECRET in .env.local)."
            action={<Badge variant="available">Available</Badge>}
          />
          <Link href="/integrations" className="text-xs text-accent-blue hover:underline">
            Open env manager →
          </Link>
        </Card>
        <Card>
          <CardHeader
            title="RPC & explorers"
            description="Stored in localStorage from the Web3 Hub. Avoid API keys in URL query strings."
            action={<Badge variant="available">Available</Badge>}
          />
          <Link href="/web3" className="text-xs text-accent-blue hover:underline">
            Open Web3 Hub →
          </Link>
        </Card>
        <Card>
          <CardHeader
            title="Security"
            description="Read SECURITY.md for threat model, sandbox notes, and what Akiro never collects."
            action={<Badge variant="available">Available</Badge>}
          />
        </Card>
      </div>
    </div>
  );
}
