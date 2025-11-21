-- CreateTable
CREATE TABLE "UploadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "successCount" INTEGER NOT NULL,
    "failureCount" INTEGER NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "UploadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UploadLog_type_idx" ON "UploadLog"("type");

-- CreateIndex
CREATE INDEX "UploadLog_createdAt_idx" ON "UploadLog"("createdAt");
