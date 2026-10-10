import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { ROUTES, STOPS, type ServiceAlert } from "@/lib/transit/data";
import { actions, useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/admin")({ component: AdminPage });
function AdminPage() {
  const { operatorMode, delayOverrides, disabledStops, customAlerts } = useAppState();
  const [routeId, setRouteId] = useState(ROUTES[0].id); const [delay, setDelay] = useState("8"); const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  function addAlert(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim() || !body.trim()) return;
    const a: ServiceAlert = { id: "operator-demo-" + Date.now(), severity: "warning", title: title.trim().slice(0, 100), body: body.trim().slice(0, 500), routeIds: [routeId], stopIds: [], validFrom: "00:00", validTo: "23:59", source: "operator-demo" };
    actions.addAlert(a); setTitle(""); setBody("");
  }
  return <AppShell><PageHeader title="Operator console" subtitle="Demo-only controls for simulated delays, stop availability and notices." />
    {!operatorMode ? <div className="rounded-xl border bg-card p-6"><h2 className="font-bold">Operator tools are disabled</h2><p className="mt-2 text-sm text-muted-foreground">Enable demo operator tools in Preferences. This flag is not production authorization.</p><Link className="mt-3 inline-block text-primary underline" to="/settings">Open preferences</Link></div> : <>
      <div className="mb-4"><DemoBadge label="Unsecured demo mode" /></div><div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Simulate route delay</h2><label className="mt-3 block text-sm">Route<select className="mt-1 block w-full rounded-lg border bg-background p-2" value={routeId} onChange={(e) => setRouteId(e.target.value)}>{ROUTES.map((r) => <option key={r.id} value={r.id}>{r.shortName} — {r.name}</option>)}</select></label><label className="mt-3 block text-sm">Delay minutes<input className="mt-1 block w-full rounded-lg border bg-background p-2" type="number" min="0" max="180" value={delay} onChange={(e) => setDelay(e.target.value)} /></label>
          <div className="mt-3 flex gap-2"><button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" onClick={() => actions.setDelay(routeId, Math.min(180, Math.max(0, Number(delay) || 0)))}>Apply demo delay</button><button className="rounded-lg border px-3 py-2 text-sm" onClick={() => actions.setDelay(routeId, null)}>Clear</button></div><p className="mt-2 text-xs text-muted-foreground">Current override: {delayOverrides[routeId] == null ? "none" : delayOverrides[routeId] + " minutes"}. No real vehicle is changed.</p>
        </section>
        <section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Stop availability simulation</h2><p className="mt-1 text-xs text-muted-foreground">Toggle one stop off to test route search validation.</p><ul className="mt-3 space-y-2">{route.stops.map((rs) => { const stop = STOPS.find((s) => s.id === rs.stopId)!; const key = route.id + ":" + stop.id; return <li key={key} className="flex items-center justify-between gap-3 rounded-lg border p-3"><span className="text-sm">{stop.name}<span className="block text-xs text-muted-foreground">{rs.pickup ? "Pickup " : ""}{rs.drop ? "Drop" : ""}</span></span><button aria-pressed={!!disabledStops[key]} onClick={() => actions.toggleStop(key)} className="rounded-md border px-3 py-1.5 text-xs font-semibold">{disabledStops[key] ? "Disabled · enable" : "Enabled · disable"}</button></li>; })}</ul></section>
        <section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Create demo service alert</h2><form className="mt-3 space-y-3" onSubmit={addAlert}><label className="block text-sm">Alert title<input required maxLength={100} className="mt-1 block w-full rounded-lg border bg-background p-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label><label className="block text-sm">Details<textarea required maxLength={500} rows={3} className="mt-1 block w-full rounded-lg border bg-background p-2" value={body} onChange={(e) => setBody(e.target.value)} /></label><button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Add alert</button></form><p className="mt-3 text-xs text-muted-foreground">{customAlerts.length} locally saved operator-demo alerts</p></section>
      </div>
    </>}
  </AppShell>;
}