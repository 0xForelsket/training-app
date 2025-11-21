/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Employee` table. All the data in the column will be lost.
  - The primary key for the `Skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Skill` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "employeeNumber" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "shift" TEXT NOT NULL DEFAULT 'DAY',
    "dateHired" DATETIME NOT NULL,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("createdAt", "dateHired", "department", "employeeNumber", "name", "photoUrl", "shift", "updatedAt") SELECT "createdAt", "dateHired", "department", "employeeNumber", "name", "photoUrl", "shift", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_EmployeeNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeeNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EmployeeNote" ("authorId", "content", "createdAt", "employeeId", "id") SELECT "authorId", "content", "createdAt", "employeeId", "id" FROM "EmployeeNote";
DROP TABLE "EmployeeNote";
ALTER TABLE "new_EmployeeNote" RENAME TO "EmployeeNote";
CREATE INDEX "EmployeeNote_employeeId_idx" ON "EmployeeNote"("employeeId");
CREATE INDEX "EmployeeNote_createdAt_idx" ON "EmployeeNote"("createdAt");
CREATE TABLE "new_Skill" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "project" TEXT,
    "description" TEXT,
    "documentUrl" TEXT,
    "validityMonths" INTEGER,
    "recertReminderDays" INTEGER,
    "currentRevisionId" TEXT,
    "currentRevisionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Skill_currentRevisionId_fkey" FOREIGN KEY ("currentRevisionId") REFERENCES "SkillRevision" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("code", "createdAt", "currentRevisionId", "currentRevisionNumber", "description", "documentUrl", "name", "project", "recertReminderDays", "updatedAt", "validityMonths") SELECT "code", "createdAt", "currentRevisionId", "currentRevisionNumber", "description", "documentUrl", "name", "project", "recertReminderDays", "updatedAt", "validityMonths" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE UNIQUE INDEX "Skill_currentRevisionId_key" ON "Skill"("currentRevisionId");
CREATE TABLE "new_SkillRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentUrl" TEXT,
    "validityMonths" INTEGER,
    "recertReminderDays" INTEGER,
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "SkillRevision_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SkillRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SkillRevision" ("createdAt", "createdById", "description", "documentUrl", "effectiveDate", "id", "name", "recertReminderDays", "revisionNumber", "skillId", "validityMonths") SELECT "createdAt", "createdById", "description", "documentUrl", "effectiveDate", "id", "name", "recertReminderDays", "revisionNumber", "skillId", "validityMonths" FROM "SkillRevision";
DROP TABLE "SkillRevision";
ALTER TABLE "new_SkillRevision" RENAME TO "SkillRevision";
CREATE UNIQUE INDEX "SkillRevision_skillId_revisionNumber_key" ON "SkillRevision"("skillId", "revisionNumber");
CREATE TABLE "new_TrainingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "assignedById" TEXT,
    "targetLevel" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "lastReminderSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TrainingAssignment" ("assignedById", "createdAt", "dueDate", "employeeId", "id", "lastReminderSentAt", "notes", "skillId", "status", "targetLevel", "updatedAt") SELECT "assignedById", "createdAt", "dueDate", "employeeId", "id", "lastReminderSentAt", "notes", "skillId", "status", "targetLevel", "updatedAt" FROM "TrainingAssignment";
DROP TABLE "TrainingAssignment";
ALTER TABLE "new_TrainingAssignment" RENAME TO "TrainingAssignment";
CREATE INDEX "TrainingAssignment_employeeId_idx" ON "TrainingAssignment"("employeeId");
CREATE INDEX "TrainingAssignment_skillId_idx" ON "TrainingAssignment"("skillId");
CREATE TABLE "new_TrainingRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "skillRevisionId" TEXT,
    "validatorId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "dateValidated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatorNotes" TEXT,
    "evidenceUrl" TEXT,
    CONSTRAINT "TrainingRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("employeeNumber") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_skillRevisionId_fkey" FOREIGN KEY ("skillRevisionId") REFERENCES "SkillRevision" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TrainingRecord" ("dateValidated", "employeeId", "evidenceUrl", "id", "level", "skillId", "skillRevisionId", "validatorId", "validatorNotes") SELECT "dateValidated", "employeeId", "evidenceUrl", "id", "level", "skillId", "skillRevisionId", "validatorId", "validatorNotes" FROM "TrainingRecord";
DROP TABLE "TrainingRecord";
ALTER TABLE "new_TrainingRecord" RENAME TO "TrainingRecord";
CREATE UNIQUE INDEX "TrainingRecord_employeeId_skillId_key" ON "TrainingRecord"("employeeId", "skillId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
