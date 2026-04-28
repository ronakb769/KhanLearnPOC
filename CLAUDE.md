# KhanLearn — Claude Code Context

## Project Overview
KhanLearn is a full-stack Learning Management System (LMS) inspired by Khan Academy.
- **Users**: Students enroll and learn, Teachers create courses, Admins moderate.
- **Working directory**: `c:\POC`

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Redux Toolkit (RTK Query), React Router v6, Bootstrap 5, Chart.js |
| Backend | Node.js + Express 4, Mongoose 8, JWT (access + refresh tokens via cookies) |
| Database | MongoDB Atlas (standard connection string — SRV DNS blocked on this network) |

## Running the Project

```bash
# Backend  (port 5000)
cd server && npm run dev

# Frontend (port 5175)
cd client && npm run dev

# Seed database
cd server && npm run seed
```

## Environment
- Server env file: `server/.env`
- MongoDB uses **standard connection string** (not `mongodb+srv://`) — SRV DNS is blocked on this network
- DB name: `khanclone`
- `CLIENT_URL=http://localhost:5175` (Vite runs on 5175, not default 5173)

## Project Structure

```
POC/
├── client/src/
│   ├── app/store.js              # Redux store — all 8 RTK Query slices registered here
│   ├── features/auth/authSlice.js # Auth state: user, accessToken, isAuthenticated
│   ├── features/ui/uiSlice.js    # UI state: sidebarCollapsed
│   ├── hooks/
│   │   ├── useAuth.js            # Auth selectors
│   │   ├── useRole.js            # Role check helpers
│   │   └── useToast.js           # react-toastify wrapper — use showToast(msg, variant)
│   ├── services/                 # RTK Query APIs (8 files: auth, course, lesson, quiz, enrollment, progress, admin, user)
│   ├── components/
│   │   ├── common/               # Loader, EmptyState, ConfirmModal, Pagination, SearchBar, StatCard, ProtectedRoute, RoleRoute
│   │   ├── course/               # CourseCard, CourseGrid, CourseFilters, CourseProgressBar
│   │   ├── lesson/               # LessonSidebar, LessonContent
│   │   ├── quiz/                 # QuizQuestion, QuizResults
│   │   └── layout/               # Navbar, Sidebar, Footer, DashboardLayout
│   └── pages/
│       ├── public/               # HomePage, CourseCatalogPage, CourseDetailPage
│       ├── auth/                 # LoginPage, RegisterPage
│       ├── student/              # StudentDashboard, StudentLesson, StudentQuiz, StudentProgress
│       ├── teacher/              # TeacherDashboard, TeacherCourses, TeacherCourseForm, TeacherLessons, TeacherQuizzes, TeacherQuizForm, TeacherProgress
│       ├── admin/                # AdminDashboard, AdminUsers, AdminCourses, AdminAnalytics
│       └── misc/                 # UnauthorizedPage
└── server/
    ├── controllers/              # authController, courseController, lessonController, quizController, enrollmentController, progressController, adminController, userController
    ├── models/                   # User, Course, Lesson, Quiz, Enrollment, Progress
    ├── routes/                   # One file per resource
    ├── middleware/               # authMiddleware (verifyAccessToken), roleMiddleware (authorize), validateMiddleware, errorMiddleware
    ├── validators/               # express-validator schemas
    ├── utils/                    # asyncHandler, apiResponse (success/error), generateTokens
    └── seed/seed.js              # Seeds admin, teacher, student + sample courses/lessons/quizzes
```

## Key Conventions

### API Response Shape
All API responses use `success(res, data, message, statusCode)` from `utils/apiResponse.js`:
```js
{ success: true, data: { ... }, message: "..." }
// or on error:
{ success: false, message: "..." }
```

### RTK Query data access pattern
```js
const items = data?.data?.items || data?.data || []
```

### useToast
```js
const { showToast } = useToast()
showToast('Message', 'success')   // variants: success, danger, warning, info
```

### Component prop names (always use these)
- `StatCard`: `variant` (not `color`) for the color variant
- `CourseProgressBar`: accepts both `percent` and `percentage`
- `EmptyState`: use `description`, `actionLabel`, `actionTo`, `onAction`
- `ConfirmModal`: use `confirmLabel`, `confirmVariant`, `loading`

### Enroll mutation — pass courseId as a plain string
```js
await enroll(courseId).unwrap()   // CORRECT
await enroll({ courseId }).unwrap() // WRONG — double-wraps the body
```

### Quiz data format (matches Mongoose schema)
- Question field: `questionText` (not `text`)
- Options: `[{ id, text, isCorrect }]` — objects, not strings
- Attempt answers: `[{ questionId, selectedOptionId }]`

## Seeded Test Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@khanlearn.com | Admin@123 |
| Teacher | teacher@khanlearn.com | Teacher@123 |
| Student | student@khanlearn.com | Student@123 |

## Roles & Route Guards
- `ProtectedRoute` — requires `isAuthenticated`
- `RoleRoute` — requires specific role; unauthorized → `/unauthorized`
- Dashboard routes: `/student/dashboard`, `/teacher/dashboard`, `/admin/dashboard`

## Known Issues / Notes
- Bootstrap JS is NOT loaded — never use `data-bs-toggle`. Use React state for dropdowns/modals.
- The Navbar dropdown is fully React-controlled (`useState` + `useRef` for click-outside).
- Public pages wrap their return in `<div className="d-flex flex-column min-vh-100">` for sticky footer.
- MongoDB Atlas SRV DNS (`mongodb+srv://`) is blocked on this network — use the standard connection string in `.env`.
