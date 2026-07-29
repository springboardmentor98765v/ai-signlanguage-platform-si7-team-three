# Day 1 - Backend API Contract

## Authentication APIs

### Register User
POST /api/auth/register

Purpose:
Register a new learner.

### Login User
POST /api/auth/login

Purpose:
Authenticate user and return JWT token.

### Get User Profile
GET /api/auth/profile

Purpose:
Return logged-in user's details.

---

## Lesson APIs

### Get All Lessons
GET /api/lessons

Purpose:
Return list of available lessons.

### Get Lesson by ID
GET /api/lessons/{id}

Purpose:
Return details of a specific lesson.

### Create Lesson
POST /api/lessons

Purpose:
Create a new lesson.

### Update Lesson
PUT /api/lessons/{id}

Purpose:
Update lesson details.

### Delete Lesson
DELETE /api/lessons/{id}

Purpose:
Delete a lesson.