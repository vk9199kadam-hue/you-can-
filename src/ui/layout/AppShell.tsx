import * as React from "react";
import { cn } from "../cn";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";

export type NavItem = { id: string; label: string; icon: string };

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-primary flex items-center justify-center font-extrabold text-white",
        size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base",
      )}
    >
      Y
    </div>
  );
}

export function AppShell({
  topPill,
  title,
  subtitle,
  navItems,
  activeNavId,
  onNavChange,
  userLabel,
  onLogout,
  headerActions,
  children,
}: {
  topPill?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  navItems: NavItem[];
  activeNavId: string;
  onNavChange: (id: string) => void;
  userLabel?: React.ReactNode;
  onLogout: () => void;
  /** e.g. notification bell */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" />
          <span className="font-bold text-[15px] text-text brand">YOU CAN</span>
          {topPill ? <div className="ml-2">{topPill}</div> : null}
        </div>
        <div className="flex items-center gap-4">
          {headerActions}
          {userLabel ? <span className="text-sm text-text-dim">{userLabel}</span> : null}
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-error hover:text-error hover:bg-[#FEF2F2]">
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        <nav className="w-60 bg-surface border-r border-border min-h-[calc(100vh-56px)] p-3 sticky top-14">
          {navItems.map((t) => (
            <button
              key={t.id}
              onClick={() => onNavChange(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition",
                activeNavId === t.id
                  ? "bg-[#EFF6FF] text-primary"
                  : "text-text-dim hover:bg-bg",
              )}
            >
              <span className="material-icons-outlined text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-8 max-w-[1100px]">
          <div className="mb-7">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              {title}
            </div>
            {subtitle ? (
              <div className="text-sm text-text-dim">{subtitle}</div>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Pill({ tone, children }: { tone: "info" | "success" | "warning" | "premium"; children: React.ReactNode }) {
  return <Badge tone={tone}>{children}</Badge>;
}

