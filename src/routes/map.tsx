import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge, useNowIST } from "@/components/rp/bits";
import { RouteMap } from "@/components/rp/RouteMap";
import { ROUTES } from "@/lib/transit/data";
import { departures, routeStops, simulatePosition, fmtMin } from "@/lib/transit/logic";

export const Route = createFileRoute("/map")({ component: MapPage });
function MapPage() {
  const now = useNowIST();
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const list = departures(route);
  const dep = now ? (list.filter((d) => d <= now.min && d + route.stops[route.stops.length - 1].offset >= now.min).at(-1) ?? list.find((d) => d > now.min) ?? list[0]) : route.firstDep;
  const pos = simulatePosition(route, dep, 0, now?.min ?? dep);
  const stops = routeStops(route);
  const near = stops[Math.min(pos.segIdx, stops.length - 1)];
  return <AppShell>
    <PageHeader title="Route map" subtitle="Route lines and bus markers are simulated from sample timetable data, not live GPS." />
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <label className="text-sm font-semibold">Choose route
        <select className="mt-1 block rounded-md border bg-background px-3 py-2" value={routeId} onChange={(e) => setRouteId(e.target.value)}>
          {ROUTES.map((r) => <option key={r.id} value={r.id}>{r.shortName} — {r.name}</option>)}
        </select>
      </label>
      <DemoBadge label="Simulated position" /><span className="text-sm text-muted-foreground">Schedule departure: {fmtMin(dep)} IST</span>
    </div>
    <RouteMap stops={stops} bus={{ lat: pos.lat, lon: pos.lon, label: near.name }} title={route.name} freshness="Simulated from sample schedule · no GPS feed" />
    <section className="mt-5 rounded-xl border bg-card p-4"><h2 className="font-bold">Stops in sequence</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stops.map((s, i) => <li key={s.id} className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">Stop {i + 1} · {fmtMin(dep + route.stops[i].offset)}</p><p className="font-semibold">{s.name}</p><p className="mt-1 text-xs">{s.landmark}</p><p className="mt-1 text-xs text-muted-foreground">{s.address}</p>
      </li>)}</ol>
    </section>
  </AppShell>;
}