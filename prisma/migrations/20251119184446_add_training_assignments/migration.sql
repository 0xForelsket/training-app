-- CreateTable
CREATE TABLE "TrainingAssignment" (
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
    CONSTRAINT "TrainingAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TrainingAssignment_employeeId_idx" ON "TrainingAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "TrainingAssignment_skillId_idx" ON "TrainingAssignment"("skillId");
