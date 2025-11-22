# Training App Product Requirements Document (PRD)

## 1. Overview
- **Problem**: Track workforce training readiness, skill validations, and document control with clear auditability.
- **Solution**: A web app that manages employees, skills/work instructions, assignments, validations, and coverage reporting, with role-based controls for HR, DCC, Trainers, and Admins.
- **Primary identifiers**: `employeeNumber` (primary key for employees) and `code` (primary key for skills). Synthetic IDs are removed for these entities.

## 2. Goals & Success
- Accurate, up-to-date record of employee readiness per skill/revision.
- Clear ownership separation: HR manages employees; DCC manages skills/revisions; Trainers validate training; Admins oversee all.
- Fast access to coverage gaps (matrix) and upcoming recertifications.
- Auditability of all critical actions (create/update/delete user, employee, skill, assignment, validation).

### Non-goals
- External LMS integration.
- Granular scheduling/calendar.
- Automated notification delivery (email/SMS) beyond the existing “remind” action.

## 3. Personas
- **Admin**: Full control over users, permissions, and all records.
- **Trainer**: Validates skills, assigns training, adds notes, can view coverage.
- **HR**: Creates/edits employees only (not skills).
- **DCC**: Creates/edits/deletes skills and publishes revisions; cannot manage employees.
- **Viewer**: Read-only access to dashboards and lists.

## 4. Roles & Permissions
- **Admin**: CRUD on users, employees, skills, revisions, assignments, validations, uploads, notes; can delete skills; view/audit all.
- **Trainer**: Create/update training assignments; validate training; add notes; send reminders; cannot manage users.
- **HR**: Create employees; basic edits to employee profile; read skill/assignment/validation.
- **DCC**: Create/edit/delete skills; publish revisions; no employee CRUD.
- **Viewer**: Read-only across dashboards, employees, skills, matrix.

## 5. Domain Model (keys & relationships)
- **Employee** (`employeeNumber` PK, name, department?, shift, dateHired, photoUrl?, timestamps)
  - `trainings` → TrainingRecord (FK: employeeId -> employeeNumber)
  - `assignments` → TrainingAssignment (FK: employeeId -> employeeNumber)
  - `notes` → EmployeeNote (FK: employeeId -> employeeNumber)
- **Skill** (`code` PK, name, project?, description?, validityMonths?, recertReminderDays?, currentRevisionId?, currentRevisionNumber, documentUrl?, timestamps)
  - `revisions` → SkillRevision (FK: skillId -> code)
  - `trainings` → TrainingRecord (FK: skillId -> code)
  - `assignments` → TrainingAssignment (FK: skillId -> code)
- **TrainingRecord** (PK: cuid, FK: employeeId->employeeNumber, skillId->code, skillRevisionId?, validatorId->User)
  - `level` (1–4), `validatorNotes?`, `evidenceUrl?`, `dateValidated`, `@@unique(employeeId, skillId)`
- **TrainingAssignment** (PK: cuid, FK: employeeId->employeeNumber, skillId->code, assignedById->User)
  - `targetLevel`, `dueDate`, `status` (PENDING/IN_PROGRESS/COMPLETED), `notes?`, `lastReminderSentAt?`
- **SkillRevision** (PK: cuid, FK: skillId->code)
  - `revisionNumber` (unique per skill), `name/description?`, `documentUrl?`, `validityMonths?`, `recertReminderDays?`, `createdById?`
- **EmployeeNote** (PK: cuid, FK: employeeId->employeeNumber, authorId->User)
- **User** (PK: cuid, username unique, password hash, role)
- **AuditLog**, **UploadLog**: track actions/imports.

## 6. Functional Requirements
### 6.1 Authentication & Authorization
- Username/password login; session includes `user.role` and `user.id`.
- Route guards enforce role permissions (see Section 4).

### 6.2 Employees (HR/Admin)
- Create/edit employee with required `employeeNumber`, name, shift, dateHired; optional department, photo.
- Employee detail page shows profile, assignments, trainings, notes, recert alerts.
- License view with QR linking to employee profile.
- Notes: Trainers/Admin can add notes.
- Listing with filters: search (name/#), department, shift; skeleton loading.

### 6.3 Skills & Revisions (DCC/Admin)
- Create/edit/delete skills with `code`, name, project?, description?, validity/recert windows, document upload.
- Publish revisions: increment revisionNumber, optionally new document; update currentRevisionId/Number.
- Skill list with filters: search (code/name), project, shift coverage; skeleton loading.

### 6.4 Training Assignments (Trainer/Admin)
- Create assignments (employeeNumber + skill code), set target level, due date, notes.
- Status flow: PENDING → IN_PROGRESS → COMPLETED; shows overdue based on dueDate.
- Remind action updates `lastReminderSentAt`.

### 6.5 Training Validation (Trainer)
- Validate skill for employee; set level (1–4), optional validator notes, evidence upload; records validatorId and revision.
- Upsert behavior: unique per employee+skill; updates existing record if present.

### 6.6 Coverage & Reporting
- Dashboard stats: employee count, skill count, training count, trainer count; recent activity; upcoming recerts.
- Skill Matrix: employees x skills grid, filtered by query/department/shift; indicates level and coverage target.
- Exports:
  - Employee training CSV: by employeeNumber.
  - Matrix CSV export with levels per employee/skill code.
- Upcoming recertifications list (based on validityMonths/recertReminderDays and revision mismatch).

### 6.7 Uploads
- Bulk import employees (HR/Admin) and skills (DCC/Admin) via CSV templates in `public/templates`.
- UploadLog records success/failure counts and sample row results.

### 6.8 Auditability
- AuditLog entries for key actions: create/update/delete user, employee, skill, revision, assignment, validation, note, uploads.
- Each entry captures action, entityType, entityId, userId, timestamp, and details string.

## 7. UX & UI
- **Branding**: `/public/logo.png` in header and login.
- **Navigation**: Top bar with role-aware links (Admin sees Admin link, etc.).
- **Skeletons**: Dashboard, employees list, skills list.
- **Lists/Tables**: Sticky headers where helpful (matrix), inline status badges, pills for shifts.
- **Empty states**: Provide guidance for zero results on lists and matrix.
- **Responsive**: Mobile-friendly forms and tables with horizontal scroll as needed.
- **Assets**: Use `next/image` where possible; employee cards fallback to initials if no photo.

## 8. Data & Defaults
- DB: SQLite (dev); migrations tracked under `prisma/migrations`.
- Primary keys: `Employee.employeeNumber`, `Skill.code`.
- Seed users (password `password123`): admin (ADMIN), trainer (TRAINER), hr (HR), dcc (DCC).
- Shifts: enum DAY/NIGHT.
- Assignment status: PENDING/IN_PROGRESS/COMPLETED.

## 9. Non-Functional Requirements
- **Performance**: Lists and matrix should render with server-side data fetching; pagination not yet required but queries must be scoped with filters.
- **Reliability**: Basic error handling for DB operations; log and display user-friendly messages.
- **Security**: Role-based access checks on server actions/routes; protect uploads directory paths; hash passwords (bcrypt).
- **Accessibility**: Form labels, focus states, sufficient contrast; keyboard navigable dialogs.

## 10. Edge Cases & Error States
- Duplicate identifiers: reject duplicate `employeeNumber` or `code`; surface validation errors.
- Missing documents/revisions: allow skills without documents; recertification skips if no validityMonths.
- Evidence/Document upload failures: proceed without file if save fails (log error).
- Revision mismatch: recert status = OVERDUE if training revision != currentRevisionId.

## 11. Open Questions
- Should reminders trigger notifications (email/Slack) or remain manual status updates?
- Do HR/DCC need read-only access to each other’s domains, or strictly scoped UI?
- Should Viewer access include dashboard stats or be limited to lists only?
- Any retention policy for AuditLog/UploadLog?

## 12. Acceptance Criteria (high level)
- Users can log in and see role-appropriate nav.
- HR/Admin can create/edit employees by `employeeNumber`; Trainer/Admin can validate training; DCC/Admin can manage skills/revisions.
- Skill and employee links use codes/employeeNumbers everywhere (no synthetic ID usage).
- Matrix and exports reflect new identifiers and coverage data.
- Seeded users exist after setup: admin, trainer, hr, dcc.
