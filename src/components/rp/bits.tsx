import { useEffect, useState } from "react";
import { Database, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Occupancy } from "@/lib/transit/logic";
import { istDate, istMinutes } from "@/lib/transit/logic";

/** Current IST clock; null until hydrated so SSR and client markup match. */
export function useNowIST(intervalMs = 30000) {
  const [now, setNow] = useState<{ date: string; min: number; at: Date } | null>(null);
  useEffect(() => {
    const tick = () => { const d = new Date(); setNow({ date: istDate(d), min: istMinutes(d), at: d }); };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning", className)}>
      <Database className="size-3" aria-hidden /> {label}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2.5", className)} aria-hidden>
      <span className="absolute inset-0 animate-live-pulse rounded-full bg-live" />
      <span className="relative size-2.5 rounded-full bg-live" />
    </span>
  );
}

const OCC: Record<Occupancy, { label: string; cls: string; bars: number }> = {
  low: { label: "Seats available", cls: "text-live", bars: 1 },
  medium: { label: "Standing room", cls: "text-warning", bars: 2 },
  high: { label: "Crowded", cls: "text-coral", bars: 3 },
};
export function OccupancyPill({ value }: { value: Occupancy }) {
  const o = OCC[value];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", o.cls)} title="Demo occupancy estimate — no passenger-count sensors connected">
      <Users className="size-3.5" aria-hidden />
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((b) => <span key={b} className={cn("h-3 w-1 rounded-full", b <= o.bars ? "bg-current" : "bg-border")} />)}
      </span>
      {o.label} <span className="sr-only">(demo estimate)</span>
    </span>
  );
}

export function ConfidencePill({ value }: { value: "high" | "medium" | "low" }) {
  const cls = value === "high" ? "bg-live-soft text-live" : value === "medium" ? "bg-warning-soft text-warning" : "bg-coral-soft text-coral";
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>{value} confidence</span>;
}