import { DEMO_ALERTS, ROUTES } from "./transit/data";
import { buildTripId, demoDelay, departures } from "./transit/logic";

export const ALL_ALERTS_STATIC = DEMO_ALERTS;

/** App-data tool: next demo departures from a stop after nowMin. */
export function nextDeparturesFrom(stopId: string, nowMin: number, n = 3, date = "2026-01-01") {
  const out: { route: string; time: number; delay: number }[] = [];
  for (const r of ROUTES) {
    const idx = r.stops.findIndex((s) => s.stopId === stopId && s.pickup);
    if (idx < 0) continue;
    for (const d of departures(r)) {
      const t = d + r.stops[idx].offset;
      if (t >= nowMin) {
        out.push({ route: r.shortName, time: t, delay: demoDelay(buildTripId({ routeId: r.id, date, depMin: d })) });
        if (out.filter((o) => o.route === r.shortName).length >= 2) break;
      }
    }
  }
  return out.sort((a, b) => a.time - b.time).slice(0, n);
}