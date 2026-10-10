import { useSyncExternalStore } from "react";
import type { ServiceAlert } from "./data";

export type Lang = "en" | "hi" | "te";
export interface SavedTrip {
  tripId: string;
  routeId: string;
  routeName: string;
  date: string;
  pickupStopId: string;
  dropStopId: string;
  pickupTime: number;
  dropTime: number;
  passengers: number;
  fare: number;
  reminderMin: number;
  savedAt: string;
  confirmed: boolean;
}
export interface Prefs {
  lang: Lang;
  wheelchair: boolean;
  location: "off" | "approximate" | "precise";
  lowData: boolean;
  reminderMin: number;
}
export interface AppState {
  favorites: string[];
  trips: SavedTrip[];
  prefs: Prefs;
  operatorMode: boolean;
  customAlerts: ServiceAlert[];
  delayOverrides: Record<string, number>;
  disabledStops: Record<string, boolean>;
}

const KEY = "routepulse:v1";
export const DEFAULT_STATE: AppState = {
  favorites: ["AMP", "HTC"],
  trips: [],
  prefs: { lang: "en", wheelchair: false, location: "off", lowData: false, reminderMin: 10 },
  operatorMode: false,
  customAlerts: [],
  delayOverrides: {},
  disabledStops: {},
};

let state: AppState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = { ...DEFAULT_STATE, ...parsed, prefs: { ...DEFAULT_STATE.prefs, ...(parsed.prefs ?? {}) } };
    }
  } catch {
    state = DEFAULT_STATE;
  }
}

export function setState(update: (s: AppState) => AppState) {
  load();
  state = update(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode — keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => DEFAULT_STATE,
  );
}

export const actions = {
  toggleFavorite: (stopId: string) =>
    setState((s) => ({ ...s, favorites: s.favorites.includes(stopId) ? s.favorites.filter((f) => f !== stopId) : [...s.favorites, stopId] })),
  saveTrip: (t: SavedTrip) => setState((s) => ({ ...s, trips: [t, ...s.trips.filter((x) => x.tripId !== t.tripId)] })),
  removeTrip: (tripId: string) => setState((s) => ({ ...s, trips: s.trips.filter((x) => x.tripId !== tripId) })),
  setPrefs: (p: Partial<Prefs>) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
  setOperator: (on: boolean) => setState((s) => ({ ...s, operatorMode: on })),
  addAlert: (a: ServiceAlert) => setState((s) => ({ ...s, customAlerts: [a, ...s.customAlerts] })),
  removeAlert: (id: string) => setState((s) => ({ ...s, customAlerts: s.customAlerts.filter((a) => a.id !== id) })),
  setDelay: (routeId: string, min: number | null) =>
    setState((s) => {
      const d = { ...s.delayOverrides };
      if (min == null) delete d[routeId];
      else d[routeId] = min;
      return { ...s, delayOverrides: d };
    }),
  toggleStop: (key: string) =>
    setState((s) => {
      const d = { ...s.disabledStops };
      if (d[key]) delete d[key];
      else d[key] = true;
      return { ...s, disabledStops: d };
    }),
  resetDemo: () => setState(() => DEFAULT_STATE),
};