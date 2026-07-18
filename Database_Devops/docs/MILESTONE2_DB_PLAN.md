# Milestone 2 — Database Planning (Day 1)

**Owner:** Intern 5 (Database & DevOps)
**SRS deliverable:** Day 1 — "List of new tables/fields written down. Milestone 1 database reviewed for what already exists. Plan shared with Intern 2 and Intern 4 for sign-off."

## What Milestone 1 already has (reviewed, no changes needed)

- `users` — auth + RBAC, unchanged
- `courses`, `lessons` — unchanged structurally (lessons gets 2 new fields, see below)
- `practice_sessions`, `assessments`, `feedback` — unchanged structurally (assessments gets 1 new field)
- `learning_analytics` — unchanged (this is the all-time rollup; Milestone 2 adds a separate weekly table, doesn't replace this)
- `certificates` — unchanged structurally (gets 1 new field for the real PDF path)

## New tables needed for Milestone 2

| Table | Why | Needed by |
|---|---|---|
| `recommendations` | FR-4: system suggests extra practice when a learner scores low repeatedly on the same sign | Intern 4 (Day 4) |
| `instructor_students` | FR-1, FR-2: links an Instructor to their Learners so the Instructor Dashboard shows "my students" only | Intern 2 (Day 3), Intern 1 (Day 4) |
| `weekly_analytics` | FR-4: weekly improvement summary, separate from the existing all-time `learning_analytics` rollup | Intern 4 (Day 5) |

## Fields added to existing tables

| Table | New field | Why |
|---|---|---|
| `lessons` | `category` (alphabet/word) | FR-2: bigger catalogue needs to distinguish letters from simple words |
| `lessons` | `difficulty` (easy/medium) | FR-2: catalogue needs to be filterable/searchable by difficulty |
| `assessments` | `possible_issue` | FR-3: Intern 3's AI now returns a basic error-type hint (e.g. "thumb position looks off") alongside its prediction |
| `certificates` | `pdf_path` | FR-4: Milestone 1 only recorded that a certificate was earned; Milestone 2 generates a real PDF file, this stores where it lives |

## Key design decision: `instructor_students` is one-instructor-per-student

Per the SRS's plain description ("an instructor can see a list of their students"), this is modeled as: one instructor → many students, but each student → exactly one instructor (`student_id` is a unique column). This is the simplest model that satisfies FR-1/FR-2 exactly as written.

**Flag for Intern 2 and Intern 4:** if the team later decides a student should be able to have multiple instructors (e.g. different instructors for different courses), this table's `student_id` unique constraint needs to be removed and the relationship becomes many-to-many. Not needed for Milestone 2's stated requirements, but worth deciding now rather than after Intern 2 builds APIs against the current shape.

## Sign-off checklist

- [ ] Reviewed with Intern 2 (needs `instructor_students` for Instructor/Admin APIs by Day 3-4)
- [ ] Reviewed with Intern 4 (needs `recommendations`, `weekly_analytics`, `certificates.pdf_path` by Day 4-7)
- [ ] Updated ER diagram shared (see `docs/ER_DIAGRAM.md`)
- [ ] Migration generated and tested (see `migrations/versions/e24d36ae8fdd_...py`) — upgrade and downgrade both verified working
