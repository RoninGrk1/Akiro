"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/shell/Sidebar";
import { RightPanel } from "@/components/shell/RightPanel";
import { BottomPanel } from "@/components/shell/BottomPanel";
import { ConsoleProvider } from "@/components/shell/ConsoleContext";
import { AiChatProvider } from "@/components/ai/AiChatContext";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { Button } from "@/components/ui/Button";
import { MAIN_NAV } from "@/lib/nav";

export type AppShellProps = {
  children: ReactNode;
};

const SIGN_IN_PATH = "/sign-in";

const PAGE_META: Record<string, { title: string; helper: string }> = {
  "/dashboard": {
    title: "Dashboard",
    helper: "Your tools at a glance",
  },
  "/workspace": {
    title: "Workspace",
    helper: "Edit, build, and run locally",
  },
  "/ai-lab": {
    title: "AI Coding Lab",
    helper: "Ask Akiro with real model replies",
  },
  "/web3": {
    title: "Web3 Hub",
    helper: "Wallet, RPC, and contracts",
  },
  "/tools": {
    title: "Developer Tools",
    helper: "All twenty tools, one catalogue",
  },
  "/integrations": {
    title: "Integrations",
    helper: "Connect services when you are ready",
  },
  "/settings": {
    title: "Settings",
    helper: "Preferences and environment",
  },
};

function metaForPath(pathname: string) {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  const match = MAIN_NAV.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/"),
  );
  if (match && PAGE_META[match.href]) return PAGE_META[match.href];
  return { title: "Akiro", helper: "" };
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === SIGN_IN_PATH;
  const isWorkspace = pathname.startsWith("/workspace");
  const isAiLab = pathname.startsWith("/ai-lab");
  const isImmersive = isWorkspace || isAiLab;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileAiOpen, setMobileAiOpen] = useState(false);

  const pageMeta = useMemo(() => metaForPath(pathname), [pathname]);
  const [navPath, setNavPath] = useState(pathname);

  // Close mobile overlays when the route changes (adjust during render).
  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
    if (mobileAiOpen) setMobileAiOpen(false);
  }

  // Lock body scroll when mobile drawers open
  useEffect(() => {
    if (mobileNavOpen || mobileAiOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileNavOpen, mobileAiOpen]);

  const toggleDistractionFree = useCallback(() => {
    setSidebarCollapsed(true);
    setRightCollapsed(true);
    setBottomCollapsed(true);
    setMobileAiOpen(false);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  if (isAuthPage) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 akiro-safe-bottom akiro-safe-top">
        {children}
      </div>
    );
  }

  return (
    <AiChatProvider>
      <ConsoleProvider
        bottomCollapsed={bottomCollapsed}
        setBottomCollapsed={setBottomCollapsed}
      >
        {/*
          Critical layout: h-dvh + overflow-hidden on the root, and min-h-0 on
          every nested flex child that should scroll. The bottom panel is a
          sibling of the main row (not absolute) on desktop; on mobile workspace
          it opens as a sheet so the editor stays full-width.
        */}
        <div className="flex h-dvh max-h-dvh overflow-hidden bg-background text-foreground">
          {/* Desktop sidebar */}
          <div className="hidden md:flex h-full min-h-0 shrink-0">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
            />
          </div>

          {/* Mobile sidebar overlay */}
          {mobileNavOpen ? (
            <div
              className="fixed inset-0 z-40 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/60 akiro-overlay"
                aria-label="Close navigation"
                onClick={closeMobileNav}
              />
              <div className="relative z-10 h-full w-[min(18rem,85vw)] shadow-[var(--shadow-lg)] akiro-drawer-left">
                <Sidebar
                  collapsed={false}
                  onToggle={closeMobileNav}
                  onNavigate={closeMobileNav}
                />
              </div>
            </div>
          ) : null}

          {/* Mobile AI sheet */}
          {mobileAiOpen ? (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="AI chat"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/60 akiro-overlay"
                aria-label="Close AI chat"
                onClick={() => setMobileAiOpen(false)}
              />
              <div
                className={[
                  "absolute inset-x-0 bottom-0 z-10 flex flex-col",
                  "h-[75dvh] max-h-[85dvh] rounded-t-xl border border-border bg-surface",
                  "shadow-[var(--shadow-lg)] akiro-sheet-up akiro-safe-bottom",
                ].join(" ")}
              >
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle px-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      AI chat
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileAiOpen(false)}
                    aria-label="Close AI chat"
                    className="!px-2 !min-h-10 !h-10"
                  >
                    ✕
                  </Button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <AiChatPanel showContext compact />
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* Top bar */}
            <header className="flex h-12 sm:h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-2 sm:px-3 akiro-safe-top">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden !px-2 !min-h-10 !h-10"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <MenuIcon />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground leading-tight">
                    {pageMeta.title}
                  </p>
                  {pageMeta.helper ? (
                    <p className="hidden sm:block truncate text-[11px] text-muted-foreground leading-tight">
                      {pageMeta.helper}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!isWorkspace ? (
                  <Link href="/workspace" className="hidden sm:inline-flex">
                    <Button size="sm" variant="primary">
                      Open workspace
                    </Button>
                  </Link>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDistractionFree}
                  aria-label="Enter distraction-free mode"
                  title="Collapse all panels"
                  className="hidden sm:inline-flex"
                >
                  Focus
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Desktop: toggle right panel; mobile/tablet: sheet
                    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
                      setRightCollapsed((v) => !v);
                    } else {
                      setMobileAiOpen((v) => !v);
                    }
                  }}
                  aria-label={
                    mobileAiOpen || !rightCollapsed
                      ? "Hide AI chat"
                      : "Show AI chat"
                  }
                  className="!min-h-10 !h-10 sm:!min-h-8 sm:!h-8"
                >
                  AI
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBottomCollapsed((v) => !v)}
                  aria-label={
                    bottomCollapsed ? "Show console panel" : "Hide console panel"
                  }
                  className="!min-h-10 !h-10 sm:!min-h-8 sm:!h-8"
                >
                  Console
                </Button>
              </div>
            </header>

            {/* Main + right: takes remaining height above bottom panel */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <main
                id="main-content"
                className={
                  isImmersive
                    ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
                    : "min-h-0 min-w-0 flex-1 overflow-auto"
                }
                tabIndex={-1}
              >
                {children}
              </main>
              <div className="hidden lg:flex h-full min-h-0 shrink-0">
                <RightPanel
                  collapsed={rightCollapsed}
                  onToggle={() => setRightCollapsed((v) => !v)}
                />
              </div>
            </div>

            {/* Bottom panel: in-flow on desktop; sheet on mobile for workspace */}
            <BottomPanel
              collapsed={bottomCollapsed}
              onToggle={() => setBottomCollapsed((v) => !v)}
              mobileSheet={isWorkspace}
            />
          </div>

          {/* Mobile AI FAB — only when immersive and sheet closed */}
          {!mobileAiOpen && isImmersive ? (
            <button
              type="button"
              onClick={() => setMobileAiOpen(true)}
              className={[
                "fixed z-30 lg:hidden",
                "bottom-[4.5rem] right-4",
                "flex h-12 w-12 items-center justify-center rounded-full",
                "bg-accent-green text-background shadow-[var(--glow-green)]",
                "active:scale-95 transition-transform duration-150",
                "akiro-safe-bottom",
              ].join(" ")}
              aria-label="Open AI chat"
            >
              <ChatFabIcon />
            </button>
          ) : null}
        </div>
      </ConsoleProvider>
    </AiChatProvider>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ChatFabIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
