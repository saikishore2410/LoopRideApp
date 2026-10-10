import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bus, Compass, MapPinned, MessageCircle, Settings, ShieldCheck, Ticket, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useAppState } from "@/lib/transit/store";
import { DATA_SOURCE } from "@/lib/transit/data";

const NAV = [
  { to: "/", label: "Explore", icon: Compass, mobile: true },
  { to: "/map", label: "Live Map", icon: MapPinned, mobile: true },
  { to: "/trips", label: "My Trips", icon: Ticket, mobile: true },
  { to: "/stops", label: "Stop Finder", icon: Search, mobile: false },
  { to: "/alerts", label: "Service Alerts", icon: AlertTriangle, mobile: true },
  { to: "/assistant", label: "RoutePulse AI", icon: MessageCircle, mobile: true },
  { to: "/settings", label: "Preferences", icon: Settings, mobile: false },
] as const;

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Bus className="size-4" aria-hidden />
      </span>
      RoutePulse<span className="text-sidebar-primary">AI</span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { operatorMode } = useAppState();
  return (
    <div className="min-h-screen md:pl-64">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex" aria-label="Primary">
        <div className="px-2 py-3"><Logo /></div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              <n.icon className="size-4" aria-hidden /> {n.label}
            </Link>
          ))}
          {operatorMode && (
            <Link to="/admin" className="mt-4 flex items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent" }}>
              <ShieldCheck className="size-4 text-sidebar-primary" aria-hidden /> Operator console
            </Link>
          )}
        </nav>
        <div className="rounded-xl border border-sidebar-border p-3 text-xs leading-relaxed text-sidebar-foreground/70">
          <p className="font-semibold text-sidebar-primary">{DATA_SOURCE.label}</p>
          <p className="mt-1">{DATA_SOURCE.detail}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Logo />
        <div className="flex gap-1">
          <Link to="/stops" aria-label="Stop finder" className="rounded-md p-2 hover:bg-sidebar-accent"><Search className="size-5" /></Link>
          {operatorMode && <Link to="/admin" aria-label="Operator console" className="rounded-md p-2 hover:bg-sidebar-accent"><ShieldCheck className="size-5" /></Link>}
          <Link to="/settings" aria-label="Preferences" className="rounded-md p-2 hover:bg-sidebar-accent"><Settings className="size-5" /></Link>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>

      <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.filter((n) => n.mobile).map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-live" }}>
            <n.icon className="size-5" aria-hidden />
            {n.label.replace("RoutePulse ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}