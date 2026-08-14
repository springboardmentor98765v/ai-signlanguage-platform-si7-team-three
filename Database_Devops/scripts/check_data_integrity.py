"""
Data integrity check script (Milestone 3, Day 4).
Looks for duplicate entries, missing required fields, and orphaned
records (rows referencing a parent that no longer exists) across the
live database.

Run this periodically, or whenever something feels "off" with the data.
"""

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)

issues_found = 0


def check(description, query):
    global issues_found
    with engine.connect() as conn:
        result = conn.execute(text(query)).fetchall()
        if result:
            issues_found += len(result)
            print(f"⚠️  {description}: {len(result)} issue(s) found")
            for row in result[:5]:  # show up to 5 examples
                print(f"     {dict(row._mapping)}")
        else:
            print(f"✅ {description}: OK")


print("=== Duplicate checks ===")
check(
    "Duplicate user emails",
    "SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1",
)

print("\n=== Missing required field checks ===")
check(
    "Users with missing full_name",
    "SELECT id FROM users WHERE full_name IS NULL OR full_name = ''",
)
check(
    "Lessons with missing expected_sign",
    "SELECT id FROM lessons WHERE expected_sign IS NULL OR expected_sign = ''",
)
check(
    "Assessments with missing predicted_sign",
    "SELECT id FROM assessments WHERE predicted_sign IS NULL OR predicted_sign = ''",
)

print("\n=== Orphaned record checks ===")
check(
    "Practice sessions with no matching learner",
    """SELECT ps.id FROM practice_sessions ps
       LEFT JOIN users u ON ps.learner_id = u.id
       WHERE u.id IS NULL""",
)
check(
    "Practice sessions with no matching lesson",
    """SELECT ps.id FROM practice_sessions ps
       LEFT JOIN lessons l ON ps.lesson_id = l.id
       WHERE l.id IS NULL""",
)
check(
    "Assessments with no matching practice session",
    """SELECT a.id FROM assessments a
       LEFT JOIN practice_sessions ps ON a.session_id = ps.id
       WHERE ps.id IS NULL""",
)
check(
    "Lessons with no matching course",
    """SELECT l.id FROM lessons l
       LEFT JOIN courses c ON l.course_id = c.id
       WHERE c.id IS NULL""",
)
check(
    "Certificates with no matching learner",
    """SELECT cert.id FROM certificates cert
       LEFT JOIN users u ON cert.learner_id = u.id
       WHERE u.id IS NULL""",
)
check(
    "Notifications with no matching user",
    """SELECT n.id FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE u.id IS NULL""",
)
check(
    "Badges with no matching learner",
    """SELECT b.id FROM badges b
       LEFT JOIN users u ON b.learner_id = u.id
       WHERE u.id IS NULL""",
)
check(
    "Instructor-Student links with no matching users",
    """SELECT ins.id FROM instructor_students ins
       LEFT JOIN users u1 ON ins.instructor_id = u1.id
       LEFT JOIN users u2 ON ins.student_id = u2.id
       WHERE u1.id IS NULL OR u2.id IS NULL""",
)
check(
    "Certification exams with no matching learner",
    """SELECT ce.id FROM certification_exams ce
       LEFT JOIN users u ON ce.learner_id = u.id
       WHERE u.id IS NULL""",
)
check(
    "Trainer-Learner links with no matching users",
    """SELECT tl.id FROM trainer_learners tl
       LEFT JOIN users u1 ON tl.trainer_id = u1.id
       LEFT JOIN users u2 ON tl.learner_id = u2.id
       WHERE u1.id IS NULL OR u2.id IS NULL""",
)

print(f"\n{'='*50}")
if issues_found == 0:
    print("✅ No data integrity issues found.")
else:
    print(f"⚠️  Total issues found: {issues_found}")