-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "usefulLinksPlace" TEXT NOT NULL DEFAULT 'home';

-- CreateTable
CREATE TABLE "UsefulLink" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "catalogKey" TEXT,
    "titleKk" TEXT,
    "titleRu" TEXT,
    "noteKk" TEXT,
    "noteRu" TEXT,
    "url" TEXT,
    "mediaId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsefulLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsefulLink_tenantId_position_idx" ON "UsefulLink"("tenantId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "UsefulLink_tenantId_catalogKey_key" ON "UsefulLink"("tenantId", "catalogKey");

-- AddForeignKey
ALTER TABLE "UsefulLink" ADD CONSTRAINT "UsefulLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsefulLink" ADD CONSTRAINT "UsefulLink_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

