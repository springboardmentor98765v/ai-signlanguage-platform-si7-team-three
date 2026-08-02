## Query plan comparison (before vs. after applying indexes)

| Query | Before (Seq Scan cost) | After (Index Scan cost) |
|---|---|---|
| Leaderboard by accuracy | 33.71 | 0.15 |
| Leaderboard by streak | 52.99 | 0.15 |
| Lesson search by category | 11.50 | 0.14 |

All three queries now use `Index Scan` instead of `Seq Scan`, confirmed
via `EXPLAIN`. Query cost (PostgreSQL's internal estimate of work
required) dropped roughly 200x for the leaderboard queries.

**Note on process:** the migration was initially generated but not
applied before the first measurement, which produced a false "indexes
aren't helping" result showing Seq Scans. Re-running `alembic upgrade
head` applied the migration correctly, after which all three queries
correctly show Index Scans. Kept this note as an honest record of the
actual debugging process, not just the final clean result.

## Verification the indexes exist

```sql
SELECT indexname, tablename FROM pg_indexes
WHERE tablename IN ('learning_analytics', 'streaks', 'lessons');
```
Confirmed present: `ix_learning_analytics_average_accuracy`,
`ix_streaks_current_streak`, `ix_lessons_category` (plus pre-existing
primary keys, unique constraints, and `ix_users_email` from Milestone 1).