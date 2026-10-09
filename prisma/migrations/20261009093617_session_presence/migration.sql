-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "lastPath" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Session_lastSeenAt_idx" ON "Session"("lastSeenAt");
