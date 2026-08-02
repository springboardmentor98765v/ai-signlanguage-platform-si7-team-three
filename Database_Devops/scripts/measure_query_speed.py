"""
Measures query speed for the fields we just indexed (Milestone 3 Day 3).
Run this AFTER applying the index migration to see current performance.
"""

from dotenv import load_dotenv
load_dotenv()

import time
from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)

queries = {
    "Leaderboard by accuracy (learning_analytics.average_accuracy)": """
        SELECT learner_id, average_accuracy FROM learning_analytics
        ORDER BY average_accuracy DESC LIMIT 10
    """,
    "Leaderboard by streak (streaks.current_streak)": """
        SELECT learner_id, current_streak FROM streaks
        ORDER BY current_streak DESC LIMIT 10
    """,
    "Lesson search by category (lessons.category)": """
        SELECT id, title FROM lessons WHERE category = 'alphabet'
    """,
}

with engine.connect() as conn:
    for name, query in queries.items():
        start = time.perf_counter()
        conn.execute(text(query))
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f"{name}: {elapsed_ms:.2f} ms")

print("\n--- Query plans (confirms indexes are actually being used) ---")
explain_queries = {
    "Leaderboard by accuracy": "EXPLAIN SELECT learner_id, average_accuracy FROM learning_analytics ORDER BY average_accuracy DESC LIMIT 10",
    "Leaderboard by streak": "EXPLAIN SELECT learner_id, current_streak FROM streaks ORDER BY current_streak DESC LIMIT 10",
    "Lesson search by category": "EXPLAIN SELECT id, title FROM lessons WHERE category = 'alphabet'",
}

with engine.connect() as conn:
    for name, query in explain_queries.items():
        print(f"\n{name}:")
        result = conn.execute(text(query))
        for row in result:
            print(f"  {row[0]}")

print("\n--- Verify indexes actually exist in the database ---")
with engine.connect() as conn:
    result = conn.execute(text(
        "SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('learning_analytics', 'streaks', 'lessons') ORDER BY tablename"
    ))
    for row in result:
        print(f"  {row[0]} on {row[1]}")