# RoutePulse AI — bus route discovery and tracking prototype

Responsive Hyderabad bus route discovery with exact designated pickup/drop landmarks, stop order, scheduled departures, ETA estimates, transparent sample fares, saved trip notes, service alerts, preferences and a multilingual transit assistant.

## Data integrity
**All schedules, fares, occupancy estimates, reliability history, notices and vehicle positions are illustrative demo data.** This is not an official TSRTC/TGSRTC feed and no real vehicle GPS, map tile provider or crowd sensors are connected. The map is schematic, and bus markers are simulated from the timetable. Verify all real-world details with the operator.

## Features
- Search demo departures by origin, destination, date and passenger count.
- Accessibility filter based on listed stops and sample low-floor services.
- Stop directory with landmark/address, step-free and shelter flags, and last-mile notes.
- Schematic route map with pickup/drop markers and Google Maps deep links.
- Explainable ETA confidence ranges, fare breakdowns and clearly labelled sample occupancy/reliability.
- Save trips and favorite stops in local browser storage.
- Demo service alerts and an operator test console for simulated delays and stop availability.
- English/Hindi/Telugu assistant with an offline FAQ fallback when no LLM credential is configured.
- Responsive desktop sidebar/mobile nav and accessible form labels.

## Architecture
React 19 + TypeScript + TanStack Start/Router + Tailwind CSS. The transit model in `src/lib/transit/data.ts` is shaped for future GTFS adaptation; `logic.ts` handles search, route segments, fares, ETA windows and simulated positions. `src/lib/transit/store.ts` stores preferences/favorites/saved demo trips in local storage. `src/lib/assistant.ts` validates and sanitizes questions; `src/routes/api/chat.ts` proxies a server-side AI gateway if configured.

## Local development
```sh
bun install
bun run dev
bun run test
bun run lint
bun run build
```
Or with Node/npm: `npm install`, `npm run dev`, `npm run test`, `npm run lint`, `npm run build`, `npm run start`.

## Secrets
`LOVABLE_API_KEY` is an optional **server-side** key for Lovable's AI gateway. Keep credentials out of source control and never use client-exposed `VITE_*` variables for LLM secrets. No real bus, route, or map provider is configured.

## Testing / production roadmap
Tests cover route selection, input validation, fares, stop sequence, demo positions, assistant sanitization/fallback, and SSE parsing. CI runs tests, lint and build on this branch. Before live operation, connect an authorized GTFS timetable and GTFS-Realtime/AVL GPS source, implement authenticated rider/operator access and persistent database/RLS, add licensed map/routing services, ground LLM answers in verified feed data, and test with operators/accessibility users.

## Disclaimer
Not affiliated with TSRTC/TGSRTC unless an operator agreement and feed are explicitly added. Demo times, routes, fares, occupancy, reliability and positions are illustrative. Never use the demo for safety-critical decisions.
