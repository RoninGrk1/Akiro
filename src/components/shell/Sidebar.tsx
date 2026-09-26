"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AkiroLogo } from "@/components/logo/AkiroLogo";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/auth/SessionProvider";
import { MAIN_NAV } from "@/lib/nav";
import { NavIconGlyph } from "@/components/shell/NavIcons";

export type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  /** Called when a nav link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useSession();

  return (
    <aside
      className={[
        "flex h-full flex-col border-r border-border bg-surface",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
      aria-label="Main navigation"
    >
      <div
        className={[
          "flex h-14 shrink-0 items-center border-b border-border-subtle",
          collapsed ? "justify-center px-2" : "justify-between px-3",
        ].join(" ")}
      >
        <Link
          href="/dashboard"
          className="rounded-md focus-visible:outline-none"
          aria-label="Akiro home"
          onClick={onNavigate}
        >
          <AkiroLogo size={collapsed ? 28 : 30} showWordmark={!collapsed} />
        </Link>
        {!collapsed ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            aria-expanded={!collapsed}
            className="!px-2 !min-h-11 !h-11 sm:!min-h-8 sm:!h-8"
          >
            <CollapseIcon />
          </Button>
        ) : null}
      </div>

      {collapsed ? (
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label="Expand sidebar"
            aria-expanded={!collapsed}
            className="!px-2 !min-h-11 !h-11 sm:!min-h-8 sm:!h-8"
          >
            <ExpandIcon />
          </Button>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        <ul className="flex flex-col gap-1">
          {MAIN_NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={[
                    "group relative flex items-center gap-3 rounded-md text-sm",
                    "transition-colors duration-150 ease-out",
                    "min-h-11 sm:min-h-0",
                    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 sm:py-2",
                    active
                      ? "bg-accent-green/10 text-accent-green"
                      : "text-muted hover:bg-surface-raised hover:text-foreground active:bg-surface-overlay",
                  ].join(" ")}
                >
                  {active ? (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent-green"
                      aria-hidden
                    />
                  ) : null}
                  <NavIconGlyph icon={item.icon} />
                  {!collapsed ? (
                    <span className="truncate">{item.label}</span>
                  ) : (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border-subtle p-2 akiro-safe-bottom">
        {isAuthenticated && user ? (
          <div
            className={[
              "flex items-center gap-2 rounded-md px-2 py-2 min-h-11",
              collapsed ? "justify-center" : "",
            ].join(" ")}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue/20 text-xs font-semibold text-accent-blue"
              aria-hidden
            >
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {user.name}
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-[11px] text-muted hover:text-foreground min-h-8 py-1"
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className={[
              "flex items-center rounded-md text-sm text-muted",
              "hover:bg-surface-raised hover:text-foreground active:bg-surface-overlay",
              "min-h-11",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
            ].join(" ")}
          >
            {collapsed ? <span aria-label="Sign in">↪</span> : "Sign in"}
          </Link>
        )}
      </div>
    </aside>
  );
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}
