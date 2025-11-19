# Training App Enhancements

The list below prioritizes the most impactful features and quality-of-life improvements identified during the review. Each item includes what should be built and why it matters.

## High Priority

1. **Training Assignments & Planning**  
   - Build a `TrainingAssignment` model so supervisors can assign future skills, target levels, and due dates per employee.  
   - Extend `src/app/dashboard/employees/[id]/page.tsx` with an “Assignments” section showing status chips (Pending, In Progress, Overdue) plus quick actions to remind trainers.  
   - Benefits: Turns the profile into a proactive planning tool and highlights gaps before audits.

lets 

3. **Recertification & Expiry Tracking**  
   - Add recurrence metadata to `Skill` (e.g., validity in months, reminder lead time).  
   - Show upcoming expirations and overdue recertifications on the main dashboard and employee view, with notifier hooks for email or in-app alerts.  
   - Benefits: Ensures compliance-sensitive skills stay current without manual spreadsheets.

4. **Skill Matrix Analytics & Filters**  
   - Enhance `src/app/dashboard/matrix/page.tsx` with department/shift filters, minimum coverage indicators, export-to-CSV/print, and heat map styling for quick scanning.  
   - Benefits: Gives operational leaders immediate insight into staffing readiness and simplifies sharing reports.

## Medium Priority

5. **Audit Log Drill-Down & Search**  
   - Add filters for action type, user, and date range plus click-through links to the affected entity on `src/app/dashboard/admin/audit/page.tsx`.  
   - Include CSV/JSON export to streamline compliance reviews.  
   - Benefits: Makes investigations much faster and keeps auditors in-app.

6. **Bulk Upload Safety Improvements**  
   - Provide downloadable CSV templates, client-side schema validation, and a preview table showing parsed rows before committing.  
   - Show per-row success/failure results with actionable messages and keep an upload history log.  
   - Benefits: Reduces bad imports and gives admins confidence in large data loads.

7. **Role-Based Dashboards**  
   - Customize the main dashboard so trainers, admins, and viewers see the widgets most relevant to them (e.g., trainers get “Pending validations,” admins see “Users awaiting approval”).  
   - Benefits: Minimizes clicks and surfaces key work immediately upon login.

8. **Persisted Filters & Sharing**  
   - Keep skills/employees search query params in the URL and add saved-filter presets.  
   - Benefits: Teams can share filtered views (e.g., “assembly trainees”) and return to work quicker.

## Low Priority / Quality of Life

9. **Optimistic Feedback & Toasts**  
   - Wrap create/validate/delete actions with client toasts or inline confirmations rather than relying solely on redirects.  
   - Benefits: Improves perceived performance and keeps users informed.

10. **Loading Skeletons & Empty States**  
   - Add skeleton components to slow-loading tables (Admin Users, Skills, Matrix) and richer empty-state messaging with next steps.  
   - Benefits: Reduces user uncertainty during Prisma fetches.

11. **Improved License Card Sharing**  
   - Add “Print License” and “Copy Profile Link” quick actions right from the Employees table plus optional badge templates (e.g., horizontal/vertical).  
   - Benefits: Speeds up distribution of credentials for audits or shop-floor checks.

12. **Bulk Validation Actions**  
   - Allow trainers to select multiple employees/skills to validate in one flow when onboarding a cohort, enforcing shared evidence uploads.  
   - Benefits: Saves time for recurring training sessions and ensures consistent documentation.

These items can be tackled iteratively, starting with the top four high-impact initiatives to unlock planning, tracking, and compliance visibility, then layering in usability upgrades at each release.
