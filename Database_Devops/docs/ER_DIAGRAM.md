# ER Diagram — Sign Language Learning & Assessment Platform

**Owner:** Intern 5 (Database & DevOps)
**Milestone 1 deliverable:** Day 1 — "Reviewed ER diagram approved by the team; shared with Interns 2 and 4."

This diagram covers every table needed across all four other domains'
Milestone 1 requirements: Users/Roles (Intern 2), Lessons/Modules
(Intern 2), Practice Sessions/Assessments/Feedback/Analytics (Intern 4).

Renders automatically on GitHub - just view this file in the repo.

```mermaid
erDiagram
    USERS ||--o{ PRACTICE_SESSIONS : "starts"
    USERS ||--o{ ASSESSMENTS : "receives"
    USERS ||--o{ CERTIFICATES : "earns"
    USERS ||--o| LEARNING_ANALYTICS : "has"

    COURSES ||--o{ LESSONS : "contains"
    COURSES ||--o{ CERTIFICATES : "certifies"

    LESSONS ||--o{ PRACTICE_SESSIONS : "practiced in"

    PRACTICE_SESSIONS ||--o{ ASSESSMENTS : "produces"

    ASSESSMENTS ||--o| FEEDBACK : "generates"

    USERS {
        int id PK
        string full_name
        string email UK
        string hashed_password
        enum role "learner/instructor/accessibility_trainer/admin"
        boolean is_active
        datetime created_at
    }

    COURSES {
        int id PK
        string title
        text description
        string level "beginner/intermediate/advanced"
        datetime created_at
    }

    LESSONS {
        int id PK
        int course_id FK
        string title
        string expected_sign "e.g. A, B, C"
        text instructions
        int order_index
    }

    PRACTICE_SESSIONS {
        int id PK
        int learner_id FK
        int lesson_id FK
        datetime started_at
        datetime ended_at
        int attempts
        string status "in_progress/completed"
    }

    ASSESSMENTS {
        int id PK
        int session_id FK
        int learner_id FK
        string predicted_sign
        float confidence
        float hand_shape_score
        float finger_position_score
        float motion_score
        float timing_score
        float position_score
        float overall_accuracy
        boolean passed
        datetime created_at
    }

    FEEDBACK {
        int id PK
        int assessment_id FK
        text mistakes "JSON array of strings"
        text suggestions "JSON array of strings"
        datetime created_at
    }

    LEARNING_ANALYTICS {
        int id PK
        int learner_id FK "unique - one row per learner"
        int total_sessions
        float total_practice_minutes
        int lessons_completed
        float average_accuracy
        float improvement_rate
        text weak_signs "JSON array, e.g. [M, N, R]"
        datetime last_updated
    }

    CERTIFICATES {
        int id PK
        int learner_id FK
        int course_id FK
        string skill_level
        float final_score
        datetime issued_at
    }
```

## Design notes for the team

- **RBAC via single `role` enum column** on `USERS`, not a separate
  roles table — simpler for Milestone 1's 4 fixed roles
  (Learner/Instructor/Accessibility Trainer/Admin). Intern 2's
  middleware reads this column directly.
- **`LESSONS.expected_sign`** is the single field Intern 3's AI service
  and Intern 4's Assessment Service both need to agree on — it's the
  ground truth every prediction gets compared against.
- **`ASSESSMENTS`** stores the 5 weighted score parameters Intern 4
  specified on Day 1 (hand shape, finger position, timing, motion,
  position) as individual columns rather than a JSON blob, so they're
  queryable for analytics later.
- **`FEEDBACK.mistakes`/`suggestions`** are stored as JSON-encoded text
  rather than separate tables, since Milestone 1 only needs a flat list
  of rule-based messages per attempt, not structured mistake records.
- **`LEARNING_ANALYTICS`** is one row per learner (not one row per
  session) — it's a continuously-updated rollup, matching Intern 4's
  Day 6 "aggregate a learner's session and assessment history into
  simple stats" requirement.

Full implementation (SQLAlchemy ORM models matching this diagram
exactly) is in `app/models.py`.
