# Load Test Results

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Milestone 2, Day 8 — "Simple load test run and results noted."

## Test setup

- **Tool:** Apache Bench (`ab`), version 2.3
- **Target:** `GET /health` endpoint
- **Environment:** Local development server (`uvicorn app.main:app --reload`), Windows machine
- **Database:** Local SQLite for this test (not the live Supabase DB, to avoid load-testing shared production data)

## Test command
```bash
ab -n 100 -c 10 http://127.0.0.1:8000/health
```
100 total requests, 10 sent concurrently at a time.

## Results

| Metric | Result |
|---|---|
| Complete requests | 100 |
| Failed requests | 0 |
| Requests per second | 708.82 req/sec |
| Mean time per request | 14.1 ms |
| Fastest request | 2 ms |
| Slowest request | 26 ms |
| 95% of requests completed within | 18 ms |

## Interpretation

The backend handled 100 concurrent-batch requests with zero failures
and sub-30ms response times even under load - well within the SRS's
performance target of "AI prediction should return a result in about
1-2 seconds" (this test isn't even measuring the AI endpoint, which is
naturally heavier, but confirms the underlying FastAPI + Uvicorn stack
has no basic bottleneck).

## Limitations of this test

- Tested `/health` only (a lightweight endpoint) - not the heavier
  `/practice/submit-gesture` endpoint, which does real DB writes and
  AI prediction work. A follow-up test against that endpoint would
  give a more realistic picture of load behavior under the actual
  learning pipeline.
- Tested against local SQLite, not the live Supabase database, which
  will have network latency the local test doesn't capture.
- 100 requests / 10 concurrent is a light load, appropriate for a
  student project demo, not a production capacity test.

## Next steps (if more thorough testing is wanted later)

```bash
# Heavier test: 500 requests, 50 concurrent
ab -n 500 -c 50 http://127.0.0.1:8000/health

# Test an authenticated, DB-writing endpoint (requires a valid token)
ab -n 50 -c 5 -H "Authorization: Bearer <token>" http://127.0.0.1:8000/analytics/me
```