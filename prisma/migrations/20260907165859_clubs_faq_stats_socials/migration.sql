-- CreateEnum
CREATE TYPE "NoticeTone" AS ENUM ('INFO', 'WARN', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionType" ADD VALUE 'CLUBS';
ALTER TYPE "SectionType" ADD VALUE 'FAQ';

-- AlterTable
ALTER TABLE "TenantProfile" DROP COLUMN "socialLinks",
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "noticeKk" TEXT,
ADD COLUMN     "noticeRu" TEXT,
ADD COLUMN     "noticeTone" "NoticeTone" NOT NULL DEFAULT 'WARN',
ADD COLUMN     "noticeUntil" TIMESTAMP(3),
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "youtube" TEXT;

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nameKk" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "descKk" TEXT,
    "descRu" TEXT,
    "teacher" TEXT,
    "schedule" TEXT,
    "ageRange" TEXT,
    "priceKzt" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "questionKk" TEXT NOT NULL,
    "questionRu" TEXT NOT NULL,
    "answerKk" TEXT,
    "answerRu" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStat" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Club_tenantId_position_idx" ON "Club"("tenantId", "position");

-- CreateIndex
CREATE INDEX "FaqItem_tenantId_position_idx" ON "FaqItem"("tenantId", "position");

-- CreateIndex
CREATE INDEX "DailyStat_tenantId_date_idx" ON "DailyStat"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStat_tenantId_date_key" ON "DailyStat"("tenantId", "date");

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStat" ADD CONSTRAINT "DailyStat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

