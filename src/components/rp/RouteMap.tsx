import { ExternalLink } from "lucide-react";
import type { Stop } from "@/lib/transit/data";
import { googleMapsLink } from "@/lib/transit/logic";
import { DemoBadge } from "./bits";

interface Props {
  stops: Stop[];
  fromIdx?: number;
  toIdx?: number;
  bus?: { lat: number; lon: number; label: string } | null;
  title: string;
  freshness?: string;
}

const W = 600;
const H = 380;
const PAD = 44;

/** Stylised schematic map (no tile provider configured). Positions projected from lat/lon. */
export function RouteMap({ stops, fromIdx, toIdx, bus, title, freshness }: Props) {
  if (stops.length < 2) {
    return <div className="grid h-64 place-items-center rounded-2xl border map-surface text-sm text-muted-foreground">No route selected</div>;
  }
  const lats = stops.map((s) => s.lat);
  const lons = stops.map((s) => s.lon);
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  const sx = (W - PAD * 2) / Math.max(maxLon - minLon, 0.01);
  const sy = (H - PAD * 2) / Math.max(maxLat - minLat, 0.01);
  const s = Math.min(sx, sy);
  const ox = (W - (maxLon - minLon) * s) / 2;
  const oy = (H - (maxLat - minLat) * s) / 2;
  const P = (lat: number, lon: number) => [ox + (lon - minLon) * s, H - (oy + (lat - minLat) * s)] as const;
  const pts = stops.map((st) => P(st.lat, st.lon));
  const path = pts.map((p) => p.join(",")).join(" ");
  const seg = fromIdx != null && toIdx != null ? pts.slice(fromIdx, toIdx + 1).map((p) => p.join(",")).join(" ") : "";
  const busP = bus ? P(bus.lat, bus.lon) : null;

  return (
    <figure className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative map-surface">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby="map-title">
          <title id="map-title">{`${title}: schematic map of ${stops.length} stops${bus ? `, simulated bus near ${bus.label}` : ""}`}</title>
          <polyline points={path} fill="none" className="stroke-primary/25" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={path} fill="none" className="stroke-primary" strokeWidth={3} strokeDasharray="1 0" strokeLinecap="round" strokeLinejoin="round" />
          {seg && <polyline points={seg} fill="none" className="stroke-live" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
          {pts.map(([x, y], i) => {
            const isFrom = i === fromIdx;
            const isTo = i === toIdx;
            const r = isFrom || isTo ? 13 : 10;
            return (
              <g key={stops[i].id}>
                <circle cx={x} cy={y} r={r} className={isFrom ? "fill-live" : isTo ? "fill-coral" : "fill-card stroke-primary"} strokeWidth={2.5} />
                <text x={x} y={y + 4} textAnchor="middle" className={isFrom || isTo ? "fill-card text-[11px] font-bold" : "fill-primary text-[10px] font-bold"}>
                  {isFrom ? "P" : isTo ? "D" : i + 1}
                </text>
                <text x={x + 16} y={y - 10} className="fill-foreground text-[11px] font-semibold" paintOrder="stroke" stroke="var(--color-map)" strokeWidth={4}>
                  {stops[i].name.split(" (")[0]}
                </text>
              </g>
            );
          })}
          {busP && (
            <g>
              <circle cx={busP[0]} cy={busP[1]} r={12} className="fill-live/40 animate-live-pulse" />
              <rect x={busP[0] - 11} y={busP[1] - 11} width={22} height={22} rx={6} className="fill-primary stroke-card" strokeWidth={2} />
              <text x={busP[0]} y={busP[1] + 4} textAnchor="middle" className="fill-card text-[11px] font-bold">🚌</text>
            </g>
          )}
        </svg>
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <DemoBadge label={bus ? "Simulated position · demo" : "Demo map"} />
        </div>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-xs text-muted-foreground">
        <span className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-live" /> P = your pickup</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-coral" /> D = your drop</span>
          {freshness && <span>· {freshness}</span>}
        </span>
        <a href={googleMapsLink(stops)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
          Open in Google Maps <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}