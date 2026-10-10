import { z } from "zod";
import { ROUTES, STOPS, routeById, stopById, type Stop, type TransitRoute } from "./data";

export const TZ = "Asia/Kolkata";

/* ---------- time helpers (all IST) ---------- */
export function istDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function istMinutes(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}
export function fmtMin(total: number): string {
  const day = Math.floor(total / 1440);
  const m = ((Math.round(total) % 1440) + 1440) % 1440;
  const s = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return day > 0 ? `${s} (+${day}d)` : s;
}
export function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}
export function fmtDateLong(date: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, 6)).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/* ---------- deterministic pseudo-random for demo values ---------- */
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/* ---------- geo ---------- */
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export function routeStops(route: TransitRoute): Stop[] {
  return route.stops.map((s) => stopById(s.stopId)!).filter(Boolean);
}
export function segmentKm(route: TransitRoute, fromIdx: number, toIdx: number): number {
  const st = routeStops(route);
  let km = 0;
  // road factor 1.3 over straight-line distance
  for (let i = fromIdx; i < toIdx; i++) km += haversineKm(st[i], st[i + 1]) * 1.3;
  return Math.round(km * 10) / 10;
}

/* ---------- fares (demo tariff, transparent) ---------- */
export interface FareLine { label: string; amount: number }
export interface FareBreakdown { perPassenger: number; total: number; passengers: number; lines: FareLine[]; note: string }

const TARIFF = {
  "city-ordinary": { base: 10, perKm: 1.2, label: "City Ordinary" },
  "metro-express": { base: 15, perKm: 1.6, label: "Metro Express" },
  "intercity-express": { base: 30, perKm: 1.35, label: "Intercity Express" },
} as const;

export function fareBreakdown(route: TransitRoute, fromIdx: number, toIdx: number, passengers = 1): FareBreakdown {
  const km = segmentKm(route, fromIdx, toIdx);
  const t = TARIFF[route.type];
  const lines: FareLine[] = [
    { label: `Base fare (${t.label})`, amount: t.base },
    { label: `Distance ${km} km × ₹${t.perKm}/km`, amount: Math.round(km * t.perKm) },
  ];
  if (route.type === "intercity-express") {
    lines.push({ label: "Toll share (demo)", amount: 12 });
    lines.push({ label: "Reservation fee", amount: 20 });
    const sub = lines.reduce((a, l) => a + l.amount, 0);
    lines.push({ label: "GST 5% on fee+fare (demo)", amount: Math.round(sub * 0.05) });
  }
  const raw = lines.reduce((a, l) => a + l.amount, 0);
  // round to nearest ₹5 as operators commonly do
  const perPassenger = Math.max(5, Math.round(raw / 5) * 5);
  const rounding = perPassenger - raw;
  if (rounding !== 0) lines.push({ label: "Rounding to nearest ₹5", amount: rounding });
  return { perPassenger, total: perPassenger * passengers, passengers, lines, note: "Demo tariff for illustration. Confirm with conductor/operator." };
}

/* ---------- reliability (published vs actual, DEMO history) ---------- */
export interface Reliability { score: number; onTimePct: number; avgDelay: number; sampleSize: number; basis: string }
export function reliability(routeId: string): Reliability {
  const n = 30;
  let onTime = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const delay = Math.round(hash(`${routeId}-hist-${i}`) ** 2 * 18) - 2;
    total += Math.max(0, delay);
    if (delay <= 5) onTime++;
  }
  const onTimePct = Math.round((onTime / n) * 100);
  const avgDelay = Math.round((total / n) * 10) / 10;
  const score = Math.round(onTimePct * 0.8 + Math.max(0, 20 - avgDelay * 2));
  return { score: Math.min(100, score), onTimePct, avgDelay, sampleSize: n, basis: `Simulated: ${n} past trips (demo history), on-time = within 5 min of published schedule` };
}

/* ---------- trips ---------- */
export interface TripRef { routeId: string; date: string; depMin: number }
export function buildTripId(t: TripRef): string {
  return `${t.routeId}_${t.date.replaceAll("-", "")}_${String(t.depMin).padStart(4, "0")}`;
}
export function parseTripId(id: string): TripRef | null {
  const m = /^([A-Z0-9-]+)_(\d{4})(\d{2})(\d{2})_(\d{4})$/.exec(id);
  if (!m || !routeById(m[1])) return null;
  const depMin = Number(m[5]);
  if (depMin >= 1440) return null;
  return { routeId: m[1], date: `${m[2]}-${m[3]}-${m[4]}`, depMin };
}
export function departures(route: TransitRoute): number[] {
  const out: number[] = [];
  for (let t = route.firstDep; t <= route.lastDep; t += route.headway) out.push(t);
  return out;
}

export type Occupancy = "low" | "medium" | "high";
export function demoOccupancy(tripId: string, depMin: number): Occupancy {
  const peak = (depMin >= 480 && depMin <= 630) || (depMin >= 1020 && depMin <= 1200);
  const r = hash(`${tripId}-occ`) + (peak ? 0.45 : 0);
  return r > 1.05 ? "high" : r > 0.6 ? "medium" : "low";
}
export function demoDelay(tripId: string, override?: number): number {
  if (typeof override === "number") return override;
  return Math.round(hash(`${tripId}-delay`) ** 2 * 12);
}

export interface Eta { predicted: number; low: number; high: number; confidence: "high" | "medium" | "low"; factors: string[] }
export function explainEta(scheduled: number, delay: number, rel: Reliability, stopsAhead: number): Eta {
  const spread = Math.max(1, Math.round((100 - rel.onTimePct) / 15 + stopsAhead * 0.4));
  const confidence = spread <= 3 ? "high" : spread <= 6 ? "medium" : "low";
  return {
    predicted: scheduled + delay,
    low: scheduled + Math.max(0, delay - spread),
    high: scheduled + delay + spread,
    confidence,
    factors: [
      `Published schedule: ${fmtMin(scheduled)} IST`,
      delay ? `Current demo delay: +${delay} min` : "No delay in demo feed",
      `Route history: ${rel.onTimePct}% on-time (${rel.sampleSize} demo trips)`,
      `${stopsAhead} stop(s) before yours add uncertainty ±${spread} min`,
    ],
  };
}

/* ---------- search ---------- */
export const searchSchema = z
  .object({
    origin: z.string().trim().min(1, "Choose a starting stop").max(10),
    destination: z.string().trim().min(1, "Choose a destination stop").max(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)"),
    passengers: z.coerce.number().int("Whole passengers only").min(1, "At least 1 passenger").max(9, "Max 9 passengers per booking"),
  })
  .refine((v) => v.origin !== v.destination, { message: "Origin and destination must differ", path: ["destination"] })
  .refine((v) => !!stopById(v.origin), { message: "Unknown origin stop", path: ["origin"] })
  .refine((v) => !!stopById(v.destination), { message: "Unknown destination stop", path: ["destination"] });
export type SearchInput = z.infer<typeof searchSchema>;

export interface TripResult {
  tripId: string;
  route: TransitRoute;
  fromIdx: number;
  toIdx: number;
  depart: number;
  arrive: number;
  delay: number;
  eta: Eta;
  duration: number;
  fare: FareBreakdown;
  occupancy: Occupancy;
  reliability: Reliability;
  badges: string[];
}

export interface SearchOptions {
  nowMin?: number | null; // only show upcoming when searching today
  wheelchairOnly?: boolean;
  delayOverrides?: Record<string, number>;
  disabledStops?: Record<string, boolean>;
  limit?: number;
}

export function findRouteSegments(origin: string, destination: string, disabled: Record<string, boolean> = {}) {
  const out: { route: TransitRoute; fromIdx: number; toIdx: number }[] = [];
  for (const route of ROUTES) {
    const fromIdx = route.stops.findIndex((s) => s.stopId === origin && s.pickup && !disabled[`${route.id}:${s.stopId}`]);
    const toIdx = route.stops.findIndex((s) => s.stopId === destination && s.drop && !disabled[`${route.id}:${s.stopId}`]);
    if (fromIdx >= 0 && toIdx > fromIdx) out.push({ route, fromIdx, toIdx });
  }
  return out;
}

export function searchTrips(input: SearchInput, opts: SearchOptions = {}): TripResult[] {
  const results: TripResult[] = [];
  for (const { route, fromIdx, toIdx } of findRouteSegments(input.origin, input.destination, opts.disabledStops)) {
    if (opts.wheelchairOnly) {
      const a = stopById(route.stops[fromIdx].stopId)!;
      const b = stopById(route.stops[toIdx].stopId)!;
      if (!route.lowFloor || !a.wheelchair || !b.wheelchair) continue;
    }
    const rel = reliability(route.id);
    for (const dep of departures(route)) {
      const depart = dep + route.stops[fromIdx].offset;
      if (opts.nowMin != null && depart < opts.nowMin - 2) continue;
      const tripId = buildTripId({ routeId: route.id, date: input.date, depMin: dep });
      const delay = demoDelay(tripId, opts.delayOverrides?.[route.id]);
      const arrive = dep + route.stops[toIdx].offset;
      const badges: string[] = [];
      if (route.lowFloor) badges.push("Low-floor");
      if (route.type === "intercity-express") badges.push("Intercity");
      if (route.type === "metro-express") badges.push("Express");
      results.push({
        tripId, route, fromIdx, toIdx, depart, arrive, delay,
        eta: explainEta(depart, delay, rel, fromIdx),
        duration: arrive - depart,
        fare: fareBreakdown(route, fromIdx, toIdx, input.passengers),
        occupancy: demoOccupancy(tripId, dep),
        reliability: rel,
        badges,
      });
    }
  }
  results.sort((a, b) => a.eta.predicted - b.eta.predicted);
  return results.slice(0, opts.limit ?? 12);
}

/** Crowd-aware suggestion: a later departure within 40 min that is less crowded. */
export function crowdAlternative(results: TripResult[], current: TripResult): TripResult | null {
  if (current.occupancy === "low") return null;
  const rank = { low: 0, medium: 1, high: 2 } as const;
  return (
    results.find(
      (r) => r.tripId !== current.tripId && r.eta.predicted > current.eta.predicted && r.eta.predicted - current.eta.predicted <= 40 && rank[r.occupancy] < rank[current.occupancy],
    ) ?? null
  );
}

/* ---------- vehicle position (SIMULATED from schedule) ---------- */
export interface SimPosition { status: "scheduled" | "enroute" | "completed"; lat: number; lon: number; segIdx: number; frac: number; source: "simulated-demo" }
export function simulatePosition(route: TransitRoute, depMin: number, delay: number, nowMin: number): SimPosition {
  const st = routeStops(route);
  const t = nowMin - depMin - delay;
  const last = route.stops[route.stops.length - 1].offset;
  if (t <= 0) return { status: "scheduled", lat: st[0].lat, lon: st[0].lon, segIdx: 0, frac: 0, source: "simulated-demo" };
  if (t >= last) { const s = st[st.length - 1]; return { status: "completed", lat: s.lat, lon: s.lon, segIdx: st.length - 1, frac: 1, source: "simulated-demo" }; }
  let i = 0;
  while (i < route.stops.length - 1 && route.stops[i + 1].offset <= t) i++;
  const a = route.stops[i].offset;
  const b = route.stops[i + 1].offset;
  const frac = (t - a) / (b - a);
  return { status: "enroute", lat: st[i].lat + (st[i + 1].lat - st[i].lat) * frac, lon: st[i].lon + (st[i + 1].lon - st[i].lon) * frac, segIdx: i, frac, source: "simulated-demo" };
}

export function googleMapsLink(stops: Stop[]): string {
  if (stops.length < 2) return "https://www.google.com/maps";
  const p = (s: Stop) => `${s.lat},${s.lon}`;
  const wps = stops.slice(1, -1).slice(0, 8).map(p).join("|");
  const u = new URLSearchParams({ api: "1", origin: p(stops[0]), destination: p(stops[stops.length - 1]), travelmode: "transit" });
  if (wps) u.set("waypoints", wps);
  return `https://www.google.com/maps/dir/?${u.toString()}`;
}

export function nearestStops(lat: number, lon: number, n = 3) {
  return STOPS.map((s) => ({ stop: s, km: haversineKm({ lat, lon }, s) })).sort((a, b) => a.km - b.km).slice(0, n);
}
export function routesServing(stopId: string) {
  return ROUTES.filter((r) => r.stops.some((s) => s.stopId === stopId));
}

/* ---------- input sanitising ---------- */
export function sanitizeText(input: unknown, max = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}