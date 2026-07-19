# Data Contract — What Everyone Needs to Agree On (Day 1)

Share this with the whole team before anyone writes real code. This is
the "shape" of the data that gets passed between everyone's pieces. If
two people disagree on a field name here, fix it on Day 1 — not Day 6.

---

## 1. User (Intern 2 builds, Intern 1 & 5 use)

What a user account looks like:
```json
{
  "id": 1,
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "role": "learner",
  "is_active": true
}
```
`role` is always one of: `learner`, `instructor`, `accessibility_trainer`, `admin`

**Register** — Frontend sends this to Backend:
```json
POST /auth/register
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SomePassword123",
  "role": "learner"
}
```
Backend sends back a login token + the user info above.

**Login** — Frontend sends this to Backend:
```json
POST /auth/login
{
  "email": "jane@example.com",
  "password": "SomePassword123"
}
```
Same response as register: a token + user info.

The Frontend saves that token and sends it with every future request so
the Backend knows who's asking.

---

## 2. Lesson (Intern 2 builds, Intern 1, 3 & 4 all use)

```json
{
  "id": 1,
  "title": "Letter B",
  "expected_sign": "B",
  "instructions": "Flat open palm, all fingers extended"
}
```

**`expected_sign` is the single most important field in the whole
project.** It's the answer key — Intern 3's AI predicts a sign, and
Intern 4's Assessment Service compares the prediction against this
field to score accuracy. Everyone must use this exact field name.

---

## 3. AI Prediction (Intern 3 builds, Intern 4 uses)

Frontend sends a webcam frame (or hand landmarks) to the AI service.
The AI service sends back exactly this shape — nothing more, nothing less:
```json
{
  "predicted_sign": "B",
  "confidence": 96.4
}
```
`confidence` is always a number between 0 and 100.

This is the hand-off point between Intern 3 and Intern 4 — if this
shape changes, both of them need to know immediately.

---

## 4. Assessment Result (Intern 4 builds, Intern 1 displays)

After the AI predicts a sign, Intern 4's service scores it:
```json
{
  "predicted_sign": "B",
  "confidence": 96.4,
  "hand_shape_score": 95.0,
  "finger_position_score": 90.0,
  "motion_score": 88.0,
  "timing_score": 85.0,
  "position_score": 92.0,
  "overall_accuracy": 90.0,
  "passed": true
}
```

## 5. Feedback (Intern 4 builds, Intern 1 displays)

```json
{
  "mistakes": ["Your thumb position was slightly off"],
  "suggestions": ["Keep your thumb closer to your palm"]
}
```
Always two lists of plain-English sentences, same length as each other.

---

## 6. Analytics Summary (Intern 4 builds, Intern 1 displays)

```json
{
  "total_sessions": 12,
  "average_accuracy": 87.5,
  "lessons_completed": 5,
  "weak_signs": ["M", "N", "R"]
}
```

---

## How this maps to the flow everyone's building toward

```
Frontend (1)
   -> sends webcam frame
Backend/AI (2 & 3)
   -> returns predicted_sign + confidence
Business Logic (4)
   -> compares predicted_sign to Lesson's expected_sign
   -> returns assessment scores + feedback
Frontend (1)
   -> displays the score and feedback to the learner
Database (5)
   -> everything above gets saved here, for Analytics to summarize later
```

**Rule for the whole week:** if you need to change any field name or
shape in this document after Day 1, say so in the daily stand-up
immediately — don't just change it silently, or someone else's code
will break without warning.

---

## Milestone 2 Additions

These are the new data shapes based on the Milestone 2 database schema
(`docs/ER_DIAGRAM.md`). Intern 2 and Intern 4 should confirm their
actual API responses match these shapes exactly - this is written from
the database side, not yet cross-checked against real endpoint code.

### Recommendation (Intern 4 builds, Intern 1 displays)
```json
{
  "id": 1,
  "sign": "M",
  "recommended_sessions": 5,
  "reason": "Below 70% in last 3 attempts",
  "is_active": true
}
```

### Instructor-Student link (Intern 2 builds, Intern 1 displays on Instructor Dashboard)
```json
{
  "instructor_id": 3,
  "student_id": 7,
  "student_name": "Jane Doe",
  "student_average_accuracy": 82.5,
  "assigned_at": "2026-07-18T10:00:00Z"
}
```
**Important:** each student has exactly ONE instructor (not many-to-many).
If this needs to change, tell Intern 5 before building APIs against it.

### Weekly Analytics (Intern 4 builds, Intern 1 displays as a weekly chart)
```json
{
  "week_start_date": "2026-07-13",
  "sessions_this_week": 8,
  "average_accuracy_this_week": 82.5,
  "improvement_rate": 5.0,
  "weak_signs_this_week": ["M", "N"]
}
```

### Lesson (updated - now includes Milestone 2 fields)
```json
{
  "id": 1,
  "title": "Letter B",
  "expected_sign": "B",
  "instructions": "Flat open palm, all fingers extended",
  "category": "alphabet",
  "difficulty": "easy"
}
```

### Assessment (updated - now includes AI's error hint)
```json
{
  "predicted_sign": "B",
  "confidence": 96.4,
  "overall_accuracy": 90.0,
  "passed": true,
  "possible_issue": "thumb position looks off"
}
```

### Certificate (updated - now includes real PDF location)
```json
{
  "skill_level": "advanced",
  "final_score": 95.0,
  "pdf_path": "/certificates/jane_doe_alphabet.pdf"
}
```
