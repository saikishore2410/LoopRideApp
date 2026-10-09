# QA Test Case Scenarios

| ID | Test | Expected result | Automation |
|---|---|---|---|
| LR-01 | GET / | HTTP 200, HTML content and Rider UI | GitHub Actions |
| LR-02 | GET /index.html | HTTP 200 and Driver UI markup | GitHub Actions |
| LR-03 | GET /api/health | HTTP 200, JSON content type and status UP | GitHub Actions |
| LR-04 | GET /api/rider | HTTP 200, rider role and ready status | GitHub Actions |
| LR-05 | GET /api/driver | HTTP 200, driver role, offline state | GitHub Actions |
| LR-06 | GET /api/does-not-exist | HTTP 404 and JSON error | GitHub Actions |
| LR-07 | GET /unknown-page | HTTP 404 and JSON error | GitHub Actions |
| LR-08 | POST /api/health | HTTP 405, JSON error and Allow: GET | GitHub Actions |
| LR-09 | PUT /api/health | HTTP 405, JSON error and Allow: GET | GitHub Actions |
| LR-10 | PATCH /api/health | HTTP 405, JSON error and Allow: GET | GitHub Actions |
| LR-11 | DELETE /api/health | HTTP 405, JSON error and Allow: GET | GitHub Actions |
| LR-12 | HEAD /api/health | HTTP 405, not a false HTTP 200 | GitHub Actions |
| LR-13 | Compile with JDK 17 | Source compiles without errors | GitHub Actions |
| LR-14 | UI destinations and role switching | Markup includes rider/driver UI | Partially covered by smoke checks; browser automation not configured |
| LR-15 | Driver toggle behavior | Toggle updates visible state locally | Manual browser test |
| LR-16 | Concurrent request handling | Each request receives a complete response | Not yet automated |
