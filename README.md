# Loop Ride App

A responsive ride-hailing demo built as a single Java HTTP server with embedded Rider and Driver web UI.

## Requirements

- JDK 17 or newer
- Docker (optional, for container deployment)

## Project structure

```text
LoopRideApp.java
Dockerfile
README.md
QA_TEST_CASES.md
QA_EXECUTION.md
.github/workflows/ci.yml
```

The Java source declares `project.LoopRideApp`. There are no Maven or Gradle dependencies; the server uses Java's built-in `HttpServer`.

## Run locally

Compile and run from the repository root:

```bash
javac -d . LoopRideApp.java
java project.LoopRideApp
```

By default, the server tries ports 8080 through 8084. To request a specific port:

```bash
java project.LoopRideApp 9000
```

Open the address printed by the application, for example `http://localhost:8080`.

## Deploy with Docker

The Dockerfile uses Eclipse Temurin JDK 17, compiles the Java source and starts the server. It respects the host-provided `PORT` environment variable and binds to `0.0.0.0`.

```bash
docker build -t loop-ride-app .
docker run --rm -p 10000:10000 -e PORT=10000 loop-ride-app
```

If you change the host port mapping, set the container `PORT` consistently with the right-hand/container port.

## API endpoints

All supported application routes currently accept **GET** requests.

| Method | Path | Success response |
|---|---|---|
| GET | `/` | Rider/Driver HTML application |
| GET | `/index.html` | Rider/Driver HTML application |
| GET | `/api/health` | JSON health status |
| GET | `/api/rider` | JSON rider status |
| GET | `/api/driver` | JSON driver status |
| GET | Any unknown path | HTTP 404 JSON error |
| Other methods | Any path | HTTP 405 JSON error and `Allow: GET` |

Example:

```bash
curl -i http://localhost:8080/api/health
curl -i http://localhost:8080/api/unknown
curl -i -X POST http://localhost:8080/api/health
```

## Rider UI

The demo displays destination cards for Gachibowli, Banjara Hills, Secunderabad and Charminar. Selecting a destination calls `/api/rider` and displays the response status.

## Driver UI

The demo dashboard includes an online/offline toggle, example earnings/ride/empty-kilometre counters and busy-zone cards for Gachibowli, HITEC City and Banjara Hills. Driver status is loaded from `/api/driver`.

## UI features

- Responsive layouts for desktop, tablet and mobile screens, including touch-friendly controls and reduced-motion support.
- Rider destination search with an empty state when no destination matches.
- Pickup location input, selectable destination cards, sample distance/fare estimates, trip summary and clear-trip action.
- Demo ride-request confirmation that explicitly states no real booking is created.
- Driver availability toggle, sample dashboard metrics and busy-zone cards.
- Keyboard focus states, accessible labels, pressed states and live status announcements.

Fare and distance values are illustrative. The app does not have a live booking service, geocoding, route calculation or payment integration.

## Current limitations

This is a demonstration application, not a production ride-hailing service.

- UI selections and status toggles are in-browser demo interactions; they are not persisted by the server.
- No authentication, user accounts, database, real ride matching, payments or persistent rider/driver data.
- Displayed distances, counters and busy-zone bonuses are sample values.
- The API currently offers health and role status endpoints only; booking, quote, driver action and trip-management APIs are not implemented.

## Testing

GitHub Actions compiles the source on JDK 17, checks HTTP status codes and response bodies, runs Playwright browser tests for rider/driver workflows and mobile layout, and builds/runs a Docker container for endpoint smoke checks.

See [QA test cases](QA_TEST_CASES.md) and [QA execution documentation](QA_EXECUTION.md) for the test inventory and validation notes.

## License

No license has been added yet.
