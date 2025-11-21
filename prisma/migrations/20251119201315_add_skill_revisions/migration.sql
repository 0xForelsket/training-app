-- CreateTable
CREATE TABLE "SkillRevision" (
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
    CONSTRAINT "SkillRevision_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SkillRevision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
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
INSERT INTO "new_Skill" ("code", "createdAt", "description", "documentUrl", "id", "name", "project", "recertReminderDays", "updatedAt", "validityMonths") SELECT "code", "createdAt", "description", "documentUrl", "id", "name", "project", "recertReminderDays", "updatedAt", "validityMonths" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE UNIQUE INDEX "Skill_code_key" ON "Skill"("code");
CREATE UNIQUE INDEX "Skill_currentRevisionId_key" ON "Skill"("currentRevisionId");
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
    CONSTRAINT "TrainingRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_skillRevisionId_fkey" FOREIGN KEY ("skillRevisionId") REFERENCES "SkillRevision" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRecord_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TrainingRecord" ("dateValidated", "employeeId", "evidenceUrl", "id", "level", "skillId", "validatorId", "validatorNotes") SELECT "dateValidated", "employeeId", "evidenceUrl", "id", "level", "skillId", "validatorId", "validatorNotes" FROM "TrainingRecord";
DROP TABLE "TrainingRecord";
ALTER TABLE "new_TrainingRecord" RENAME TO "TrainingRecord";
CREATE UNIQUE INDEX "TrainingRecord_employeeId_skillId_key" ON "TrainingRecord"("employeeId", "skillId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SkillRevision_skillId_revisionNumber_key" ON "SkillRevision"("skillId", "revisionNumber");

-- Seed initial revisions for existing skills and align training records
INSERT INTO "SkillRevision" (
    "id",
    "skillId",
    "revisionNumber",
    "name",
    "description",
    "documentUrl",
    "validityMonths",
    "recertReminderDays",
    "effectiveDate",
    "createdAt"
)
SELECT
    "id" || '_rev1',
    "id",
    1,
    "name",
    "description",
    "documentUrl",
    "validityMonths",
    "recertReminderDays",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Skill";

UPDATE "Skill"
SET "currentRevisionId" = "id" || '_rev1',
    "currentRevisionNumber" = 1
WHERE "currentRevisionId" IS NULL;

UPDATE "TrainingRecord"
SET "skillRevisionId" = (
    SELECT "id" || '_rev1'
    FROM "Skill" s
    WHERE s."id" = "TrainingRecord"."skillId"
);
