# TaskManager — Scalable REST API with JWT Auth & RBAC

A production-ready, full-stack MERN application featuring JWT authentication, role-based access control, and a minimal React dashboard.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Frontend Setup](#frontend-setup)
- [Scalability Notes](#scalability-notes)

---

## Project Overview

TaskManager is a secure, scalable REST API that demonstrates:
- **JWT-based authentication** with 1-hour token expiry
- **Role-Based Access Control** (RBAC) — `user` and `admin` roles
- **Full CRUD** for tasks with ownership enforcement
- **Joi validation** on all inputs (body + params)
- **Morgan logging** of all HTTP requests
- **Helmet** for secure HTTP headers
- **Global error handling** middleware
- **Consistent response format** across all endpoints
- **API versioning** at `/api/v1/`
- **Minimal React frontend** with protected dashboard

---

## Tech Stack

| Layer        | Technology              |
|-------------|------------------------|
| Runtime     | Node.js (≥18)          |
| Framework   | Express.js 4           |
| Database    | MongoDB + Mongoose 8   |
| Auth        | JWT + bcrypt           |
| Validation  | Joi                    |
| Logging     | Morgan                 |
| Security    | Helmet + CORS          |
| Frontend    | React 18 + Vite        |

---

## Project Structure

```
assessment/
├── .env
├── README.md
├── TaskManager_API.postman_collection.json
│
├── backend/
│   ├── app.js              # Express app setup
│   ├── server.js           # HTTP server + graceful shutdown
│   ├── package.json
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js         # authenticate + authorizeRoles
│   │   ├── validate.js     # Joi validation factory
│   │   └── errorHandler.js # Global error + 404 handler
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── logger.js
│   │   └── response.js
│   └── validations/
│       ├── authValidation.js
│       └── taskValidation.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── TaskCard.jsx
        │   └── TaskModal.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── services/
            └── api.js
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & Configure

```bash
# Navigate to project root
cd assessment

# Copy and edit env
cp .env .env.local
# Edit .env with your MongoDB URI and JWT secret
```

### 2. Install & Run Backend

```bash
cd backend
npm install
npm run dev        # Development (nodemon)
# OR
npm start          # Production
```

Backend runs at: **http://localhost:5000**

### 3. Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Environment Variables

| Variable            | Required | Default                  | Description                        |
|--------------------|----------|--------------------------|------------------------------------|
| `PORT`              | No       | `5000`                   | Server port                        |
| `MONGODB_URI`       | **Yes**  | —                        | MongoDB connection string          |
| `JWT_SECRET`        | **Yes**  | —                        | Secret key for JWT signing (≥32 chars) |
| `JWT_EXPIRY`        | No       | `1h`                     | JWT token expiry (e.g. `1h`, `7d`) |
| `NODE_ENV`          | No       | `development`            | Environment mode                   |
| `CORS_ORIGIN`       | No       | `http://localhost:3000`  | Allowed CORS origin                |
| `BCRYPT_SALT_ROUNDS`| No       | `12`                     | bcrypt hashing rounds              |

> ⚠️ **Never commit `.env` to version control.**

---

## API Endpoints

### Base URL: `http://localhost:5000/api/v1`

#### Auth

| Method | Endpoint              | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | `/auth/register`     | No   | Register new user        |
| POST   | `/auth/login`        | No   | Login and get JWT token  |
| GET    | `/auth/me`           | ✅   | Get current user profile |

#### Tasks

| Method | Endpoint         | Auth | Roles        | Description                         |
|--------|-----------------|------|--------------|-------------------------------------|
| POST   | `/tasks`         | ✅   | user, admin  | Create a task                       |
| GET    | `/tasks`         | ✅   | user, admin  | Get tasks (own for user, all for admin) |
| GET    | `/tasks/:id`     | ✅   | user, admin  | Get task by ID (ownership enforced) |
| PUT    | `/tasks/:id`     | ✅   | user, admin  | Update task (ownership enforced)    |
| DELETE | `/tasks/:id`     | ✅   | **admin**    | Delete task (admin only)            |

#### Query Parameters (GET /tasks)
| Param    | Type   | Description                              |
|---------|--------|------------------------------------------|
| `page`  | number | Page number (default: 1)                 |
| `limit` | number | Items per page (default: 10, max: 100)   |
| `status`| string | Filter: `pending`, `in-progress`, `completed` |

#### Response Format (all endpoints)

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

## Authentication Flow

```
Client                        Server
  |                              |
  |-- POST /auth/register ------>|
  |                              | Hash password (bcrypt)
  |                              | Save user to MongoDB
  |                              | Generate JWT { userId, role }
  |<-- { token, user } ---------|
  |                              |
  |-- POST /auth/login --------->|
  |                              | Find user by email
  |                              | Compare passwords (bcrypt)
  |                              | Generate JWT { userId, role }
  |<-- { token, user } ---------|
  |                              |
  |-- GET /tasks (Bearer token)->|
  |                              | Verify JWT signature
  |                              | Check expiry (1h)
  |                              | Fetch user from DB
  |                              | Attach to req.user
  |                              | Check authorizeRoles
  |<-- { tasks, pagination} ----|
```

**Token included in all protected requests:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Database Schema

### User

| Field       | Type     | Required | Notes                        |
|------------|----------|----------|------------------------------|
| `name`     | String   | Yes      | 2–100 chars                  |
| `email`    | String   | Yes      | Unique, lowercase            |
| `password` | String   | Yes      | bcrypt hashed, never returned|
| `role`     | String   | Yes      | `user` or `admin`            |
| `createdAt`| Date     | Auto     | Mongoose timestamp           |
| `updatedAt`| Date     | Auto     | Mongoose timestamp           |

**Indexes:** `email` (unique), `role`

### Task

| Field         | Type       | Required | Notes                                 |
|--------------|------------|----------|---------------------------------------|
| `title`      | String     | Yes      | 3–200 chars                           |
| `description`| String     | No       | Up to 2000 chars                      |
| `status`     | String     | Yes      | `pending` \| `in-progress` \| `completed` |
| `user`       | ObjectId   | Yes      | Reference to User                     |
| `createdAt`  | Date       | Auto     | Mongoose timestamp                    |
| `updatedAt`  | Date       | Auto     | Mongoose timestamp                    |

**Indexes:** `{ user, createdAt }` compound, `{ user, status }` compound, `status`

---

## Frontend Setup

The React frontend uses **Vite** and **functional components** with only `useState` and `useEffect` hooks.

### Pages
- **Login** (`/`) — Sign in with email/password
- **Register** — Create a new account
- **Dashboard** — Protected: view, create, update tasks; admins can delete

### Architecture
```
src/
├── services/api.js      # All API calls centralized here
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx    # Protected, token-gated
└── components/
    ├── TaskCard.jsx      # Individual task display
    └── TaskModal.jsx     # Create/Edit modal
```

### Token Management
- JWT stored in `localStorage` on login/register
- Automatically attached to all API requests as `Authorization: Bearer <token>`
- Dashboard redirects to login if no token found or token is expired

---

## Scalability Notes

### Horizontal Scaling
The stateless JWT architecture means any number of server instances can independently verify tokens — no shared session store needed. Use **PM2 cluster mode** or containerize with **Docker** and scale replicas:

```bash
pm2 start server.js -i max   # Cluster mode: one process per CPU core
```

### Load Balancing
Place an **Nginx** or **AWS ALB** load balancer in front of multiple Node instances. Since the app is stateless, any instance can serve any request:
```
                 ┌─ Node Instance 1 (port 5000)
Internet → Nginx ┤─ Node Instance 2 (port 5001)
                 └─ Node Instance 3 (port 5002)
```

### Redis Caching
Add Redis to cache frequently read data (e.g., task lists, user profiles):
```js
// Example: cache GET /tasks for 60 seconds per user
const cacheKey = `tasks:${userId}:${page}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
// ... DB query ...
await redis.setEx(cacheKey, 60, JSON.stringify(data));
```

Invalidate on writes (POST/PUT/DELETE).

### MongoDB Indexing
All performance-critical query patterns are indexed:
- `{ user: 1, createdAt: -1 }` — user's task list sorted by newest
- `{ user: 1, status: 1 }` — filtered task listing per user
- `{ email: 1 }` — login lookup

Use `explain()` to verify queries use indexes in production.

### Microservices Migration Path
The modular architecture maps cleanly to microservices:
- **Auth Service** — `/api/v1/auth` routes → standalone service
- **Task Service** — `/api/v1/tasks` routes → standalone service
- **API Gateway** — Nginx or Kong routing to services

Each service gets its own MongoDB collection/database and communicates via REST or a message broker (RabbitMQ / Kafka).

---

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] Passwords never returned in API responses (`select: false`)
- [x] JWT with 1-hour expiry
- [x] JWT issuer/audience binding
- [x] Helmet for secure HTTP headers
- [x] CORS restricted to configured origin
- [x] Joi input validation (strips unknown fields)
- [x] Global error handler (no stack traces in production)
- [x] MongoDB injection protected by Mongoose ODM

---

## Postman Collection

Import `TaskManager_API.postman_collection.json` into Postman.

The collection includes:
- Pre-request / test scripts that auto-save your token after login/register
- All 7 endpoints with example request bodies and response schemas
- Collection variables: `base_url` and `token`

---

*Built with Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, and React.*
