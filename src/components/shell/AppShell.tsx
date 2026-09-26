"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { RightPanel } from "@/components/shell/RightPanel";
import { BottomPanel } from "@/components/shell/BottomPanel";
import { ConsoleProvider } from "@/components/shell/ConsoleContext";
import { AiChatProvider } from "@/components/ai/AiChatContext";
import { Button } from "@/components/ui/Button";

export type AppShellProps = {
  children: ReactNode;
};

const SIGN_IN_PATH = "/sign-in";

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === SIGN_IN_PATH;
  const isWorkspace = pathname.startsWith("/workspace");
  const isAiLab = pathname.startsWith("/ai-lab");
  const isImmersive = isWorkspace || isAiLab;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // Workspace defaults to console open (terminal); elsewhere starts collapsed
  const [bottomCollapsed, setBottomCollapsed] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleDistractionFree = useCallback(() => {
    setSidebarCollapsed(true);
    setRightCollapsed(true);
    setBottomCollapsed(true);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
        Critical layout: h-screen + overflow-hidden on the root, and min-h-0 on
        every nested flex child that should scroll. The bottom panel is a
        sibling of the main row (not absolute), so opening it shrinks main
        content instead of covering it.
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
              className="absolute inset-0 bg-black/60"
              aria-label="Close navigation"
              onClick={closeMobileNav}
            />
            <div className="relative z-10 h-full w-64 shadow-xl">
              <Sidebar
                collapsed={false}
                onToggle={closeMobileNav}
                onNavigate={closeMobileNav}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden !px-2"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <MenuIcon />
              </Button>
              <span className="hidden sm:inline text-xs text-muted">
                Distraction-free mode available
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDistractionFree}
                aria-label="Enter distraction-free mode"
                title="Collapse all panels"
              >
                Focus
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightCollapsed((v) => !v)}
                aria-label={rightCollapsed ? "Show AI chat" : "Hide AI chat"}
                className="hidden sm:inline-flex"
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

          {/* Bottom panel: in normal flow — collapses reclaim space */}
          <BottomPanel
            collapsed={bottomCollapsed}
            onToggle={() => setBottomCollapsed((v) => !v)}
          />
        </div>
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
