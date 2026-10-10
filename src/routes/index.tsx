import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { ConfidencePill, DemoBadge, OccupancyPill, useNowIST } from "@/components/rp/bits";
import { RouteMap } from "@/components/rp/RouteMap";
import { Button } from "@/components/ui/button";
import { actions } from "@/lib/transit/store";
import { STOPS } from "@/lib/transit/data";
import { fmtDuration, fmtMin, routeStops, searchSchema, searchTrips, type TripResult } from "@/lib/transit/logic";
import { useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoutePulse AI — Hyderabad bus departures, stops & ETA" },
      { name: "description", content: "Find exact pickup points, scheduled departures, fares and explainable ETAs for Hyderabad buses (demo data)." },
      { property: "og:title", content: "RoutePulse AI — Hyderabad bus departures, stops & ETA" },
      { property: "og:description", content: "Exact pickup points, every stop in sequence, transparent fares and explainable ETAs." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const now = useNowIST();
  const { delayOverrides, disabledStops, prefs } = useAppState();
  const [form, setForm] = useState({ origin: "AMP", destination: "HTC", date: "", passengers: "1" });
  const [wheelchair, setWheelchair] = useState(prefs.wheelchair);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<TripResult[] | null>(null);
  const [sel, setSel] = useState<TripResult | null>(null);
  const date = form.date || now?.date || "";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = searchSchema.safeParse({ ...form, date });
    if (!p.success) {
      setErrors(Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    const r = searchTrips(p.data, { nowMin: date === now?.date ? now.min : null, wheelchairOnly: wheelchair, delayOverrides, disabledStops });
    setResults(r);
    setSel(r[0] ?? null);
  }

  const mapStops = useMemo(() => (sel ? routeStops(sel.route) : []), [sel]);
  const field = "mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm";

  return (
    <AppShell>
      <section className="hero-surface mb-6 rounded-2xl p-6 md:p-8">
        <DemoBadge />
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">Know exactly where and when to board.</h1>
        <p className="mt-2 max-w-xl text-sm opacity-80">Designated pickup points, every stop in order, transparent fares and explainable ETAs — Hyderabad demo network, all times IST.</p>
        <form onSubmit={submit} className="mt-6 grid gap-3 rounded-xl bg-card p-4 text-foreground sm:grid-cols-2 lg:grid-cols-5" noValidate>
          {(["origin", "destination"] as const).map((k) => (
            <label key={k} className="text-xs font-semibold capitalize">{k === "origin" ? "From" : "To"}
              <select className={field} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]}>
                {STOPS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors[k] && <span className="mt-1 block text-coral">{errors[k]}</span>}
            </label>
          ))}
          <label className="text-xs font-semibold">Travel date
            <input type="date" className={field} value={date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <span className="mt-1 block text-coral">{errors.date}</span>}
          </label>
          <label className="text-xs font-semibold">Passengers
            <input type="number" min={1} max={9} className={field} value={form.passengers} onChange={(e) => setForm({ ...form, passengers: e.target.value })} />
            {errors.passengers && <span className="mt-1 block text-coral">{errors.passengers}</span>}
          </label>
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={wheelchair} onChange={(e) => setWheelchair(e.target.checked)} /> Wheelchair accessible only</label>
            <Button type="submit" className="w-full">Search buses</Button>
          </div>
        </form>
      </section>

      {results === null ? (
        <p className="text-sm text-muted-foreground">Pick stops and search to see departures.</p>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-sm">No direct demo buses for this pair{date === now?.date ? " for the rest of today" : ""}. Try another date or swap stops.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <PageHeader title={`${results.length} departures`} subtitle={`Demo schedule for ${date}. Times in IST.`} />
            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r.tripId}>
                  <button onClick={() => setSel(r)} aria-pressed={sel?.tripId === r.tripId}
                    className={`w-full rounded-xl border bg-card p-4 text-left shadow-card transition ${sel?.tripId === r.tripId ? "border-live ring-2 ring-live/30" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display font-bold">{r.route.shortName} · {r.route.operator}</p>
                        <p className="tabular text-lg">{fmtMin(r.depart)} → {fmtMin(r.arrive)} <span className="text-xs text-muted-foreground">({fmtDuration(r.duration)})</span></p>
                      </div>
                      <p className="text-right font-display text-xl font-bold">₹{r.fare.total}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span>ETA {fmtMin(r.eta.low)}–{fmtMin(r.eta.high)}</span>
                      <ConfidencePill value={r.eta.confidence} />
                      <OccupancyPill value={r.occupancy} />
                      <span className="text-muted-foreground">Reliability {r.reliability.score}/100</span>
                      {r.badges.map((b) => <span key={b} className="rounded-full bg-secondary px-2 py-0.5">{b}</span>)}
                    </div>
                  </button>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => actions.saveTrip({ tripId: r.tripId, routeId: r.route.id, routeName: r.route.name, date, pickupStopId: r.route.stops[r.fromIdx].stopId, dropStopId: r.route.stops[r.toIdx].stopId, pickupTime: r.depart, dropTime: r.arrive, passengers: Number(form.passengers), fare: r.fare.total, reminderMin: prefs.reminderMin, savedAt: new Date().toISOString(), confirmed: false })}>Save trip</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {sel && (
            <div className="space-y-4">
              <RouteMap stops={mapStops} fromIdx={sel.fromIdx} toIdx={sel.toIdx} title={sel.route.name} freshness="Schedule-based, no GPS feed" />
              <div className="rounded-xl border bg-card p-4 text-sm shadow-card">
                <h2 className="font-bold">Stops in sequence</h2>
                <ol className="mt-2 space-y-2">
                  {mapStops.map((s, i) => (
                    <li key={s.id} className={i >= sel.fromIdx && i <= sel.toIdx ? "" : "opacity-50"}>
                      <span className="tabular">{fmtMin(sel.depart - sel.route.stops[sel.fromIdx].offset + sel.route.stops[i].offset)}</span>{" "}
                      <strong>{s.name}</strong> — {s.landmark} {i === sel.fromIdx && "· Pickup"}{i === sel.toIdx && "· Drop"}
                    </li>
                  ))}
                </ol>
                <h2 className="mt-4 font-bold">Fare breakdown (per passenger)</h2>
                <ul className="mt-1">{sel.fare.lines.map((l) => <li key={l.label} className="flex justify-between"><span>{l.label}</span><span>₹{l.amount}</span></li>)}</ul>
                <p className="mt-2 text-xs text-muted-foreground">{sel.fare.note} {sel.reliability.basis}.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}