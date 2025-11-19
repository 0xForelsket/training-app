# Repository Guidelines

## Project Structure & Module Organization
- Application code lives under `src/`, with the App Router pages in `src/app/` (dashboard routes, login, API handlers) and shared UI in `src/components/`.  
- Database schema and Prisma client config are under `prisma/`.  
- Public assets (logo, uploads) reside in `public/`.  
- Configuration files such as `next.config.ts`, `tsconfig.json`, and `eslint.config.mjs` are at the repository root.

## Build, Test, and Development Commands
- `npm run dev` – Launches the Next.js development server with hot reload on `http://localhost:3000`.  
- `npm run build` – Creates a production build (use before deployment to catch type/lint errors).  
- `npm run lint` – Runs ESLint using `eslint.config.mjs`; fix reported issues before submitting changes.  
- `npx prisma migrate dev` – Applies pending Prisma migrations to the local SQLite database.

## Coding Style & Naming Conventions
- Use TypeScript everywhere; favor explicit types for exported functions and server actions.  
- Follow the existing React/Next.js conventions: App Router server components by default, `use client` only when necessary.  
- Keep files and directories kebab-case (e.g., `skill-matrix`).  
- Re-use the Shadcn UI component patterns already established in `src/components/ui`.  
- Formatting is handled by the editor’s Prettier defaults (two-space indentation). Run ESLint for style enforcement.

## Testing Guidelines
- Rely on end-to-end/manual testing via the Next.js dev server; no dedicated automated test suite exists yet.  
- When adding logic-heavy modules, include lightweight unit tests (Vitest or Jest) under `src/` mirroring the file structure.  
- Name test files `*.test.ts` and ensure they run via `npm test` (add/update the script if you introduce tests).

## Commit & Pull Request Guidelines
- Write commits in the imperative mood (e.g., “Add training validation update logic”).  
- Keep commits scoped to one logical change; large features should be broken into reviewable pieces.  
- PRs must describe the change, include testing steps/results, and attach screenshots or terminal output for UI-impacting work.  
- Link related issues or tickets and call out any migrations or environment updates that reviewers must run.
