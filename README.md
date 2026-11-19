# SVCE ERP – Team Member Module

A standalone Team Member module starter with:
- React + Vite frontend
- Express + Prisma backend
- PostgreSQL database (works with Supabase PostgreSQL)
- JWT authentication and Team Member role checks
- Dashboard, Profile, My Tasks, Submit Work / Progress

The UI uses the SVCE reference theme: navy sidebar, pale blue background, white cards, cyan-to-purple gradient accents.

## Requirements
- Node.js 20+
- PostgreSQL database, local or Supabase
- npm

## 1. Backend setup
```bash
cd backend
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET in .env
npm install
npx prisma generate
npx prisma migrate dev --name init_team_member
npm run seed
npm run dev
```
Backend runs at http://localhost:5000

Demo account created by seed:
- Email: member@svce.edu
- Password: Member@123

Change the demo password and JWT secret before using this outside local development.

## 2. Frontend setup
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

## 3. Supabase PostgreSQL
Create a Supabase project, open Project Settings → Database → Connection string, and copy the PostgreSQL connection string into `backend/.env` as `DATABASE_URL`.
Use the appropriate pooled/direct connection string for your Prisma migration workflow. Keep database credentials and JWT secrets only in backend `.env`; never put them in frontend variables.

## 4. Current scope
This starter is only for the Team Member role. It includes:
- Dashboard: task counts and recent assignments
- Profile: view/update basic profile details
- My Tasks: view tasks assigned to the logged-in member
- Submit Work: submit progress percentage, status, and work notes

Team Lead task assignment and review screens are not included in this Team Member-only module. Tasks can be created through Prisma Studio or by adding the Team Lead module later.

## 5. Useful commands
```bash
cd backend
npx prisma studio
```
Open Prisma Studio to inspect users, tasks and task updates.

## Notes
- This is a development starter, not a production deployment.
- Add email verification, password reset, rate limiting, audit logging, HTTPS, secure deployment secrets and Supabase Storage policies before production.
- Task visibility is restricted to the logged-in Team Member.
