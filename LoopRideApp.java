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

        System.out.println();
        System.out.println("======================================");
        System.out.println("        LOOP RIDE APP STARTED");
        System.out.println("======================================");
        System.out.println("Server running at:");
        System.out.println("http://0.0.0.0:" + port);
        System.out.println("======================================");
        System.out.println();
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
        HttpServer httpServer = HttpServer.create(
            new InetSocketAddress("0.0.0.0", port),
            0
        );

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
            try (OutputStream output = exchange.getResponseBody()) {
                output.write(bytes);
            }
            return;
        }

        String response;
        int statusCode = 200;

        if (path.equals("/") || path.equals("/index.html")) {
            response = HTML;
            exchange.getResponseHeaders().set(
                "Content-Type", "text/html; charset=UTF-8"
            );
        } else if (path.equals("/api/health")) {
            response = """
                {
                    "status": "UP",
                    "application": "Loop Ride App",
                    "message": "Server is running"
                }
                """;
            exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
            );
        } else if (path.equals("/api/rider")) {
            response = """
                {
                    "role": "rider",
                    "status": "ready"
                }
                """;
            exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
            );
        } else if (path.equals("/api/driver")) {
            response = """
                {
                    "role": "driver",
                    "online": false,
                    "status": "offline"
                }
                """;
            exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
            );
        } else {
            response = """
                {
                    "error": "Endpoint not found"
                }
                """;
            exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
            );
            statusCode = 404;
        }

        exchange.getResponseHeaders().set("Cache-Control", "no-store");

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private static final String HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Loop Ride App</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #eef2f5; color: #17212b; }
.header { background: #0b6e8a; color: white; padding: 18px; text-align: center; }
.header h1 { margin: 0; }
.container { width: min(1000px, 95%); margin: 30px auto; }
.switch { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
.switch button { padding: 12px 25px; border: none; border-radius: 25px; background: white; color: #17212b; cursor: pointer; font-size: 16px; }
.switch button.active { background: #0b6e8a; color: white; }
.card { background: white; border-radius: 18px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,.08); margin-bottom: 20px; }
.card h2 { margin-top: 0; }
.status { padding: 12px; border-radius: 10px; background: #e9f7f1; color: #16815e; margin-bottom: 15px; }
.locations { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
.location { border: 1px solid #dce3e8; border-radius: 12px; padding: 18px; cursor: pointer; transition: .2s; }
.location:hover { border-color: #0b6e8a; transform: translateY(-2px); }
.location h3 { margin: 0 0 5px; }
.driver-toggle { display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 1px solid #dce3e8; border-radius: 12px; margin-bottom: 20px; }
input[type="checkbox"] { width: 45px; height: 25px; }
.info { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
.info-box { padding: 20px; background: #f7f9fa; border-radius: 12px; text-align: center; }
.info-box strong { display: block; font-size: 25px; color: #0b6e8a; }
.hidden { display: none; }
#message { margin-top: 15px; padding: 12px; border-radius: 10px; background: #f1f5f7; }
</style>
</head>
<body>
<div class="header"><h1>Loop</h1><p>Rides that never go back empty</p></div>
<div class="container">
<div class="switch">
<button id="riderButton" class="active" onclick="showRider()">Rider App</button>
<button id="driverButton" onclick="showDriver()">Driver App</button>
</div>

<section id="rider">
<div class="card">
<h2>Where do you want to go?</h2>
<p>Select your destination.</p>
<div class="locations">
<div class="location" onclick="selectDestination('Gachibowli')"><h3>Gachibowli</h3><p>8.2 km</p></div>
<div class="location" onclick="selectDestination('Banjara Hills')"><h3>Banjara Hills</h3><p>7.8 km</p></div>
<div class="location" onclick="selectDestination('Secunderabad')"><h3>Secunderabad</h3><p>15.4 km</p></div>
<div class="location" onclick="selectDestination('Charminar')"><h3>Charminar</h3><p>12.1 km</p></div>
</div>
<div id="message"></div>
</div>
</section>

<section id="driver" class="hidden">
<div class="card">
<h2>Driver Dashboard</h2>
<div class="driver-toggle"><span>Go Online</span><input type="checkbox" id="online" onchange="toggleDriver()"></div>
<div id="driverStatus" class="status">Driver is offline</div>
<div class="info">
<div class="info-box"><strong id="earnings">₹0</strong>Earnings</div>
<div class="info-box"><strong id="rides">0</strong>Rides</div>
<div class="info-box"><strong id="emptyKm">0</strong>Empty KM</div>
</div>
</div>
<div class="card">
<h2>Busy Zones</h2>
<div class="locations">
<div class="location"><h3>Gachibowli</h3><p>Bonus ₹40</p></div>
<div class="location"><h3>HITEC City</h3><p>Bonus ₹25</p></div>
<div class="location"><h3>Banjara Hills</h3><p>Bonus ₹30</p></div>
</div>
</div>
</section>
</div>

<script>
function showRider() {
document.getElementById("rider").classList.remove("hidden");
document.getElementById("driver").classList.add("hidden");
document.getElementById("riderButton").classList.add("active");
document.getElementById("driverButton").classList.remove("active");
}
function showDriver() {
document.getElementById("driver").classList.remove("hidden");
document.getElementById("rider").classList.add("hidden");
document.getElementById("driverButton").classList.add("active");
document.getElementById("riderButton").classList.remove("active");
loadDriver();
}
function selectDestination(destination) {
const message = document.getElementById("message");
message.innerHTML = "<strong>Destination:</strong> " + destination + "<br><br>Finding the best driver...";
fetch("/api/rider").then(response => response.json()).then(data => {
message.innerHTML = "<strong>Destination:</strong> " + destination + "<br>Driver matching started.<br><br>Status: " + data.status;
}).catch(error => { message.innerHTML = "Unable to connect to server."; });
}
function toggleDriver() {
const online = document.getElementById("online").checked;
const status = document.getElementById("driverStatus");
if (online) {
status.innerHTML = "Driver is <strong>ONLINE</strong>";
status.style.background = "#e9f7f1";
status.style.color = "#16815e";
} else {
status.innerHTML = "Driver is offline";
status.style.background = "#f8eeee";
status.style.color = "#b33a32";
}
}
function loadDriver() {
fetch("/api/driver").then(response => response.json()).then(data => console.log("Driver API:", data)).catch(error => console.error(error));
}
</script>
</body>
</html>
""";
}
