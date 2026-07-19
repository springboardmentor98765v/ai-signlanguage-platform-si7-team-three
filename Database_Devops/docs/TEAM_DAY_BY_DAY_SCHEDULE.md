# Milestone 1 — Day-by-Day Schedule (All 5 Roles)

Share this with the whole team. Everyone works in parallel, starting Day 1.
Each day starts with a 15-minute stand-up: what I finished yesterday, what
I'm doing today, am I blocked on anyone?

---

## Intern 1 — Frontend / UI-UX

| Day | Do this | Deliver this |
|---|---|---|
| 1 | Install Node.js, React, Git, VS Code. Read the API contract. Sketch wireframes for Login, Register, Dashboard, Lesson List, Practice screens. | Wireframes + dev environment ready |
| 2 | Set up React project with routing (Login, Dashboard, Lessons, Practice, Reports pages). Build shared Navbar. | Running React app, empty page shells |
| 3 | Build Login/Register pages with validation. Connect to fake/mock data for now. | Working login UI (not yet real) |
| 4 | Build Dashboard (mock stats cards) and Lesson List (mock course cards). | Dashboard + Lesson List with mock data |
| 5 | Build Practice screen: webcam permission, live video, Start/Stop buttons, placeholder for AI result. | Working webcam capture screen |
| 6 | Replace mock data with real calls to Intern 2's login/lesson APIs. Store login token. Add loading/error states. | Frontend connected to real backend |
| 7 | Full integration test with everyone. Fix bugs. Prepare demo. | Working end-to-end demo |

---

## Intern 2 — Backend & API

| Day | Do this | Deliver this |
|---|---|---|
| 1 | Install Python, FastAPI, Postman. Write the full API contract (see data contract doc) and share with team. | Approved API contract |
| 2 | Set up FastAPI project structure. Add a `/health` endpoint. Coordinate with Intern 5 on DB connection. | Running FastAPI skeleton |
| 3 | Build register/login endpoints with password hashing. | Working `/register`, `/login` |
| 4 | Add JWT tokens + role-based access control (RBAC) middleware. | Auth protecting routes |
| 5 | Build Course/Lesson CRUD endpoints. Seed sample Alphabet lessons using Intern 5's schema. | Lesson APIs with real seed data |
| 6 | Add rate limiting, logging, Swagger docs, unit tests. | Documented, tested API layer |
| 7 | Integrate with Frontend + Database. Fix cross-team bugs. | Fully integrated Auth + Course APIs |

---

## Intern 3 — AI/ML & Computer Vision

| Day | Do this | Deliver this |
|---|---|---|
| 1 | Install Python, OpenCV, MediaPipe. Study MediaPipe Hands (21 landmarks). | Environment ready + short plan |
| 2 | Write script: webcam → MediaPipe → show 21 landmarks live on screen. | Working landmark detection demo |
| 3 | Convert landmarks into numeric features (distances, angles). | Feature-extraction function |
| 4 | Collect sample data for 4-5 letters (A, B, C, L, Y) using webcam. | Labeled dataset |
| 5 | Train a simple classifier (KNN or small CNN) on that data. | Prototype model + accuracy number |
| 6 | Wrap it as a FastAPI endpoint: send an image, get back `{predicted_sign, confidence}`. | AI prediction microservice |
| 7 | Connect to Backend so Practice screen can send a frame and get a real prediction. | AI integrated into practice flow |

---

## Intern 4 — Business Logic (Practice/Assessment/Feedback/Analytics)

| Day | Do this | Deliver this |
|---|---|---|
| 1 | Design data model for Practice Sessions, Assessments, Feedback. Define scoring parameters (hand shape, finger position, timing, motion, position). | Scoring design doc, shared with Intern 5 |
| 2 | Build Practice Service: start/end session endpoints. | Session start/end APIs |
| 3 | Track attempts, duration, session status, save to DB. | Sessions persisted with tracking |
| 4 | Build Assessment Service: compare AI's predicted sign vs expected sign, calculate weighted score. | Assessment scoring endpoint |
| 5 | Build Feedback Engine: rule-based messages for common mistakes (thumb position, timing, etc). | Feedback endpoint |
| 6 | Build Analytics: average accuracy, lessons completed, weak-letter list per learner. | Analytics summary endpoint |
| 7 | Connect Practice → Assessment → Feedback → Analytics into one chain. Expose to Frontend. | Full pipeline working end-to-end |

---

## Intern 5 — Database & DevOps (you)

| Day | Do this | Deliver this |
|---|---|---|
| 1 | Study everyone's data needs. Draft ER diagram (Users, Lessons, Sessions, Assessments, Feedback, Analytics). | Approved ER diagram |
| 2 | Set up the database. Create base tables/schemas. Share connection details with Interns 2 and 4. | Running DB + shared credentials |
| 3 | Write migration scripts + ORM models for Users, Roles, Lessons. | User/Course tables validated |
| 4 | Write migration scripts + ORM models for Sessions, Assessments, Feedback, Analytics. | Remaining tables validated |
| 5 | Write Dockerfiles for backend + AI service. Write docker-compose to run everything together. | One-command startup for whole team |
| 6 | Set up Git branching strategy, basic CI (lint/test on push), write setup README. | Git workflow + CI + docs ready |
| 7 | Help everyone dockerize and connect. Verify DB connections end-to-end. Write deployment note. | Verified environment + deployment note |

---

## Shared checkpoints (whole team)

- **Day 1 end:** API contract + ER diagram both shared and agreed on — nobody starts Day 2 without this
- **Day 4 evening:** Mini mid-week check — Backend + Database confirm tables work together; AI shares a sample prediction with Business Logic
- **Day 6:** Everyone's branch merged into one shared "integration" branch
- **Day 7:** No new features — only connecting everyone's work, testing the full flow, and fixing bugs together
