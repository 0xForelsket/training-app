# Training App

A Next.js app for managing workforce training: employees, skills/work instructions, assignments, validations, and auditability. Primary identifiers are natural keys: `employeeNumber` for employees and `code` for skills.

## Roles
- **ADMIN**: Full access (users, employees, skills, revisions, assignments, validations, uploads, notes).
-, **TRAINER**: Validate training, assign training, add notes, send reminders.
- **HR**: Create/edit employees only.
- **DCC**: Manage skills and revisions (no employee CRUD).
- **VIEWER**: Read-only.

## Setup
1. Install deps: `npm install`
2. DB reset & migrate: `npx prisma migrate reset --force --skip-seed && npx prisma migrate dev --skip-seed`
3. Seed users: `npx prisma db seed`  
   - Users (password `password123`): `admin` (ADMIN), `trainer` (TRAINER), `hr` (HR), `dcc` (DCC)
4. Run dev server: `npm run dev` (http://localhost:3000)

## Key Features
- Natural keys: `employeeNumber` and `code` (no synthetic IDs for these entities).
- Skills & revisions: create skills, publish revisions, maintain current revision pointer.
- Training validation: level 1–4, notes, evidence upload, revision tracking.
- Assignments: target level, due date, status, reminders.
- Coverage: dashboard stats, skill matrix, upcoming recerts, CSV exports.
- Uploads: bulk employee/skill import with logs.
- Audit trail: key actions logged (create/update/delete on users, employees, skills, revisions, assignments, validations, notes, uploads).
- Skeletons: dashboard, employees list, skills list.
- Mobile validation: trainer-only “Validate (Mobile)” page for on-the-floor validation with quick level selection and evidence upload.
- Branding: `/public/logo.png` in header/login; QR on employee license points to `/dashboard/employees/{employeeNumber}`.

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Prisma studio (optional): `npx prisma studio`

## File Map (high level)
- `src/app/dashboard/*`: app pages (employees, skills, matrix, admin, mobile validation)
- `src/app/api/*`: API routes (matrix export, employee training CSV)
- `src/app/lib/actions.ts`: server actions (auth, CRUD, validations, assignments, uploads)
- `src/app/lib/data.ts`: data fetchers (employees, skills, matrix, recerts)
- `prisma/schema.prisma`: schema (natural keys), `prisma/seed.ts`: seeds users
- `prd.md`: detailed product requirements

## Notes
- Network installs may be blocked in some environments; vendored deps live in `node_modules` after `npm install`.
- Lint is clean as of last run; TS strictness partially enforced via schemas and explicit typing where practical.
