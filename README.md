# Loop Ride App

A lightweight ride-hailing demo built as a single Java HTTP server with an embedded Rider and Driver web UI.

## Requirements

- JDK 17 or newer

## Project structure

```
LoopRideApp.java
Dockerfile
README.md
.github/workflows/ci.yml
```

The Java source declares the class `project.LoopRideApp`.

## Run locally

Compile and run:

```bash
javac -d . LoopRideApp.java
java project.LoopRideApp
```

The server automatically tries ports **8080 through 8084** if no port is supplied.

To request a specific port:

```bash
java project.LoopRideApp 9000
```

Then open the port printed by the application, for example:

```
http://localhost:8080
```

## Deploy with Docker

The repository includes a Java 17 Dockerfile suitable for a web-service host.

The container:

1. Uses Eclipse Temurin JDK 17.
2. Compiles `LoopRideApp.java`.
3. Starts `project.LoopRideApp`.
4. Uses the host-provided `PORT` environment variable.
5. Binds the HTTP server to `0.0.0.0` for external access.

## Available endpoints

| Method | Path | Expected response |
|---|---|---|
| GET | `/` | Rider/Driver web application |
| GET | `/index.html` | Rider/Driver web application |
| GET | `/api/health` | Server health |
| GET | `/api/rider` | Rider status |
| GET | `/api/driver` | Driver status |
| GET | Any unknown path | HTTP 404 with JSON error |

## Rider app

The Rider UI currently provides four demo destinations:

- Gachibowli
- Banjara Hills
- Secunderabad
- Charminar

Selecting a destination calls `/api/rider` and displays the rider matching status.

## Driver app

The Driver UI provides:

- Online/offline toggle
- Demo earnings, rides and empty-kilometre counters
- Busy-zone cards for Gachibowli, HITEC City and Banjara Hills
- Driver status loading through `/api/driver`

## Current limitations

This repository is a demo application, not a production ride-hailing platform.

- Application state is held in the browser/in memory.
- No authentication or user accounts.
- No database.
- No real ride matching.
- No payments.
- No persistent driver/rider data.
- Destination distances and busy-zone bonuses are demo values.
- The server is implemented with Java's built-in `HttpServer`; there are no Maven or Gradle dependencies.

## Testing

GitHub Actions compiles the application and performs HTTP smoke tests for the main endpoints and the expected 404 response.

For local verification, manually check:

1. The application starts successfully on JDK 17+.
2. `GET /` returns HTTP 200 and HTML.
3. `GET /api/health` returns HTTP 200.
4. `GET /api/rider` returns HTTP 200.
5. `GET /api/driver` returns HTTP 200.
6. An unknown route returns HTTP 404.
7. Rider destination selection displays the API status.
8. Rider/Driver tab switching works.
9. Driver online/offline toggle updates the visible status.

## License

No license has been added yet.
