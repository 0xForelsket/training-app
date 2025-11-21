-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "SkillRevision_createdById_idx" ON "SkillRevision"("createdById");

-- CreateIndex
CREATE INDEX "TrainingAssignment_assignedById_idx" ON "TrainingAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "TrainingAssignment_dueDate_idx" ON "TrainingAssignment"("dueDate");

-- CreateIndex
CREATE INDEX "TrainingRecord_validatorId_idx" ON "TrainingRecord"("validatorId");

-- CreateIndex
CREATE INDEX "TrainingRecord_skillRevisionId_idx" ON "TrainingRecord"("skillRevisionId");
