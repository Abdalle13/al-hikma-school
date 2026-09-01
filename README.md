# School Management System

A web app for Somali private schools and madrasas that currently run on paper.
It has two parts:

1. A **public school website** anyone can visit (Home, About, Academics, Admissions, News, Contact).
2. A **portal** behind login, with a dashboard per role: Admin, Teacher, Parent, Student.

Built by Abdalle Hussein as a portfolio project. MERN stack, deployed on Vercel
as two projects (frontend and a serverless backend).

## Modules

Students and enrolment, classes and sections, subjects, staff, three-term year,
daily attendance, exams and computed report cards, term fees with installment
plans ("qaybo"), weekly timetable, announcements and notifications, admission
applications from the public site, and a reports dashboard.

## Tech stack

| Layer | Tools |
| :--- | :--- |
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS v4, Framer Motion, Recharts, lucide-react, react-hot-toast |
| Backend | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, helmet, express-rate-limit, multer, imagekit, nodemailer |
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
npm run dev             # http://localhost:5000
```

Frontend:

```
cd frontend
npm install
npm run dev             # http://localhost:5173
```

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
