# Uptime Monitoring

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Milestone 2, Day 8 — "Free uptime monitor set up and pinging the live backend."

## What's monitored

UptimeRobot (free tier) checks our live backend every 5 minutes:

https://sign-language-platform-backend.onrender.com/health

## Public status page

Anyone on the team (or a reviewer) can check current status here:

https://stats.uptimerobot.com/X46GuurGsd

## A real issue found and fixed along the way

The monitor initially showed "Down" with a 405 error - UptimeRobot's
free tier sends HEAD requests by default, but the `/health` endpoint
only accepted GET. Fixed by updating the route to accept both:

```python
@app.api_route("/health", methods=["GET", "HEAD"], tags=["System"])
def health_check():
    return {"status": "ok"}
```

After redeploying, the monitor correctly shows "Up".

## Result

Status: Up and monitored, confirmed working as of today.