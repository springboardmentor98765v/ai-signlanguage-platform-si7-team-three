# ER Diagram — Sign Language Learning & Assessment Platform

**Owner:** Intern 5 (Database & DevOps)
**Milestone 1 deliverable:** Day 1 — ER diagram covering Users/Roles, Lessons/Modules, Practice Sessions, Assessments, Feedback, Analytics
**Milestone 2 update:** Day 2 — added Recommendations, Instructor-Student mapping, Weekly Analytics tables; extended Lessons (category/difficulty), Assessments (possible_issue), Certificates (pdf_path)

Renders automatically on GitHub - just view this file in the repo.

```mermaid
erDiagram
    USERS ||--o{ PRACTICE_SESSIONS : "starts"
    USERS ||--o{ ASSESSMENTS : "receives"
    USERS ||--o{ CERTIFICATES : "earns"
    USERS ||--o| LEARNING_ANALYTICS : "has"
    USERS ||--o{ RECOMMENDATIONS : "receives"
    USERS ||--o{ WEEKLY_ANALYTICS : "has weekly"
    USERS ||--o{ INSTRUCTOR_STUDENTS : "instructs (as instructor)"
    USERS ||--o| INSTRUCTOR_STUDENTS : "is assigned to (as student)"

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
        string category "alphabet/word - NEW in M2"
        string difficulty "easy/medium - NEW in M2"
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
        string possible_issue "AI's error-type hint - NEW in M2"
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
        string pdf_path "NEW in M2 - real generated PDF location"
        datetime issued_at
    }

    RECOMMENDATIONS {
        int id PK
        int learner_id FK
        string sign "e.g. M - the weak sign"
        int recommended_sessions
        string reason "e.g. below 70% in last 3 attempts"
        boolean is_active
        datetime created_at
    }

    INSTRUCTOR_STUDENTS {
        int id PK
        int instructor_id FK "references users.id"
        int student_id FK "references users.id, unique - one instructor per student"
        datetime assigned_at
    }

    WEEKLY_ANALYTICS {
        int id PK
        int learner_id FK
        datetime week_start_date "Monday of the summarized week"
        int sessions_this_week
        float average_accuracy_this_week
        float improvement_rate "vs previous week"
        text weak_signs_this_week "JSON array"
        datetime created_at
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

### Milestone 2 additions

- **`INSTRUCTOR_STUDENTS`** is a simple mapping table, not a many-to-many
  join in the usual sense — per the SRS, each student has exactly ONE
  instructor (`student_id` is unique), but one instructor can have many
  students. If the team later wants students to have multiple
  instructors, this table would need `student_id`'s unique constraint
  removed.
- **`RECOMMENDATIONS`** is append-only with an `is_active` flag rather
  than being deleted when resolved — this preserves history (so
  Instructors/Admins can see what a learner used to struggle with, not
  just their current weak points).
- **`WEEKLY_ANALYTICS`** is separate from `LEARNING_ANALYTICS` on
  purpose: `LEARNING_ANALYTICS` is an always-current all-time rollup
  (one row, continuously updated), while `WEEKLY_ANALYTICS` is a
  historical snapshot (one new row per learner per week), so Intern 4's
  weekly summary logic has real week-over-week data to compare against.
- **`CERTIFICATES.pdf_path`** stores a file path/URL rather than the PDF
  bytes themselves — keeps the database small and lets Intern 4 use
  whatever free storage approach is simplest (local file, or the free
  hosting provider's disk).

Full implementation (SQLAlchemy ORM models matching this diagram
exactly) is in `app/models.py`.
