# School Management System

A web app for Somali private schools and madrasas that currently run on paper.
It has two parts:

1. A **public school website** anyone can visit (Home, About, Academics, Admissions, News, Contact).
2. A **portal** behind login, with a dashboard per role: Admin, Teacher, Parent, Student.

Built by Abdalle Hussein as a portfolio project. MERN stack, deployed on Vercel
as two projects (frontend and a serverless backend).

## Accounts and login

There is no public sign up. The admin creates every account (teachers, parents,
students) and sets the password. On first login the user is asked to change it
once. Teachers and parents log in with their email, students log in with their
admission number. Forgot and reset password by email still work for accounts
that have an email.

## Modules

Students and enrolment, classes and sections, subjects, staff and teaching
assignments, the three-term year, daily attendance, exams and computed report
cards, term fees with installment plans ("qaybo"), weekly timetable,
announcements and notifications, admission applications from the public site,
a contact form, school settings, and reporting endpoints.

## Tech stack

| Layer | Tools |
| :--- | :--- |
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS v4, Framer Motion, Recharts, lucide-react, react-hot-toast |
| Backend | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, helmet, cors, express-rate-limit, multer, imagekit, nodemailer, colors |
| PDF | jspdf + jspdf-autotable (report cards and fee receipts) |
| Database | MongoDB Atlas |
| Images | ImageKit.io |
| Deployment | Vercel |

## Repo layout

```
backend/    Express 5 + Mongoose 9 api, exported for Vercel serverless
frontend/   Vite + React 19 single page app
```

## Running locally

Backend:

```
cd backend
cp .env.example .env    # then fill in the values
npm install
npm run data:import     # create the first admin from the ADMIN_ vars in .env
npm run dev             # http://localhost:5000
```

Optional demo data (Somali names, classes, a term, attendance, marks, invoices):

```
npm run demo            # additive, safe to run more than once
npm run demo:destroy    # remove only the demo data
```

Frontend:

```
cd frontend
npm install
npm run dev             # http://localhost:5173
```

## API surface

Mounted under `/api`: `auth`, `users`, `students`, `classes`, `subjects`,
`staff`, `assignments`, `terms`, `attendance`, `notifications`, `exams`,
`marks`, `report-cards`, `fee-structures`, `invoices`, `timetable`,
`announcements`, `applications`, `contact`, `settings`, `reports`. The website
reads `GET /api/settings`, `GET /api/announcements/public` and posts to
`/api/applications` and `/api/contact` without a token.

Report card and fee receipt PDFs are generated server side with jspdf, loaded
lazily inside those handlers.

## Simulated parts

Two things are simulated on purpose, so the app can be demoed without real
accounts or a paid gateway:

- **Mobile money (EVC Plus / Zaad):** a fake gateway. A valid Somali mobile
  number plus the demo PIN `1234` approves a payment, anything else fails. No real
  money moves. A production build would integrate the Hormuud WAAFI merchant API.
- **SMS / WhatsApp notifications:** written to the database and shown in an admin
  message log, and optionally emailed. Nothing is really sent to a phone.

Everything else (enrolment, attendance, grading, invoicing, installment logic,
timetable, applications, role access) is real application logic against MongoDB.
