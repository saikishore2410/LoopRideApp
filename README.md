# Loop: rides that never go back empty

Ride-hailing app in the style of Rapido and Uber (rider app, driver app and backend) built around one problem:
**after a drop-off, the driver drives back with no passenger.** Loop lines up the next ride before the current one ends, points idle drivers at demand, and lets riders book the way back.

Everything runs from a single Java file with no dependencies.

## Quick start

Requires JDK 17 or newer.

```bash
java LoopApp.java
```

Open http://localhost:8080. Use another port with `java LoopApp.java 9000`.

Open the **Rider app** and **Driver app** in two tabs (or on two phones). When the driver is online, a rider's booking reaches the driver live.

## The problem and how Loop handles it

| Idea | What it does |
|---|---|
| **Chained rides** | A booking made while a driver is more than halfway through a trip is queued behind it, so the next pickup is ready at the drop point. |
| **Busy-zone bonuses** | Bookings raise the bonus on nearby zones (fading over about a minute). Idle drivers see a demand map and can head to the best zone. |
| **Going-home mode** | A driver heading home only gets offers along that route. |
| **Return-trip booking** | Riders save 15% by booking the way back at the same time, so a return passenger is already lined up. |
| **Parcels on the return leg** | Parcels ride with a driver who is already heading that way, so they cost less. |

## Using the apps

**Rider app:** choose a destination, pick Bike, Auto or Cab (or send a parcel), optionally add the return trip, then book and follow the driver on the map. Includes OTP, trip share, SOS, fare summary and rating.

**Driver app:** go online, see busy zones with bonuses, switch on going-home mode, accept or skip requests, and watch the "next ride lined up" card appear during a trip. Earnings, rides and empty km are tracked on the server.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/quote?dest=i` | Fares for ride, parcel and return trip |
| POST | `/api/rides` | Book a ride (matching runs on the server) |
| GET | `/api/rides/{id}` | Ride status and assigned driver |
| POST | `/api/rides/{id}/complete` | Mark the ride done |
| GET | `/api/driver` | Driver state, zones, offer, next ride, stats |
| POST | `/api/driver/online` | Go online or offline |
| POST | `/api/driver/home` | Toggle going-home mode |
| POST | `/api/driver/arrived` | Arrived at a busy zone |
| POST | `/api/driver/accept` | Accept the current offer |
| POST | `/api/driver/skip` | Skip the current offer |
| POST | `/api/driver/complete` | Finish the trip (starts the chained ride if one is queued) |

Bodies are JSON, for example `{"dest":0,"veh":1,"parcel":false,"ret":true,"when":"This evening"}`.

## Project structure

```
LoopApp.java          single-file app: REST backend + embedded rider/driver web UI
engine-simulator/     dispatch engine and headless simulator (run ./run.sh)
```

## Simulation results

`engine-simulator/` compares three strategies on the same demand (60 drivers, 20x20 km city, 10 hours, 5 runs):

| Strategy | Completed rides | Lost requests | Time carrying riders | Empty km / ride |
|---|---|---|---|---|
| Nearest driver | 875 | 382 | 47.6% | 4.04 |
| Chained rides | 889 | 362 | 48.5% | 4.04 |
| Chained + reposition | 1158 | 87 | 62.5% | 5.24 |

Repositioning serves far more riders but adds some empty km per ride, so pair it with incentives. The demand is synthetic; validate with real trip data before relying on these numbers.

## Limitations

- State is kept in memory and resets on restart.
- No login or payments; one live driver, the others are demo data.
- When no rider books, the server creates demo requests so the Driver app is not empty.
- The map is a schematic grid, not real roads.

## Roadmap

- Spring Boot with Postgres/PostGIS, Redis geo queries and WebSockets
- Direction-aware matching and real road ETAs
- Real payments (UPI/Razorpay), driver verification, surge pricing
- Pooled rides and scheduled return trips

## License

Add a license before sharing publicly (MIT is a common choice).
