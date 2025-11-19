-- AlterTable
ALTER TABLE "Skill" ADD COLUMN "project" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "shift" TEXT NOT NULL DEFAULT 'DAY',
    "dateHired" DATETIME NOT NULL,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("createdAt", "dateHired", "department", "employeeNumber", "id", "name", "photoUrl", "updatedAt") SELECT "createdAt", "dateHired", "department", "employeeNumber", "id", "name", "photoUrl", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
