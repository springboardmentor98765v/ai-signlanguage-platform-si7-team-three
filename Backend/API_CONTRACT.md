# Backend API Contract

## Authentication

### Register

POST /api/v1/auth/register

### Login

POST /api/v1/auth/login

### Profile

GET /api/v1/auth/profile

---

## Lessons

GET /api/v1/lessons

GET /api/v1/lessons/{id}

POST /api/v1/lessons

PUT /api/v1/lessons/{id}

DELETE /api/v1/lessons/{id}

---

## Modules

GET /api/v1/modules

POST /api/v1/modules

PUT /api/v1/modules/{id}

DELETE /api/v1/modules/{id}

---

## Health

GET /health

### Sample Register Request

```json
{
    "name":"Harshit",
    "email":"harshit@gmail.com",
    "password":"Password123",
    "role":"Learner"
}
```

### Sample Login Response

```json
{
    "access_token":"JWT_TOKEN",
    "token_type":"Bearer",
    "role":"Learner"
}
```