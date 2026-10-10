import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { actions, useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });
function SettingsPage() {
  const { prefs, operatorMode } = useAppState();
  return <AppShell><PageHeader title="Preferences & privacy" subtitle="Control local demo settings. The app does not request or send your location from these controls." /><div className="mb-4"><DemoBadge label="Stored on this device" /></div>
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <label className="block text-sm font-semibold">Assistant language<select className="mt-1 block w-full rounded-lg border bg-background px-3 py-2.5" value={prefs.lang} onChange={(e) => actions.setPrefs({ lang: e.target.value as "en" | "hi" | "te" })}><option value="en">English</option><option value="te">తెలుగు (Telugu)</option><option value="hi">हिन्दी (Hindi)</option></select></label>
      <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" checked={prefs.wheelchair} onChange={(e) => actions.setPrefs({ wheelchair: e.target.checked })} /><span><strong className="block text-sm">Prefer accessible routes</strong><span className="text-xs text-muted-foreground">Filter sample searches to listed step-free stops and low-floor routes.</span></span></label>
      <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" checked={prefs.lowData} onChange={(e) => actions.setPrefs({ lowData: e.target.checked })} /><span><strong className="block text-sm">Low-data mode</strong><span className="text-xs text-muted-foreground">Preference flag for future low-bandwidth support.</span></span></label>
      <label className="block text-sm font-semibold">Pickup reminder<select className="mt-1 block w-full rounded-lg border bg-background px-3 py-2.5" value={prefs.reminderMin} onChange={(e) => actions.setPrefs({ reminderMin: Number(e.target.value) })}><option value={5}>5 minutes before</option><option value={10}>10 minutes before</option><option value={15}>15 minutes before</option><option value={20}>20 minutes before</option></select></label>
      <label className="block text-sm font-semibold">Location permission<select className="mt-1 block w-full rounded-lg border bg-background px-3 py-2.5" value={prefs.location} onChange={(e) => actions.setPrefs({ location: e.target.value as "off" | "approximate" | "precise" })}><option value="off">Off (recommended)</option><option value="approximate">Approximate location (future feature)</option><option value="precise">Precise location (future feature)</option></select><span className="mt-1 block text-xs text-muted-foreground">This setting does not request browser GPS permission or transmit location.</span></label>
      <div className="rounded-lg border border-warning/40 bg-warning-soft p-3"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={operatorMode} onChange={(e) => actions.setOperator(e.target.checked)} /> Enable demo operator tools</label><p className="mt-1 text-xs">This is not secure role-based access. Production operator features require authentication and authorization.</p></div>
      <button className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => { if (window.confirm("Reset saved demo preferences, favorites and trips on this device?")) actions.resetDemo(); }}>Reset demo data</button>
    </div>
  </AppShell>;
}