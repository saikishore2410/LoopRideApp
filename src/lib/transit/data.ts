/**
 * DEMO DATA — illustrative Hyderabad transit sample.
 * NOT an official TSRTC / TGSRTC feed. Coordinates are approximate landmarks.
 * Shape mirrors GTFS (stops.txt, routes.txt, stop_times.txt) so an operator
 * GTFS / GTFS-realtime adapter can replace this module (see README).
 */

export type ServiceType = "city-ordinary" | "metro-express" | "intercity-express";

export interface Stop {
  id: string;
  name: string;
  landmark: string;
  address: string;
  lat: number;
  lon: number;
  wheelchair: boolean;
  shelter: boolean;
  lastMile: string[];
}

export interface RouteStop {
  stopId: string;
  /** minutes after trip departure */
  offset: number;
  pickup: boolean;
  drop: boolean;
}

export interface TransitRoute {
  id: string;
  shortName: string;
  name: string;
  type: ServiceType;
  operator: string;
  lowFloor: boolean;
  stops: RouteStop[];
  /** first departure, last departure, headway — minutes after midnight IST */
  firstDep: number;
  lastDep: number;
  headway: number;
}

export interface ServiceAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  routeIds: string[];
  stopIds: string[];
  validFrom: string;
  validTo: string;
  source: "demo" | "operator-demo";
}

export const DATA_SOURCE = {
  label: "Demo data",
  detail: "Illustrative sample for Hyderabad. Not an official TSRTC/TGSRTC feed. No live GPS telemetry is connected.",
  timezone: "Asia/Kolkata",
} as const;

export const STOPS: Stop[] = [
  { id: "SEC", name: "Secunderabad Station", landmark: "Opp. Railway Station Main Gate", address: "Station Rd, Secunderabad 500003", lat: 17.4399, lon: 78.4983, wheelchair: true, shelter: true, lastMile: ["Secunderabad East Metro (Blue line) – 4 min walk", "Prepaid auto stand at Platform 1 exit"] },
  { id: "PAR", name: "Paradise Circle", landmark: "Near Paradise Restaurant", address: "SD Road, Secunderabad 500003", lat: 17.4433, lon: 78.4867, wheelchair: true, shelter: true, lastMile: ["Paradise Metro – 2 min walk"] },
  { id: "BEG", name: "Begumpet", landmark: "Opp. Begumpet Police Station", address: "Prakash Nagar, Begumpet 500016", lat: 17.4447, lon: 78.4664, wheelchair: false, shelter: true, lastMile: ["Begumpet MMTS – 6 min walk", "Shared autos to Greenlands"] },
  { id: "AMP", name: "Ameerpet", landmark: "Under Ameerpet Metro, Pillar A1012", address: "SR Nagar Rd, Ameerpet 500016", lat: 17.4375, lon: 78.4482, wheelchair: true, shelter: true, lastMile: ["Ameerpet Metro interchange (Red/Blue) – lift at Gate B", "Bike taxi pickup zone near Gate C"] },
  { id: "PNJ", name: "Panjagutta", landmark: "Near NIMS Hospital Gate", address: "Raj Bhavan Rd, Panjagutta 500082", lat: 17.4265, lon: 78.451, wheelchair: true, shelter: false, lastMile: ["Panjagutta Metro – 3 min walk"] },
  { id: "JHC", name: "Jubilee Hills Checkpost", landmark: "Opp. Peddamma Temple Rd junction", address: "Rd No. 36, Jubilee Hills 500033", lat: 17.43, lon: 78.409, wheelchair: false, shelter: true, lastMile: ["Jubilee Hills Checkpost Metro – 2 min walk"] },
  { id: "MDP", name: "Madhapur", landmark: "Near Cyber Towers signal", address: "Hitec City Rd, Madhapur 500081", lat: 17.4483, lon: 78.3915, wheelchair: true, shelter: true, lastMile: ["Madhapur Metro – 5 min walk", "Office shuttle bay, Cyber Towers"] },
  { id: "HTC", name: "Hitech City", landmark: "Hitech City Metro, Exit 2", address: "HITEC City, Madhapur 500081", lat: 17.4504, lon: 78.3808, wheelchair: true, shelter: true, lastMile: ["Hitech City Metro skywalk to Mindspace", "Auto stand, Exit 2"] },
  { id: "GCB", name: "Gachibowli", landmark: "Gachibowli Stadium bus bay", address: "Old Mumbai Hwy, Gachibowli 500032", lat: 17.4401, lon: 78.3489, wheelchair: true, shelter: true, lastMile: ["Shared autos to Financial District", "Walk 8 min to DLF Cyber City"] },
  { id: "MGB", name: "MGBS (Mahatma Gandhi Bus Station)", landmark: "Platform 14–18, city bus bay", address: "Gowliguda, Hyderabad 500024", lat: 17.3784, lon: 78.4836, wheelchair: true, shelter: true, lastMile: ["MG Bus Station Metro (Green/Red) – lift via skywalk"] },
  { id: "KOT", name: "Koti", landmark: "Opp. Women's College", address: "Koti Main Rd, Hyderabad 500095", lat: 17.385, lon: 78.4867, wheelchair: false, shelter: true, lastMile: ["Sultan Bazar Metro – 4 min walk"] },
  { id: "NMP", name: "Nampally", landmark: "Near Gandhi Bhavan", address: "Station Rd, Nampally 500001", lat: 17.3924, lon: 78.4675, wheelchair: true, shelter: false, lastMile: ["Hyderabad Deccan (Nampally) railway – 3 min walk"] },
  { id: "LKP", name: "Lakdikapul", landmark: "Opp. Telephone Bhavan", address: "Lakdikapul, Hyderabad 500004", lat: 17.4033, lon: 78.4636, wheelchair: true, shelter: true, lastMile: ["Lakdikapul Metro – 1 min walk"] },
  { id: "MHP", name: "Mehdipatnam", landmark: "Mehdipatnam bus depot bay 3", address: "Rethibowli Rd, Mehdipatnam 500028", lat: 17.395, lon: 78.44, wheelchair: false, shelter: true, lastMile: ["Shared autos to Tolichowki"] },
  { id: "KKP", name: "Kukatpally (KPHB)", landmark: "Near JNTU Metro", address: "KPHB Colony, Kukatpally 500072", lat: 17.4948, lon: 78.3996, wheelchair: true, shelter: true, lastMile: ["JNTU College Metro – 3 min walk"] },
  { id: "DSN", name: "Dilsukhnagar", landmark: "Near Konark Theatre", address: "Main Rd, Dilsukhnagar 500060", lat: 17.3688, lon: 78.5247, wheelchair: true, shelter: true, lastMile: ["Dilsukhnagar Metro – 2 min walk"] },
  { id: "LBN", name: "LB Nagar", landmark: "LB Nagar ring road bus bay", address: "Inner Ring Rd, LB Nagar 500074", lat: 17.3457, lon: 78.5522, wheelchair: true, shelter: true, lastMile: ["LB Nagar Metro (Red line terminus)"] },
  { id: "UPL", name: "Uppal X Roads", landmark: "Near Uppal Metro Pillar 1092", address: "Warangal Hwy, Uppal 500039", lat: 17.4018, lon: 78.5602, wheelchair: true, shelter: true, lastMile: ["Uppal Metro – 2 min walk", "Shared autos to Ramanthapur"] },
  { id: "HBG", name: "Habsiguda", landmark: "Opp. NGRI Main Gate", address: "Street No. 8, Habsiguda 500007", lat: 17.4186, lon: 78.544, wheelchair: false, shelter: false, lastMile: ["NGRI Metro – 1 min walk"] },
  { id: "TRK", name: "Tarnaka", landmark: "Tarnaka junction, near Railway Degree College", address: "Tarnaka, Secunderabad 500017", lat: 17.4277, lon: 78.5331, wheelchair: true, shelter: true, lastMile: ["Tarnaka Metro – 3 min walk"] },
  { id: "WGL", name: "Warangal Bus Station", landmark: "Hanamkonda Rd, Platform 3", address: "Station Rd, Warangal 506002", lat: 17.9689, lon: 79.5941, wheelchair: true, shelter: true, lastMile: ["Warangal railway station – 10 min auto", "Auto stand at main exit"] },
  { id: "BGR", name: "Bhongir (Bhuvanagiri)", landmark: "Bhongir bus stand", address: "NH163, Bhongir 508116", lat: 17.5103, lon: 78.8889, wheelchair: false, shelter: true, lastMile: ["Bhongir Fort – 10 min auto"] },
];

const rs = (stopId: string, offset: number, pickup = true, drop = true): RouteStop => ({ stopId, offset, pickup, drop });

export const ROUTES: TransitRoute[] = [
  {
    id: "R-10H", shortName: "10H", name: "Secunderabad ⇄ Gachibowli (via Ameerpet, Hitech City)", type: "metro-express",
    operator: "Demo City Transit", lowFloor: true, firstDep: 6 * 60, lastDep: 22 * 60, headway: 20,
    stops: [rs("SEC", 0, true, false), rs("PAR", 6), rs("BEG", 14), rs("AMP", 22), rs("JHC", 34), rs("MDP", 44), rs("HTC", 50), rs("GCB", 62, false, true)],
  },
  {
    id: "R-218", shortName: "218", name: "MGBS ⇄ Kukatpally (via Nampally, Ameerpet)", type: "city-ordinary",
    operator: "Demo City Transit", lowFloor: false, firstDep: 5 * 60 + 30, lastDep: 22 * 60 + 30, headway: 25,
    stops: [rs("MGB", 0, true, false), rs("KOT", 7), rs("NMP", 16), rs("LKP", 22), rs("PNJ", 30), rs("AMP", 37), rs("KKP", 55, false, true)],
  },
  {
    id: "R-156", shortName: "156V", name: "LB Nagar ⇄ Gachibowli (via Koti, Mehdipatnam)", type: "city-ordinary",
    operator: "Demo City Transit", lowFloor: true, firstDep: 6 * 60, lastDep: 21 * 60 + 30, headway: 30,
    stops: [rs("LBN", 0, true, false), rs("DSN", 9), rs("KOT", 24), rs("LKP", 34), rs("MHP", 44), rs("GCB", 66, false, true)],
  },
  {
    id: "R-113", shortName: "113K", name: "Uppal ⇄ Ameerpet (via Tarnaka, Secunderabad)", type: "city-ordinary",
    operator: "Demo City Transit", lowFloor: false, firstDep: 5 * 60 + 45, lastDep: 22 * 60, headway: 15,
    stops: [rs("UPL", 0, true, false), rs("HBG", 7), rs("TRK", 13), rs("SEC", 25), rs("PAR", 31), rs("BEG", 39), rs("AMP", 47, false, true)],
  },
  {
    id: "X-WGL", shortName: "WGL Exp", name: "MGBS ⇄ Warangal Express (via Uppal, Bhongir)", type: "intercity-express",
    operator: "Demo Intercity Lines", lowFloor: false, firstDep: 5 * 60, lastDep: 23 * 60, headway: 60,
    stops: [rs("MGB", 0, true, false), rs("UPL", 30, true, false), rs("BGR", 85), rs("WGL", 200, false, true)],
  },
];

export const DEMO_ALERTS: ServiceAlert[] = [
  { id: "A-1", severity: "warning", title: "Slow traffic near Panjagutta flyover", body: "Demo alert: expect 8–12 min delays on route 218 between Lakdikapul and Ameerpet during evening peak (17:00–20:00 IST).", routeIds: ["R-218"], stopIds: ["PNJ"], validFrom: "17:00", validTo: "20:00", source: "demo" },
  { id: "A-2", severity: "info", title: "Ameerpet stop relocated 50 m", body: "Demo alert: the 10H pickup point is temporarily under Metro Pillar A1012 (Gate B side) for road works.", routeIds: ["R-10H"], stopIds: ["AMP"], validFrom: "06:00", validTo: "23:00", source: "demo" },
  { id: "A-3", severity: "critical", title: "Habsiguda shelter closed", body: "Demo alert: boarding at Habsiguda moved to opposite NGRI Gate 2. Not step-free.", routeIds: ["R-113"], stopIds: ["HBG"], validFrom: "00:00", validTo: "23:59", source: "demo" },
];

export const stopById = (id: string) => STOPS.find((s) => s.id === id);
export const routeById = (id: string) => ROUTES.find((r) => r.id === id);