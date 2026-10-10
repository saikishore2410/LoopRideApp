package project;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class LoopRideApp {
    private static final int[] PORTS = {8080, 8081, 8082, 8083, 8084};
    private static HttpServer server;

    public static void main(String[] args) throws Exception {
        int requestedPort = 0;
        if (args.length > 0) {
            try {
                requestedPort = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                System.out.println("Invalid port: " + args[0]);
            }
        }
        int port = startServer(requestedPort);
        System.out.println("LOOP RIDE APP STARTED at http://0.0.0.0:" + port);
    }

    private static int startServer(int requestedPort) throws IOException {
        if (requestedPort > 0) {
            server = createServer(requestedPort);
            server.start();
            return requestedPort;
        }
        for (int port : PORTS) {
            try {
                server = createServer(port);
                server.start();
                return port;
            } catch (IOException e) {
                System.out.println("Port " + port + " is busy. Trying next port...");
            }
        }
        throw new IOException("No available ports found between 8080 and 8084.");
    }

    private static HttpServer createServer(int port) throws IOException {
        HttpServer httpServer = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        httpServer.createContext("/", LoopRideApp::handle);
        httpServer.setExecutor(Executors.newFixedThreadPool(8));
        return httpServer;
    }

    private static void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        if (!"GET".equalsIgnoreCase(method)) {
            byte[] bytes = """
                {
                    "error": "Method not allowed"
                }
                """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            exchange.getResponseHeaders().set("Allow", "GET");
            exchange.getResponseHeaders().set("Cache-Control", "no-store");
            exchange.sendResponseHeaders(405, bytes.length);
            try (OutputStream output = exchange.getResponseBody()) { output.write(bytes); }
            return;
        }

        String response;
        int statusCode = 200;
        if (path.equals("/") || path.equals("/index.html")) {
            response = HTML;
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
        } else if (path.equals("/api/health")) {
            response = """
                {"status": "UP", "application": "Loop Ride App", "message": "Server is running"}
                """;
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        } else if (path.equals("/api/rider")) {
            response = """
                {"role": "rider", "status": "ready"}
                """;
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        } else if (path.equals("/api/driver")) {
            response = """
                {"role": "driver", "online": false, "status": "offline"}
                """;
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        } else {
            response = """
                {"error": "Endpoint not found"}
                """;
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            statusCode = 404;
        }
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) { output.write(bytes); }
    }

    private static final String HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0b6e8a">
<meta name="description" content="Loop Ride — a simple, responsive rider and driver demo.">
<title>Loop Ride App</title>
<style>
:root{color-scheme:light;--brand:#087e8b;--brand-dark:#075e68;--ink:#14232d;--muted:#637581;--line:#dce6eb;--surface:#fff;--canvas:#f3f7f9;--good:#147d58;--danger:#b93832;--shadow:0 12px 35px rgba(20,50,65,.08)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--canvas);color:var(--ink);line-height:1.5}
button,input{font:inherit}
button{touch-action:manipulation}
button:focus-visible,input:focus-visible{outline:3px solid #f5b942;outline-offset:3px}
.header{background:linear-gradient(120deg,#064e63,#087e8b 62%,#12a3a0);color:#fff;padding:22px max(20px,calc((100vw - 1100px)/2));}
.header-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:1100px;margin:auto}
.brand{display:flex;align-items:center;gap:12px}.brand-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:#ffffff20;font-size:25px}
.brand h1{font-size:clamp(1.25rem,3vw,1.7rem);margin:0;letter-spacing:-.04em}.brand p{margin:2px 0 0;color:#d7f1f2;font-size:.9rem}
.pill{border:1px solid #ffffff50;border-radius:999px;padding:7px 12px;font-size:.82rem;white-space:nowrap}
.container{width:min(1100px,calc(100% - 32px));margin:28px auto 48px}
.switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:6px;background:#e3edf0;border-radius:16px;max-width:420px;margin:0 auto 24px}
.switch button{border:0;border-radius:12px;padding:12px 18px;background:transparent;color:#425761;font-weight:700;cursor:pointer;min-height:46px}
.switch button.active{background:var(--surface);color:var(--brand-dark);box-shadow:0 2px 8px #1233}
.layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,.8fr);gap:20px;align-items:start}
.card{background:var(--surface);border:1px solid #e4ecef;border-radius:20px;padding:clamp(18px,3vw,28px);box-shadow:var(--shadow);margin-bottom:18px;min-width:0}
.card h2{margin:0 0 6px;font-size:clamp(1.2rem,2vw,1.55rem);letter-spacing:-.025em}
.subtext{margin:0 0 20px;color:var(--muted)}
.field{display:grid;gap:7px;margin:15px 0}.field label{font-size:.9rem;font-weight:700}.field input{width:100%;min-height:46px;border:1px solid var(--line);border-radius:11px;padding:11px 13px;background:#fff;color:var(--ink)}
.search-wrap{position:relative;margin:12px 0 16px}.search-wrap input{width:100%;min-height:46px;border:1px solid var(--line);border-radius:12px;padding:12px 14px 12px 42px}.search-icon{position:absolute;left:14px;top:11px;color:var(--muted)}
.locations{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.location{width:100%;text-align:left;background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px;cursor:pointer;transition:border-color .18s,transform .18s,box-shadow .18s;color:var(--ink);min-width:0}
.location:hover{border-color:var(--brand);transform:translateY(-2px)}.location.selected{border:2px solid var(--brand);padding:15px;background:#f0fbfb;box-shadow:0 0 0 3px #087e8b14}
.location-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.location h3{font-size:1rem;margin:0}.location p{font-size:.88rem;color:var(--muted);margin:7px 0 0}.distance{font-size:.8rem;background:#eef4f6;padding:4px 7px;border-radius:8px;white-space:nowrap}.fare{font-weight:800;color:var(--brand-dark);margin-top:10px}
.primary,.secondary{border:0;border-radius:12px;padding:13px 18px;min-height:48px;font-weight:750;cursor:pointer;transition:filter .15s,transform .15s}.primary{background:var(--brand);color:#fff}.primary:hover{filter:brightness(.93)}.secondary{background:#eaf2f4;color:var(--brand-dark)}.primary:active,.secondary:active{transform:scale(.99)}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.actions button{flex:1}
.status{padding:13px 14px;border-radius:12px;background:#eaf7f1;color:var(--good);margin:14px 0;font-weight:600}
.notice{margin-top:16px;padding:14px;border-radius:12px;background:#f0f5f7;color:#324a56;overflow-wrap:anywhere}.notice:empty{display:none}
.summary{background:linear-gradient(140deg,#eaf8f8,#f7fbfc);border:1px solid #d5eeee;border-radius:15px;padding:18px;margin-top:18px}.summary h3{margin:0 0 10px}.summary-row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;color:#526873}.summary-row strong{color:var(--ink);text-align:right}
.driver-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px;border:1px solid var(--line);border-radius:14px;margin:18px 0}
.toggle-copy strong{display:block}.toggle-copy span{font-size:.86rem;color:var(--muted)}
input[type=checkbox]{width:48px;height:27px;accent-color:var(--brand);cursor:pointer;flex-shrink:0}
.info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.info-box{padding:16px 10px;background:#f5f8f9;border-radius:13px;text-align:center;color:var(--muted);font-size:.82rem}.info-box strong{display:block;font-size:clamp(1.05rem,2.5vw,1.5rem);color:var(--brand-dark);margin-bottom:3px}
.zone{border:1px solid var(--line);border-radius:13px;padding:14px}.zone h3{font-size:.95rem;margin:0}.zone p{font-size:.88rem;color:var(--muted);margin:5px 0 0}
.eyebrow{text-transform:uppercase;letter-spacing:.1em;font-size:.75rem;color:var(--brand);font-weight:800;margin-bottom:8px}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.hidden{display:none!important}.empty-state{padding:18px;color:var(--muted);text-align:center;border:1px dashed var(--line);border-radius:12px;grid-column:1/-1}
.footer{text-align:center;color:var(--muted);font-size:.85rem;padding:0 12px 28px}.footer strong{color:var(--brand-dark)}
@media(max-width:760px){.layout{grid-template-columns:1fr}.container{margin-top:20px}.header{padding:18px 16px}.pill{font-size:.75rem}.card{border-radius:16px}.layout aside{display:grid;grid-template-columns:1fr;gap:0}}
@media(max-width:480px){.container{width:calc(100% - 20px);margin-top:14px}.brand-mark{width:38px;height:38px}.brand p{font-size:.78rem}.pill{display:none}.switch{margin-bottom:14px}.switch button{padding:10px 8px;font-size:.93rem}.card{padding:17px;margin-bottom:12px}.locations{grid-template-columns:1fr}.location{padding:14px}.location.selected{padding:13px}.actions{flex-direction:column}.actions button{width:100%}.info{gap:7px}.info-box{padding:13px 5px}.summary-row{font-size:.92rem}}

/* Rider-focused enhancements */
.ride-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:16px 0}
.ride-option{border:1px solid var(--line);border-radius:13px;background:#fff;padding:12px 10px;text-align:left;cursor:pointer;color:var(--ink);min-width:0}
.ride-option strong{display:block;font-size:.93rem}.ride-option span{display:block;color:var(--muted);font-size:.79rem;margin-top:4px}
.ride-option.selected{border:2px solid var(--brand);padding:11px 9px;background:#effafa}
.preference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.preference{display:flex;align-items:flex-start;gap:9px;border:1px solid var(--line);border-radius:12px;padding:12px;font-size:.88rem;cursor:pointer}
.preference input{width:18px;height:18px;accent-color:var(--brand);flex-shrink:0;margin-top:2px}
.saved-places{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.saved-place{border:1px solid #cde5e6;border-radius:999px;padding:8px 12px;background:#f1fbfb;color:var(--brand-dark);cursor:pointer;font-weight:700;font-size:.85rem}
.recent-item{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid var(--line);padding:12px 0}
.recent-item:first-child{border-top:0}.recent-item strong{display:block;font-size:.92rem}.recent-item span{display:block;color:var(--muted);font-size:.8rem}
.recent-item button{border:1px solid var(--line);border-radius:9px;background:#fff;padding:7px 9px;color:var(--brand-dark);font-weight:700;cursor:pointer}
.fare-breakdown{border-top:1px solid #d7e9e9;margin-top:10px;padding-top:10px}
.fare-breakdown .summary-row{font-size:.86rem}
.ride-meta{color:var(--muted);font-size:.82rem;margin:8px 0 0}
@media(max-width:480px){.ride-options{gap:6px}.ride-option{padding:10px 7px}.ride-option.selected{padding:9px 6px}.ride-option strong{font-size:.85rem}.ride-option span{font-size:.73rem}.preference-grid{grid-template-columns:1fr}}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
</style>
</head>
<body>
<header class="header">
  <div class="header-inner">
    <div class="brand"><div class="brand-mark" aria-hidden="true">↗</div><div><h1>Loop Ride</h1><p>Rides that never go back empty</p></div></div>
    <div class="pill">● Demo experience · Hyderabad</div>
  </div>
</header>
<main class="container">
  <nav class="switch" aria-label="Choose app view">
    <button id="riderButton" class="active" type="button" aria-pressed="true" onclick="showRider()">🚕 Rider App</button>
    <button id="driverButton" type="button" aria-pressed="false" onclick="showDriver()">🛣️ Driver App</button>
  </nav>

  <section id="rider" aria-labelledby="riderTitle">
    <div class="layout">
      <div class="card">
        <div class="eyebrow">Your next journey</div>
        <h2 id="riderTitle">Where would you like to go?</h2>
        <p class="subtext">Choose a destination to see a sample fare estimate.</p>
        <div class="field"><label for="pickup">Pickup location</label><input id="pickup" maxlength="80" placeholder="e.g. JNTU, Kukatpally" autocomplete="street-address"><div class="saved-places" aria-label="Saved pickup places"><button class="saved-place" type="button" onclick="useSavedPickup('Home · Kukatpally')">⌂ Home</button><button class="saved-place" type="button" onclick="useSavedPickup('Office · HITEC City')">▦ Work</button><button class="saved-place" type="button" onclick="useSavedPickup('JNTU, Kukatpally')">＋ JNTU</button></div></div>
        <div class="field"><label>Choose a ride</label><div class="ride-options" role="group" aria-label="Choose ride type">
          <button class="ride-option selected" type="button" data-ride="Loop Mini" data-multiplier="1" onclick="selectRideType('Loop Mini',1,this)" aria-pressed="true"><strong>🚗 Mini</strong><span>Everyday · 1×</span></button>
          <button class="ride-option" type="button" data-ride="Loop Comfort" data-multiplier="1.35" onclick="selectRideType('Loop Comfort',1.35,this)" aria-pressed="false"><strong>🚙 Comfort</strong><span>Extra comfort</span></button>
          <button class="ride-option" type="button" data-ride="Loop XL" data-multiplier="1.7" onclick="selectRideType('Loop XL',1.7,this)" aria-pressed="false"><strong>🚐 XL</strong><span>More space</span></button>
        </div></div>
        <div class="search-wrap"><span class="search-icon" aria-hidden="true">⌕</span><label class="hidden" for="destinationSearch">Search destinations</label><input id="destinationSearch" type="search" placeholder="Search Hyderabad destinations..." autocomplete="off" oninput="filterDestinations()"></div>
        <div class="locations" id="destinationList">
          <button class="location" type="button" data-destination="Gachibowli" data-distance="8.2" onclick="selectDestination('Gachibowli',8.2)"><div class="location-top"><h3>Gachibowli</h3><span class="distance">8.2 km</span></div><p>IT parks · Financial District</p><div class="fare">From ₹99</div></button>
          <button class="location" type="button" data-destination="Banjara Hills" data-distance="7.8" onclick="selectDestination('Banjara Hills',7.8)"><div class="location-top"><h3>Banjara Hills</h3><span class="distance">7.8 km</span></div><p>Shopping · Cafés</p><div class="fare">From ₹95</div></button>
          <button class="location" type="button" data-destination="Secunderabad" data-distance="15.4" onclick="selectDestination('Secunderabad',15.4)"><div class="location-top"><h3>Secunderabad</h3><span class="distance">15.4 km</span></div><p>Railway station · City centre</p><div class="fare">From ₹169</div></button>
          <button class="location" type="button" data-destination="Charminar" data-distance="12.1" onclick="selectDestination('Charminar',12.1)"><div class="location-top"><h3>Charminar</h3><span class="distance">12.1 km</span></div><p>Old City · Heritage</p><div class="fare">From ₹139</div></button>
          <div id="noDestinations" class="empty-state hidden">No destinations match your search. Try another area.</div>
        </div>
        <div id="tripSummary" class="summary hidden" aria-live="polite">
          <h3>Trip estimate</h3>
          <div class="summary-row"><span>Pickup</span><strong id="summaryPickup">Add pickup location</strong></div>
          <div class="summary-row"><span>Destination</span><strong id="summaryDestination">—</strong></div>
          <div class="summary-row"><span>Estimated distance</span><strong id="summaryDistance">—</strong></div>
          <div class="summary-row"><span>Ride type</span><strong id="summaryRideType">Loop Mini</strong></div>
          <div class="summary-row"><span>Estimated fare</span><strong id="summaryFare">—</strong></div>
          <div class="fare-breakdown">
            <div class="summary-row"><span>Base fare</span><strong id="fareBase">—</strong></div>
            <div class="summary-row"><span>Estimated distance charge</span><strong id="fareDistance">—</strong></div>
            <div class="summary-row"><span>Ride type adjustment</span><strong id="fareRideAdjustment">Included</strong></div>
          </div>
          <p class="ride-meta">Illustrative fare only; actual route, traffic, taxes and driver availability are not connected.</p>
          <div class="field" style="margin-bottom:0"><label for="rideNote">Note for your driver (optional)</label><input id="rideNote" maxlength="120" placeholder="e.g. Please call on arrival"></div>
        </div>
        <details class="card" style="box-shadow:none;padding:16px;margin-top:18px;margin-bottom:0" open>
          <summary style="font-weight:800;cursor:pointer">Ride preferences</summary>
          <p class="subtext" style="font-size:.85rem;margin:7px 0">Choose preferences to include with your demo request.</p>
          <div class="preference-grid">
            <label class="preference"><input type="checkbox" id="quietRide"><span><strong>Quiet ride</strong><br><span style="color:var(--muted)">Limit conversation</span></span></label>
            <label class="preference"><input type="checkbox" id="extraLuggage"><span><strong>Extra luggage</strong><br><span style="color:var(--muted)">Mention larger bags</span></span></label>
            <label class="preference"><input type="checkbox" id="accessibilityNeed"><span><strong>Accessibility needs</strong><br><span style="color:var(--muted)">Flag assistance request</span></span></label>
            <label class="preference"><input type="checkbox" id="shareTrip"><span><strong>Trip safety reminder</strong><br><span style="color:var(--muted)">Show sharing reminder</span></span></label>
          </div>
        </details>
        <div class="actions"><button id="requestRide" class="primary" type="button" disabled onclick="requestRide()">Review demo ride</button><button class="secondary" type="button" onclick="resetTrip()">Clear trip</button></div>
        <div id="message" class="notice" role="status" aria-live="polite"></div>
      </div>
      <aside>
        <div class="card">
          <div class="eyebrow">Designed around you</div><h2>Simple, clear, convenient.</h2>
          <p class="subtext" style="margin-bottom:12px">Search places, review an estimate and see your trip summary before continuing.</p>
          <div class="status">✓ Mobile-friendly layout<br>✓ Clear fare estimate<br>✓ Keyboard-accessible controls</div>
        </div>
        <div class="card"><h2>Recent demo trips</h2><p class="subtext" style="margin-bottom:8px">Your last few demo selections on this browser.</p><div id="recentTrips"><p class="ride-meta">No recent trips yet. Select a destination to begin.</p></div><button class="secondary" style="width:100%;margin-top:6px" type="button" onclick="clearRecentTrips()">Clear history</button></div>
        <div class="card"><h2>Popular destinations</h2><p class="subtext" style="margin-bottom:0">Gachibowli · Banjara Hills · Secunderabad · Charminar</p></div>
      </aside>
    </div>
  </section>

  <section id="driver" class="hidden" aria-labelledby="driverTitle">
    <div class="layout">
      <div class="card">
        <div class="eyebrow">Driver workspace</div><h2 id="driverTitle">Driver dashboard</h2><p class="subtext">Manage your demo availability and review your dashboard at a glance.</p>
        <div class="driver-toggle"><div class="toggle-copy"><strong>Driver availability</strong><span>Toggle to update your local demo status</span></div><input type="checkbox" id="online" aria-label="Go online" onchange="toggleDriver()"></div>
        <div id="driverStatus" class="status" role="status" aria-live="polite">Driver is offline</div>
        <div class="info">
          <div class="info-box"><strong id="earnings">₹0</strong>Earnings</div>
          <div class="info-box"><strong id="rides">0</strong>Rides</div>
          <div class="info-box"><strong id="emptyKm">0</strong>Empty KM</div>
        </div>
        <p class="subtext" style="font-size:.82rem;margin:14px 0 0">Dashboard numbers are sample values and are not connected to a driver account.</p>
      </div>
      <aside class="card"><div class="eyebrow">Demand nearby</div><h2>Busy zones</h2><p class="subtext">Example incentive areas around Hyderabad.</p>
        <div class="locations" style="grid-template-columns:1fr">
          <div class="zone"><h3>Gachibowli</h3><p>Sample bonus ₹40</p></div>
          <div class="zone"><h3>HITEC City</h3><p>Sample bonus ₹25</p></div>
          <div class="zone"><h3>Banjara Hills</h3><p>Sample bonus ₹30</p></div>
        </div>
      </aside>
    </div>
  </section>
</main>
<footer class="footer"><strong>Loop Ride</strong> · A responsive ride-booking concept · Demo only, no real bookings or payments</footer>
<script>
const state = { destination: null, distance: 0, rideType: 'Loop Mini', multiplier: 1 };
const fares = { 'Gachibowli': 99, 'Banjara Hills': 95, 'Secunderabad': 169, 'Charminar': 139 };
const recentTripsKey = 'loopRideRecentTripsV1';
const fareFor = destination => Math.round((fares[destination] || 0) * state.multiplier);
function useSavedPickup(place) {
  document.getElementById('pickup').value = place;
  document.getElementById('pickup').dispatchEvent(new Event('input', { bubbles: true }));
  document.getElementById('pickup').focus();
}
function selectRideType(name, multiplier, button) {
  state.rideType = name;
  state.multiplier = multiplier;
  document.querySelectorAll('.ride-option').forEach(option => {
    const selected = option === button;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  if (state.destination) updateTripSummary();
}
function updateTripSummary() {
  const destination = state.destination;
  if (!destination) return;
  const base = fares[destination] || 0;
  const finalFare = fareFor(destination);
  document.getElementById('summaryPickup').textContent = document.getElementById('pickup').value.trim() || 'Pickup not specified';
  document.getElementById('summaryDestination').textContent = destination;
  document.getElementById('summaryDistance').textContent = state.distance.toFixed(1) + ' km';
  document.getElementById('summaryRideType').textContent = state.rideType;
  document.getElementById('summaryFare').textContent = '₹' + finalFare;
  document.getElementById('fareBase').textContent = '₹' + Math.min(base, 50);
  document.getElementById('fareDistance').textContent = '₹' + Math.max(0, base - 50);
  document.getElementById('fareRideAdjustment').textContent = state.multiplier === 1 ? '₹0' : '+' + Math.round(base * (state.multiplier - 1)) + ' (approx.)';
}
function readRecentTrips() {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentTripsKey) || '[]');
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch { return []; }
}
function writeRecentTrip(trip) {
  try {
    const trips = [trip, ...readRecentTrips()].slice(0, 5);
    localStorage.setItem(recentTripsKey, JSON.stringify(trips));
  } catch { /* Storage may be unavailable in private browsing. */ }
  renderRecentTrips();
}
function renderRecentTrips() {
  const container = document.getElementById('recentTrips');
  if (!container) return;
  const trips = readRecentTrips();
  if (!trips.length) {
    container.innerHTML = '<p class="ride-meta">No recent trips yet. Select a destination to begin.</p>';
    return;
  }
  container.replaceChildren(...trips.map(trip => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = trip.destination || 'Saved trip';
    const detail = document.createElement('span');
    detail.textContent = (trip.rideType || 'Loop Mini') + ' · ₹' + Number(trip.fare || 0);
    copy.append(title, detail);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Reuse';
    button.setAttribute('aria-label', 'Reuse trip to ' + (trip.destination || 'destination'));
    button.addEventListener('click', () => {
      if (trip.pickup) document.getElementById('pickup').value = trip.pickup;
      if (trip.rideType) {
        const config = { 'Loop Mini': 1, 'Loop Comfort': 1.35, 'Loop XL': 1.7 };
        state.rideType = trip.rideType;
        state.multiplier = config[trip.rideType] || 1;
        const rideButton = Array.from(document.querySelectorAll('.ride-option')).find(option => option.dataset.ride === state.rideType);
        if (rideButton) selectRideType(state.rideType, state.multiplier, rideButton);
      }
      selectDestination(trip.destination, Number(trip.distance) || 0);
    });
    item.append(copy, button);
    return item;
  }));
}
function clearRecentTrips() {
  try { localStorage.removeItem(recentTripsKey); } catch {}
  renderRecentTrips();
}

function showRider() {
  document.getElementById('rider').classList.remove('hidden');
  document.getElementById('driver').classList.add('hidden');
  document.getElementById('riderButton').classList.add('active');
  document.getElementById('driverButton').classList.remove('active');
  document.getElementById('riderButton').setAttribute('aria-pressed', 'true');
  document.getElementById('driverButton').setAttribute('aria-pressed', 'false');
}
function showDriver() {
  document.getElementById('driver').classList.remove('hidden');
  document.getElementById('rider').classList.add('hidden');
  document.getElementById('driverButton').classList.add('active');
  document.getElementById('riderButton').classList.remove('active');
  document.getElementById('driverButton').setAttribute('aria-pressed', 'true');
  document.getElementById('riderButton').setAttribute('aria-pressed', 'false');
  loadDriver();
}
function filterDestinations() {
  const query = document.getElementById('destinationSearch').value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('[data-destination]').forEach(card => {
    const matches = card.dataset.destination.toLowerCase().includes(query);
    card.classList.toggle('hidden', !matches);
    if (matches) visible++;
  });
  document.getElementById('noDestinations').classList.toggle('hidden', visible > 0);
}
function selectDestination(destination, distance) {
  state.destination = destination;
  state.distance = distance;
  document.querySelectorAll('[data-destination]').forEach(card => {
    const selected = card.dataset.destination === destination;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
  updateTripSummary();
  document.getElementById('tripSummary').classList.remove('hidden');
  document.getElementById('requestRide').disabled = false;
  document.getElementById('message').textContent = 'Destination selected: ' + destination + '. Review your trip estimate above.';
}
function requestRide() {
  if (!state.destination) {
    document.getElementById('message').textContent = 'Choose a destination first.';
    return;
  }
  const pickup = document.getElementById('pickup').value.trim();
  updateTripSummary();
  const preferences = [];
  if (document.getElementById('quietRide').checked) preferences.push('quiet ride');
  if (document.getElementById('extraLuggage').checked) preferences.push('extra luggage');
  if (document.getElementById('accessibilityNeed').checked) preferences.push('accessibility assistance requested');
  if (document.getElementById('shareTrip').checked) preferences.push('show trip-sharing reminder');
  const note = document.getElementById('rideNote').value.trim();
  writeRecentTrip({ pickup, destination: state.destination, distance: state.distance, fare: fareFor(state.destination), rideType: state.rideType, createdAt: new Date().toISOString() });
  const extras = [...preferences, ...(note ? ['note: ' + note] : [])];
  const safetyReminder = document.getElementById('shareTrip').checked ? ' Safety reminder: share trip details with someone you trust when using a real service.' : '';
  document.getElementById('message').textContent = 'Demo request reviewed for ' + state.destination + ' · ' + state.rideType + ' · ₹' + fareFor(state.destination) + (extras.length ? '. Preferences: ' + extras.join(', ') : '') + '. No real driver has been contacted and no booking was created.' + safetyReminder;
}
function resetTrip() {
  state.destination = null;
  state.distance = 0;
  document.getElementById('pickup').value = '';
  document.getElementById('destinationSearch').value = '';
  document.querySelectorAll('[data-destination]').forEach(card => {
    card.classList.remove('selected', 'hidden');
    card.setAttribute('aria-pressed', 'false');
  });
  document.getElementById('noDestinations').classList.add('hidden');
  document.getElementById('tripSummary').classList.add('hidden');
  document.getElementById('requestRide').disabled = true;
  document.getElementById('message').textContent = 'Trip cleared. Choose a destination to start again.';
  state.rideType = 'Loop Mini';
  state.multiplier = 1;
  document.querySelectorAll('.ride-option').forEach((option, index) => {
    option.classList.toggle('selected', index === 0);
    option.setAttribute('aria-pressed', String(index === 0));
  });
  ['quietRide','extraLuggage','accessibilityNeed','shareTrip'].forEach(id => { document.getElementById(id).checked = false; });
  document.getElementById('rideNote').value = '';

}
function toggleDriver() {
  const online = document.getElementById('online').checked;
  const status = document.getElementById('driverStatus');
  if (online) {
    status.textContent = 'Driver is ONLINE (demo mode)';
    status.style.background = '#e9f7f1';
    status.style.color = '#16815e';
  } else {
    status.textContent = 'Driver is offline';
    status.style.background = '#f8eeee';
    status.style.color = '#b33a32';
  }
}
function loadDriver() {
  fetch('/api/driver')
    .then(response => { if (!response.ok) throw new Error('Driver API unavailable'); return response.json(); })
    .then(data => { console.info('Driver API status:', data.status); })
    .catch(() => { document.getElementById('driverStatus').textContent = 'Offline (unable to refresh server status)'; });
}
document.getElementById('pickup').addEventListener('input', () => {
  if (state.destination) {
    document.getElementById('summaryPickup').textContent = document.getElementById('pickup').value.trim() || 'Pickup not specified';
  }
});
document.querySelectorAll('[data-destination]').forEach(card => card.setAttribute('aria-pressed', 'false'));
renderRecentTrips();
</script>
</body>
</html>
""";
}
