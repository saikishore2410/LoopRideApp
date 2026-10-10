import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { actions, useAppState } from "@/lib/transit/store";
import { STOPS } from "@/lib/transit/data";
import { fmtDateLong, fmtMin, googleMapsLink, routeById, routeStops } from "@/lib/transit/logic";

export const Route = createFileRoute("/trips")({ component: TripsPage });
function TripsPage() {
  const { trips } = useAppState();
  return <AppShell>
    <PageHeader title="My trips" subtitle="Saved plans are stored on this device. No ticket is purchased or booking confirmed." />
    <div className="mb-4"><DemoBadge label="Saved locally · not a ticket" /></div>
    {trips.length === 0 ? <div className="rounded-xl border bg-card p-8 text-center">
      <h2 className="text-lg font-bold">No saved trips yet</h2><p className="mt-2 text-sm text-muted-foreground">Search for a bus and save a departure to keep its stops and times handy.</p>
      <Link to="/" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Explore buses</Link>
    </div> : <div className="space-y-4">{trips.map((t) => {
      const route = routeById(t.routeId); const pickup = STOPS.find((s) => s.id === t.pickupStopId); const drop = STOPS.find((s) => s.id === t.dropStopId);
      return <article key={t.tripId} className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{t.routeName}</p><p className="mt-1 text-sm text-muted-foreground">{fmtDateLong(t.date)} · {t.passengers} passenger(s)</p></div><p className="text-lg font-bold">₹{t.fare}</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Pickup · {fmtMin(t.pickupTime)} IST</p><p className="font-semibold">{pickup?.name ?? t.pickupStopId}</p><p className="text-xs">{pickup?.landmark}</p></div><div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">Drop · {fmtMin(t.dropTime)} IST</p><p className="font-semibold">{drop?.name ?? t.dropStopId}</p><p className="text-xs">{drop?.landmark}</p></div></div>
        {route && <a className="mt-3 inline-block text-sm font-semibold text-primary underline" href={googleMapsLink(routeStops(route))} target="_blank" rel="noreferrer">Open route in Google Maps</a>}
        <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg border px-3 py-2 text-sm font-semibold" onClick={() => { const url = window.location.origin + "/trips?trip=" + encodeURIComponent(t.tripId); void navigator.clipboard?.writeText(url); }}>Copy trip link</button><button className="rounded-lg border border-coral/40 px-3 py-2 text-sm font-semibold text-coral" onClick={() => actions.removeTrip(t.tripId)}>Remove trip</button></div>
      </article>;
    })}</div>}
    <section className="mt-6 rounded-xl border p-4 text-sm"><h2 className="font-bold">Missed-stop support</h2><p className="mt-1 text-muted-foreground">If you miss a stop, use Stop Finder for the next route and last-mile options. For immediate danger in India, call 112.</p><Link className="mt-2 inline-block text-primary underline" to="/stops">Open Stop Finder</Link></section>
  </AppShell>;
}