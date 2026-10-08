# QA Test Case Scenarios

| ID | Scenario | Expected |
|---|---|---|
| LR-01 | GET / | 200 and HTML content |
| LR-02 | GET /index.html | 200 and HTML content |
| LR-03 | GET /api/health | 200 and status UP |
| LR-04 | GET /api/rider | 200 and rider role |
| LR-05 | GET /api/driver | 200 and driver role |
| LR-06 | GET unknown endpoint | 404 JSON error |
| LR-07 | POST any endpoint | 405 and Allow: GET |
| LR-08 | PUT/DELETE/PATCH endpoint | 405 and no state mutation |
| LR-09 | Server starts on requested free port | Process starts and health responds |
| LR-10 | Requested port is unavailable | Startup falls back to configured ports when no explicit port is required |
| LR-11 | Concurrent GET requests | All valid requests receive complete responses |
| LR-12 | HTML rider/driver switching | Correct section visibility and active button state |
