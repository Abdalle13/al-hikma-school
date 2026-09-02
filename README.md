# School Management System

A web app for Somali private schools and madrasas that currently run on paper.
It has two parts:

1. A **public school website** anyone can visit: Home, About, Academics, Admissions
   (with an application form), News and Events, Contact.
2. A **portal** behind a login, with a dashboard per role: Admin, Teacher, Parent,
   Student.

Built by Abdalle Hussein as a portfolio project. MERN stack, deployed on Vercel
as two projects (the React frontend and a serverless Express backend).

## Accounts and login

There is no public sign up. The admin creates every account (teachers, parents,
students) and sets the password directly. On first login the user is asked to
change it once. Teachers and parents log in with their **email**, students log in
with their **admission number**, and one login form accepts either. There is no
self service password reset: if someone forgets their password the admin resets
it from that user's edit form.

## What each role can do

**Admin**
- Full CRUD on users, students (with enrolment, class, guardians), classes,
  subjects, staff, terms and the school settings.
- Review admission applications and turn an accepted one into a student.
- Take or edit attendance for any class, browse the register, delete records.
- Create exams, enter marks, generate report cards, add remarks, publish them.
- Set fee structures per class and term, generate invoices, add installment
  plans, record cash payments, view balances.
- Build the weekly timetable per class.
- Post announcements to everyone, a class or a role, and read the message log.
- A reports dashboard (enrolment, attendance, exam performance, fee collection)
  with a PDF export.

**Teacher**
- Mark the daily register for their classes.
- Create exams and enter marks for the subjects they are assigned to teach.
- See their own weekly timetable across every class.
- Post an announcement to a class they teach.

**Parent** (mobile first, with a child switcher)
- See each child's attendance summary and history, published report cards (with
  PDF download), fee invoices and installment schedule.
- Pay fees through the simulated mobile money gateway and download a receipt.
- Read school announcements and the messages the school has sent.

**Student** (light view)
- Own timetable, published report cards and attendance.

## Grading

Per subject: `percentage = score / maxMarks * 100`, then a letter: 90+ A, 80+ B,
70+ C, 60+ D, below 60 F. The term result is the average across subjects, an
overall grade, a division (First 60+, Second 45 to 59, Third below 45), a class
position and a teacher remark. Parents and students see a report card only after
the admin publishes it.

## Tech stack

| Layer | Tools |
| :--- | :--- |
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS v4, Framer Motion, Recharts, lucide-react, react-hot-toast, axios |
| Backend | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit, multer, imagekit, nodemailer, colors |
| PDF | jspdf + jspdf-autotable, loaded lazily (report cards, fee receipts, the reports export) |
| Database | MongoDB Atlas |
| Images | ImageKit.io |
| Deployment | Vercel (two projects) |

The portal is code split away from the public bundle: every portal screen loads
on demand, and the chart and PDF libraries only load when a screen actually
needs them.

## Repo layout

```
backend/    Express 5 + Mongoose 9 api, exported for Vercel serverless
frontend/   Vite + React 19 single page app
```

## Running locally

Backend:

```
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, and the rest
npm install
npm run data:import       # create the first admin from the ADMIN_ vars in .env
npm run dev               # http://localhost:5000
```

Frontend:

```
cd frontend
cp .env.example .env      # VITE_API_URL, default http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

Optional demo data (Somali student and parent names, classes, a term, teaching
assignments, a timetable, attendance, marks, report cards, fee structures with
invoices and payments, announcements):

```
cd backend
npm run demo              # additive, safe to run more than once
npm run demo:destroy      # remove only the demo data
```

Demo logins after `npm run demo`:

| Role | Login | Password |
| :--- | :--- | :--- |
| Admin | `admin@school.com` | `admin123456` |
| Teacher | `teacher1@demo.school` | `teacher123` |
| Parent | `parent1@demo.school` | `parent123` |
| Student | `D-001` | `student123` |

## Deployment (Vercel)

Two separate Vercel projects, both from this one repo, each with a different
**Root Directory**.

1. **MongoDB Atlas**: use a cluster that is reachable from Vercel. Under Network
   Access allow `0.0.0.0/0` (Vercel has no fixed egress IP on the Hobby plan).

2. **Backend project**: import the repo, set Root Directory to `backend`. The
   `backend/vercel.json` builds `server.js` and sends every request to it;
   `server.js` calls `listen()` only for local dev. Add these environment
   variables (values from `backend/.env.example`):
   `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `IMAGEKIT_URL_ENDPOINT`,
   `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `EMAIL_HOST`, `EMAIL_PORT`,
   `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `EVC_DEMO_PIN`. Leave `FRONTEND_URL`
   for step 4. Deploy, then note the URL, for example
   `https://your-backend.vercel.app`. Check `…/health` returns `{ "status": "ok" }`.

3. **Frontend project**: import the same repo again, set Root Directory to
   `frontend`. Vercel detects Vite. Set `VITE_API_URL` to the backend URL plus
   `/api` (for example `https://your-backend.vercel.app/api`). Deploy, then note
   the URL, for example `https://your-school.vercel.app`. `frontend/vercel.json`
   sends unknown paths to `index.html` so deep links survive a refresh.

4. **Close the loop**: back in the backend project, set `FRONTEND_URL` to the
   frontend URL (no trailing slash) and redeploy. CORS only allows that origin.

5. **First admin**: the app has no public sign up. Run the seeder once against the
   production database from your machine:
   `cd backend`, put the production `MONGODB_URI` and the `ADMIN_*` values in
   `backend/.env`, then `npm run data:import`. Log in with `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` and change the password.

Notes: the in-memory rate limiter and the 30s Mongo selection timeout are tuned
for a long-lived server; on serverless they still work but a cold start that also
has to connect to Atlas can be slow the first time.

## API surface

Mounted under `/api`: `auth`, `users`, `students`, `classes`, `subjects`,
`staff`, `assignments`, `terms`, `attendance`, `notifications`, `exams`,
`marks`, `report-cards`, `fee-structures`, `invoices`, `timetable`,
`announcements`, `applications`, `contact`, `settings`, `reports`. The website
reads `GET /api/settings` and `GET /api/announcements/public` and posts to
`/api/applications` and `/api/contact` without a token.

## Simulated parts

Two things are simulated on purpose, so the app can be demoed without real
accounts or a paid gateway:

- **Mobile money (EVC Plus / Zaad):** a fake gateway. A valid Somali mobile
  number plus the demo PIN `1234` approves a payment, anything else fails. No real
  money moves. A production build would integrate the Hormuud WAAFI merchant API.
- **SMS / WhatsApp notifications:** written to the database and shown in an admin
  message log, and optionally emailed. Nothing is really sent to a phone.

Everything else (enrolment, attendance, grading, invoicing, installment logic,
the timetable, applications, role access) is real application logic against
MongoDB.
