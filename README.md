# School Management System

A full-stack platform for Somali private schools and madrasas that currently run
on paper: a public school website plus a login portal with a dashboard for
admins, teachers, parents and students. MERN stack, light/dark theme, simulated
mobile-money fee payments.

**Repo:** [github.com/Abdalle13/school-management-system](https://github.com/Abdalle13/school-management-system)

---

## Features

### Public website

- Home, About, Academics, Admissions and News, all reading the school's name,
  contact details and social links from the admin settings.
- An admissions application form (no fee, no public sign up) that lands
  straight in the admin's applications queue.
- A contact form and a news list, both backed by real data, not placeholders.
- Light and dark theme with a toggle, remembered per browser, light by default.

### Admin dashboard

- Full CRUD on users, students (enrolment, class, guardians), classes,
  subjects, staff, terms and the school's public profile.
- Review admission applications and turn an accepted one into a student, with
  an auto-generated, unique admission number.
- Take or edit attendance for any class, browse and correct the register.
- Create exams, enter marks, generate report cards, add remarks, publish them.
- Set fee structures per class and term, generate invoices, add installment
  plans, record cash payments, see balances.
- Build the weekly timetable per class and post announcements to everyone, a
  class or a role.
- A reports dashboard (enrolment, attendance, exam performance, fee
  collection) with a PDF export.

### Teacher, parent and student portals

- **Teacher**: mark the daily register, create exams and enter marks for
  assigned subjects, see their own weekly timetable, post class announcements.
- **Parent** (mobile first, with a child switcher): each child's attendance,
  published report cards with PDF download, fee invoices and installment
  schedule, and paying fees through the simulated mobile-money gateway.
- **Student**: their own timetable, published report cards, attendance and
  fee balance.

### Backend

- JWT auth, bcrypt hashing, `helmet`, a CORS allow-list, and rate-limited
  auth endpoints. Login errors say specifically what is wrong (no matching
  account, or a wrong password) instead of a vague message.
- Role-based access enforced on every route: a parent only ever sees their
  own children's data, a student only their own.
- Report cards, invoices and admission numbers are computed and generated
  server-side; the client cannot fabricate them.
- Transactional email and a simulated SMS/WhatsApp notification log for
  attendance alerts, payments and announcements.

---

## Tech stack

| Layer      | Tools                                                                                  |
| :--------- | :-------------------------------------------------------------------------------------- |
| Frontend   | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS v4, Framer Motion, Recharts |
| Backend    | Node.js, Express 5, Mongoose 9, JSON Web Tokens, Nodemailer, Multer, Helmet             |
| Database   | MongoDB Atlas                                                                            |
| Images     | ImageKit.io (uploads) + hotlinked stock photos for the marketing pages                  |
| PDF        | jsPDF + jspdf-autotable (lazy-loaded)                                                   |
| Deployment | Vercel (frontend + backend serverless, two projects)                                    |

The portal is code split away from the public bundle: every portal screen
loads on demand, and the chart and PDF libraries only load when a screen
actually needs them.

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- An ImageKit account (for photo uploads)
- An SMTP account for email (a Gmail app password works)

### 1. Clone and install

```bash
git clone https://github.com/Abdalle13/school-management-system.git
cd school-management-system

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

IMAGEKIT_URL_ENDPOINT=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=School Name <you@gmail.com>

EVC_DEMO_PIN=1234

ADMIN_NAME=School Admin
ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=change_this_after_first_login
```

### 3. Configure the frontend

Create `frontend/.env` from `frontend/.env.example`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# terminal 1
cd backend && npm run data:import   # creates the first admin from the ADMIN_ vars
npm run dev

# terminal 2
cd frontend && npm run dev
```

Frontend on `http://localhost:5173`, API on `http://localhost:5000`.

### 5. Seed demo data

```bash
cd backend
npm run demo              # additive, safe to run more than once
npm run demo:destroy      # remove only the demo data
```

Somali student and parent names, classes, a term, teaching assignments, a
timetable, attendance, marks, report cards, fee structures with invoices and
payments, and announcements.

| Role    | Login                  | Password      |
| :------ | :---------------------- | :------------ |
| Admin   | `admin@school.com`      | `admin123456` |
| Teacher | `teacher1@demo.school`  | `teacher123`  |
| Parent  | `parent1@demo.school`   | `parent123`   |
| Student | `STU90000001`           | `student123`  |

---

## Simulated parts

Two things are simulated on purpose, so the app can be demoed without real
accounts or a paid gateway:

- **Mobile money (EVC Plus / Zaad)**: a fake gateway. A valid Somali mobile
  number plus the demo PIN (`1234`) always succeeds; any other PIN is
  rejected. No real money moves. A production build would integrate the
  Hormuud WAAFI merchant API.
- **SMS / WhatsApp notifications**: written to the database and shown in an
  admin message log, and optionally emailed. Nothing is really sent to a
  phone.

Everything else (enrolment, attendance, grading, invoicing, installment
logic, the timetable, applications, role access) is real application logic
against MongoDB.

---

## Deployment

Two separate Vercel projects from this one repo, each with a different Root
Directory (`backend`, `frontend`). Set the backend's environment variables
from `backend/.env.example` on that project, and `VITE_API_URL` on the
frontend project to the backend's URL plus `/api`. Set the backend's
`FRONTEND_URL` to the frontend's URL once you have it, and redeploy. Then run
`npm run data:import` once against the production `MONGODB_URI` to create the
first admin.

---

Built by [Abdalle Hussein](https://github.com/Abdalle13).
