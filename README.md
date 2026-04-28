# KhanLearn

A full-stack learning management system inspired by Khan Academy, built with React + Redux Toolkit on the frontend and Node.js + Express + MongoDB on the backend.

---

## Features

- **Public**: Browse and filter courses by category, level, and search; view course detail and enroll
- **Students**: Dashboard, lesson player with completion tracking, quiz taking with instant results, progress overview
- **Teachers**: Create/edit courses, manage lessons and quizzes, submit for admin approval, view per-course student progress
- **Admins**: Dashboard with charts, user management (activate/deactivate/delete), course moderation (approve/reject), analytics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Redux Toolkit (RTK Query), React Router v6, Bootstrap 5, Chart.js |
| Backend | Node.js, Express 4, Mongoose 8, JWT (access + refresh tokens) |
| Database | MongoDB |

---

## Project Structure

```
POC/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── app/         # Redux store
│       ├── components/  # Shared UI components
│       ├── features/    # Redux slices (auth, ui)
│       ├── hooks/       # Custom React hooks
│       ├── pages/       # Route-level page components
│       ├── services/    # RTK Query API slices
│       └── utils/       # Helpers (axios, formatters)
└── server/          # Express backend
    ├── config/      # DB connection
    ├── constants/   # Role definitions
    ├── controllers/ # Route handlers
    ├── middleware/  # Auth, roles, validation, errors
    ├── models/      # Mongoose schemas
    ├── routes/      # Express routers
    ├── seed/        # Database seeder
    ├── utils/       # Async handler, API response, tokens
    └── validators/  # express-validator schemas
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/khanlearn
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database

```bash
cd server
npm run seed
```

This creates:
- Admin: `admin@khanlearn.com` / `Admin@123`
- Teacher: `teacher@khanlearn.com` / `Teacher@123`
- Student: `student@khanlearn.com` / `Student@123`
- Sample courses, lessons, quizzes, and enrollments

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/v1

---

## API Endpoints

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me`, `PUT /auth/profile`, `PATCH /auth/password` |
| Courses | `GET /courses`, `GET /courses/:id`, `POST /courses`, `PUT /courses/:id`, `DELETE /courses/:id`, `PATCH /courses/:id/submit`, `PATCH /courses/:id/approve`, `PATCH /courses/:id/reject`, `GET /courses/teacher/mine` |
| Lessons | `GET /lessons/course/:courseId`, `GET /lessons/:id`, `POST /lessons`, `PUT /lessons/:id`, `DELETE /lessons/:id`, `POST /lessons/:id/complete` |
| Quizzes | `GET /quizzes/course/:courseId`, `GET /quizzes/:id`, `POST /quizzes`, `PUT /quizzes/:id`, `DELETE /quizzes/:id`, `POST /quizzes/:id/attempt` |
| Enrollments | `POST /enrollments`, `GET /enrollments/my`, `DELETE /enrollments/:courseId`, `GET /enrollments/course/:courseId` |
| Progress | `GET /progress/overview`, `GET /progress/course/:courseId`, `GET /progress/course/:courseId/all`, `GET /progress/student/:studentId/course/:courseId` |
| Users | `GET /users`, `GET /users/:id`, `PATCH /users/:id/status`, `DELETE /users/:id` |
| Admin | `GET /admin/stats`, `GET /admin/pending-courses`, `GET /admin/enrollments-chart`, `GET /admin/users-chart`, `GET /admin/top-courses` |

---

## Roles & Permissions

| Action | Student | Teacher | Admin |
|---|:---:|:---:|:---:|
| Browse courses | ✓ | ✓ | ✓ |
| Enroll in courses | ✓ | — | — |
| Complete lessons / take quizzes | ✓ | — | — |
| Create / manage courses | — | ✓ | — |
| Approve / reject courses | — | — | ✓ |
| Manage users | — | — | ✓ |
| View platform analytics | — | — | ✓ |
