import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { DEMO_ALERTS } from "@/lib/transit/data";
import { useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });
function AlertsPage() {
  const { customAlerts } = useAppState(); const alerts = [...customAlerts, ...DEMO_ALERTS];
  return <AppShell><PageHeader title="Service alerts" subtitle="Illustrative sample alerts. These are not operator-issued or live notifications." /><div className="mb-4"><DemoBadge label="Demo notices · verify with operator" /></div>
    <div className="space-y-3">{alerts.map((a) => <article key={a.id} className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2"><span className={"rounded-full px-2 py-1 text-xs font-bold " + (a.severity === "critical" ? "bg-coral-soft text-coral" : a.severity === "warning" ? "bg-warning-soft text-warning" : "bg-live-soft text-live")}>{a.severity.toUpperCase()}</span><span className="text-xs text-muted-foreground">{a.validFrom}–{a.validTo} IST</span></div>
      <h2 className="mt-2 font-bold">{a.title}</h2><p className="mt-1 text-sm">{a.body}</p><p className="mt-2 text-xs text-muted-foreground">Routes: {a.routeIds.join(", ") || "All"} · Stops: {a.stopIds.join(", ") || "Not specified"} · source: {a.source}</p>
    </article>)}</div>
  </AppShell>;
}