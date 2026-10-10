import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { ROUTES, STOPS } from "@/lib/transit/data";
import { routesServing } from "@/lib/transit/logic";
import { actions, useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/stops")({ component: StopsPage });
function StopsPage() {
  const [query, setQuery] = useState("");
  const { favorites } = useAppState();
  const filtered = useMemo(() => STOPS.filter((s) => (s.name + " " + s.address + " " + s.landmark).toLowerCase().includes(query.trim().toLowerCase())), [query]);
  return <AppShell>
    <PageHeader title="Stop Finder" subtitle="Find designated pickup/drop landmarks, approximate addresses, listed accessibility and last-mile options." />
    <div className="mb-4"><DemoBadge label="Approximate demo stop details" /></div>
    <label className="block text-sm font-semibold">Search by stop, street, or landmark<input className="mt-1 w-full rounded-lg border bg-card px-3 py-3 text-sm" placeholder="Try Ameerpet, Pillar A1012, or Station Road" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
    <p className="mt-3 text-sm text-muted-foreground">{filtered.length} stops found</p>
    {filtered.length === 0 ? <div className="mt-4 rounded-xl border p-6 text-sm">No matching stops. Try another spelling or landmark.</div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{filtered.map((s) => {
      const served = routesServing(s.id); const fav = favorites.includes(s.id);
      return <article key={s.id} className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{s.name}</p><p className="mt-1 text-sm">{s.landmark}</p><p className="mt-1 text-xs text-muted-foreground">{s.address}</p></div><button onClick={() => actions.toggleFavorite(s.id)} aria-pressed={fav} className="rounded-lg border px-3 py-2 text-sm">{fav ? "★ Saved" : "☆ Save"}</button></div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-secondary px-2 py-1">{s.wheelchair ? "Step-free listed" : "Accessibility unverified"}</span><span className="rounded-full bg-secondary px-2 py-1">{s.shelter ? "Shelter listed" : "Shelter unavailable/unverified"}</span></div>
        <p className="mt-3 text-xs font-semibold">Served by: {served.length ? served.map((r) => r.shortName).join(", ") : "No demo route listed"}</p>
        <h3 className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Last mile</h3><ul className="mt-1 list-disc pl-5 text-sm">{s.lastMile.map((x) => <li key={x}>{x}</li>)}</ul>
        <a className="mt-3 inline-block text-sm font-semibold text-primary underline" href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.lat + "," + s.lon)} target="_blank" rel="noreferrer">Open map coordinates</a>
      </article>;
    })}</div>}
  </AppShell>;
}