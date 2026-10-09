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
            byte[] bytes = "{\\n    \"error\": \"Method not allowed\"\\n}".getBytes(StandardCharsets.UTF_8);
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
        <div class="field"><label for="pickup">Pickup location</label><input id="pickup" maxlength="80" placeholder="e.g. JNTU, Kukatpally" autocomplete="street-address"></div>
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
          <div class="summary-row"><span>Estimated fare</span><strong id="summaryFare">—</strong></div>
          <p class="subtext" style="font-size:.82rem;margin:10px 0 0">Demo estimate only. Actual prices and driver availability are not connected.</p>
        </div>
        <div class="actions"><button id="requestRide" class="primary" type="button" disabled onclick="requestRide()">Request demo ride</button><button class="secondary" type="button" onclick="resetTrip()">Clear trip</button></div>
        <div id="message" class="notice" role="status" aria-live="polite"></div>
      </div>
      <aside>
        <div class="card">
          <div class="eyebrow">Designed around you</div><h2>Simple, clear, convenient.</h2>
          <p class="subtext" style="margin-bottom:12px">Search places, review an estimate and see your trip summary before continuing.</p>
          <div class="status">✓ Mobile-friendly layout<br>✓ Clear fare estimate<br>✓ Keyboard-accessible controls</div>
        </div>
        <div class="card"><h2>Popular destinations</h2><p class="subtext" style="margin-bottom:0">Gachibowli · HITEC City · Banjara Hills · Charminar</p></div>
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
const state = { destination: null, distance: 0 };
const fares = { 'Gachibowli': 99, 'Banjara Hills': 95, 'Secunderabad': 169, 'Charminar': 139 };

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
  document.getElementById('summaryPickup').textContent = document.getElementById('pickup').value.trim() || 'Pickup not specified';
  document.getElementById('summaryDestination').textContent = destination;
  document.getElementById('summaryDistance').textContent = distance.toFixed(1) + ' km';
  document.getElementById('summaryFare').textContent = '₹' + fares[destination];
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
  document.getElementById('summaryPickup').textContent = pickup || 'Pickup not specified';
  document.getElementById('message').textContent = 'Demo request prepared for ' + state.destination + '. No real driver has been contacted and no booking was created.';
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
</script>
</body>
</html>
""";
}
