"use client";

import { useRouter } from "next/navigation";
import { AkiroLogo } from "@/components/logo/AkiroLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "@/components/auth/SessionProvider";

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.762-1.605-2.665-.303-5.467-1.335-5.467-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.607-2.807 5.624-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function SignInForm() {
  const {
    signInWithGitHub,
    signInGuest,
    isLoading,
    isAuthenticated,
    githubConfigured,
  } = useSession();
  const router = useRouter();

  if (isAuthenticated) {
    return (
      <Card padding="lg" className="w-full max-w-md text-center">
        <AkiroLogo size={48} showWordmark className="justify-center mb-4" />
        <p className="text-sm text-muted mb-4">You are already signed in.</p>
        <Button fullWidth onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <AkiroLogo size={56} className="mb-4" />
        <h1 className="text-xl font-semibold text-foreground">Sign in to Akiro</h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          One website. Twenty tools. One expert AI. Zero unnecessary complexity.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={isLoading || githubConfigured === false}
          onClick={async () => {
            try {
              await signInWithGitHub();
            } catch (err) {
              alert(err instanceof Error ? err.message : String(err));
            }
          }}
          aria-label="Sign in with GitHub"
        >
          <GitHubIcon />
          {githubConfigured === false
            ? "GitHub — Needs configuration"
            : isLoading
              ? "Connecting…"
              : "Continue with GitHub"}
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-raised px-2 text-muted-foreground">
              or for local development
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={() => {
            signInGuest();
            router.push("/dashboard");
          }}
        >
          Continue as guest
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Guest mode is labelled and stored only in this browser.
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
        OAuth credentials are never embedded in the client. Configure{" "}
        <code className="font-mono text-muted">GITHUB_CLIENT_ID</code> and{" "}
        <code className="font-mono text-muted">GITHUB_CLIENT_SECRET</code> on
        the server only.
      </p>
    </Card>
  );
}
