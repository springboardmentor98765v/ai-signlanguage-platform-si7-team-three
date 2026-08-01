# Security Scan Report (Milestone 3, Day 7)

**Owner:** Intern 5 (Database & QA)
**SRS deliverable:** Milestone 3, Day 7 — "OWASP ZAP (or similar free tool) installed and run against the local app. Scan results reviewed. Any serious issues found are listed for fixing."

## Tool used

OWASP ZAP (`zaproxy/zap-stable` Docker image), baseline automated scan.

## Command run

```bash
docker run -t -v ${PWD}:/zap/wrk/:rw zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:8000 -r zap_report.html
```

Run against the live Docker Compose backend (`docker compose up --build`
running locally, scan targeting `http://host.docker.internal:8000`).

## Results summary

| Result | Count |
|---|---|
| PASS | 66 |
| FAIL (new) | 0 |
| WARN (new) | 1 |
| INFO | 0 |

**No critical or serious security issues found.**

## The one warning (low severity, not fixed - explained why)

**"Storable and Cacheable Content"** on `/` and `/sitemap.xml` (both
return 404). This is expected and low-risk: the backend is an API-only
service with no homepage or sitemap by design - there is no sensitive
content being cached, since these paths don't exist. Not flagged for
fixing since there's no actual content or vulnerability behind it.

## Notable passes worth highlighting

- Anti-clickjacking protections in place
- No SQL/script injection vulnerabilities detected
- No sensitive information disclosure in URLs, headers, or error messages
- Authentication and session management correctly identified and scanned
- No dangerous JS functions or insecure deserialization patterns found

## Full report

See `zap_report.html` (generated alongside this document) for the
complete, detailed ZAP report with full technical descriptions of
every check performed.