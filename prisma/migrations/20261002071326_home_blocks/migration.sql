-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionType" ADD VALUE 'REVIEWS';
ALTER TYPE "SectionType" ADD VALUE 'PRICES';

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorNoteKk" TEXT,
    "authorNoteRu" TEXT,
    "textKk" TEXT NOT NULL,
    "textRu" TEXT NOT NULL,
    "rating" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nameKk" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "priceKzt" INTEGER NOT NULL,
    "periodKk" TEXT,
    "periodRu" TEXT,
    "featuresKk" TEXT,
    "featuresRu" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PricePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_tenantId_position_idx" ON "Review"("tenantId", "position");

-- CreateIndex
CREATE INDEX "PricePlan_tenantId_position_idx" ON "PricePlan"("tenantId", "position");

-- CreateIndex
CREATE INDEX "RoutineItem_tenantId_position_idx" ON "RoutineItem"("tenantId", "position");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricePlan" ADD CONSTRAINT "PricePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
