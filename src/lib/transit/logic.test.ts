import { describe, expect, it } from "vitest";
import { ROUTES, STOPS } from "./data";
import { findRouteSegments, fareBreakdown, fmtMin, routeStops, searchSchema, searchTrips, simulatePosition } from "./logic";
describe("transit route and search logic", () => {
  it("rejects identical stops and invalid passenger counts", () => {
    expect(searchSchema.safeParse({ origin: "AMP", destination: "AMP", date: "2026-10-10", passengers: 1 }).success).toBe(false);
    expect(searchSchema.safeParse({ origin: "AMP", destination: "HTC", date: "2026-10-10", passengers: 0 }).success).toBe(false);
  });
  it("finds a direct route segment from Ameerpet to Hitech City", () => {
    expect(findRouteSegments("AMP", "HTC").some((x) => x.route.id === "R-10H")).toBe(true);
  });
  it("resolves stops in route order", () => {
    for (const route of ROUTES) { const stops = routeStops(route); expect(stops.length).toBe(route.stops.length); expect(stops.every((s) => STOPS.some((v) => v.id === s.id))).toBe(true); }
  });
  it("sorts results and keeps fares consistent for passenger count", () => {
    const results = searchTrips({ origin: "AMP", destination: "HTC", date: "2026-10-10", passengers: 2 });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r, i) => i === 0 || results[i - 1].eta.predicted <= r.eta.predicted)).toBe(true);
    expect(results[0].fare.total).toBe(results[0].fare.perPassenger * 2);
    expect(fareBreakdown(results[0].route, results[0].fromIdx, results[0].toIdx, 2).total).toBe(results[0].fare.total);
  });
  it("formats times after midnight and labels simulated position source", () => {
    expect(fmtMin(1500)).toContain("(+1d)");
    const route = ROUTES[0];
    expect(simulatePosition(route, route.firstDep, 0, route.firstDep - 1).status).toBe("scheduled");
    expect(simulatePosition(route, route.firstDep, 0, route.firstDep + 25).status).toBe("enroute");
    expect(simulatePosition(route, route.firstDep, 0, route.firstDep + 25).source).toBe("simulated-demo");
  });
});