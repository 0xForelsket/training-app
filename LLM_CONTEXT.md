# Training App Reference Guide

Use this document when bringing a secondary LLM online so it has the project context required for informed responses.

## High-Level Overview
- **Stack**: Next.js (App Router), TypeScript, Prisma (SQLite), NextAuth, Shadcn UI.
- **Primary Areas**: Dashboard, Employees, Skills, Skill Matrix, Admin tools (users, uploads, skills).
- **Roles**: `ADMIN`, `TRAINER`, `HR`, `DCC`. Role checks are enforced server-side.

## Data Models
- `Employee`: shift, department, notes, assignments, trainings.
- `Skill`: recert metadata plus `currentRevisionId/currentRevisionNumber` pointing to `SkillRevision`.
- `SkillRevision`: version history (number, doc, validity) linked to `TrainingRecord`.
- `TrainingRecord`: references employee, skill, revision, validator, level.
- `TrainingAssignment`: future validation tasks (status, due date, reminders).
- `UploadLog`/`AuditLog`: audit trails for bulk uploads and actions.

## Key Features
- **Dashboard**: Stats cards, recent audit logs, Quick Actions, Upcoming Recertifications.
- **Employees**:
  - List page with filters (search/department/shift) and shift column.
  - Profile page includes badge photo, KPIs (validated skills, assignments, expiring skills), recert table, recent training activity, assignments, coaching log, CSV export, copy link, edit drawer, assignment planner.
  - Validators always attach the current skill revision to training records and reminders flag revision mismatches.
- **Skills**:
  - Public list shows project, revision, description, assigned employees.
  - Admin list shows revision, validity, reminders, SOP links, and “New Revision” action.
  - Skill creation/bulk upload automatically seeds revision 1; new revisions create retraining assignments.
- **Skill Matrix**:
  - Filters for search, department, shift, minimum level, coverage target.
  - Coverage badge summary + export-to-CSV endpoint (`/api/matrix/export`).
  - Heat map table with level color coding and highlight for cells meeting thresholds.
- **Bulk Uploads**: CSV templates in `public/templates`, preview tables, row-level results, upload history log, role-gated actions.
- **APIs**: `/api/employees/[id]/training` (CSV export), `/api/matrix/export`.

## Authorization Rules
- HR/Admin: create/update employees, bulk employee upload.
- DCC/Admin: create/delete skills, manage revisions, bulk skill import.
- Trainer: validate training, add coaching notes, send reminders.
- Admin: supersedes all, plus user management and uploads.

## File Pointers
- `src/app/lib/actions.ts`: server actions with role checks, revision logic.
- `src/app/lib/data.ts`: data fetch helpers (recert calculations, matrix data, departments, upload history).
- `src/app/dashboard/...`: feature pages (employees, skills, matrix, dashboard).
- `src/app/api/...`: CSV export endpoints.
- `prisma/schema.prisma`: source of truth for models/enums.

## Expectations for Secondary LLM
When issuing new instructions:
- Reference these roles and enforce them in any server action changes.
- Preserve recertification + revision flows (new revisions must create assignments, training records must link to revision).
- Maintain filter/search UX patterns similar to skills/employees.
- Log significant actions via `logAction` and revalidate affected paths.

Use this doc to quickly onboard the external LLM so it understands current capabilities, critical invariants (revisions, recert alerts, role-based permissions), and key files to inspect.
