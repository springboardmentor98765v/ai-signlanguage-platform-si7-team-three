# Data Integrity Report

**Owner:** Intern 5 (Database & QA)
**SRS deliverable:** Milestone 3, Day 4 — "Data integrity check script written and run. Any duplicate/missing/orphaned records found and listed. Issues fixed or flagged for the responsible intern."

## Checks performed

Run via `scripts/check_data_integrity.py` against the live Supabase database.

| # | Check | Result |
|---|---|---|
| 1 | Duplicate user emails | ✅ OK |
| 2 | Users with missing full_name | ✅ OK |
| 3 | Lessons with missing expected_sign | ✅ OK |
| 4 | Assessments with missing predicted_sign | ✅ OK |
| 5 | Practice sessions with no matching learner | ✅ OK |
| 6 | Practice sessions with no matching lesson | ✅ OK |
| 7 | Assessments with no matching practice session | ✅ OK |
| 8 | Lessons with no matching course | ✅ OK |
| 9 | Certificates with no matching learner | ✅ OK |
| 10 | Notifications with no matching user | ✅ OK |
| 11 | Badges with no matching learner | ✅ OK |
| 12 | Instructor-Student links with no matching users | ✅ OK |

## Result: Zero issues found

All 12 checks passed with no duplicates, missing required fields, or
orphaned records. This is a meaningful result since the database now
contains real data from multiple team members' merged work, not just
test fixtures from a single developer.

## How to re-run this check

```bash
python -m scripts.check_data_integrity
```

Recommended to re-run periodically, especially after major merges from
teammates, since new orphaned records could appear if someone deletes
a parent record (e.g. a user) without cleaning up dependent rows
(e.g. their practice sessions).