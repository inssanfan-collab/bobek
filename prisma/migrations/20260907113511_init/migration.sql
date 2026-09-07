-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TenantKind" AS ENUM ('NURSERY_GARDEN', 'KINDERGARTEN', 'MINI_CENTER', 'PRIVATE', 'FAMILY');

-- CreateEnum
CREATE TYPE "DomainType" AS ENUM ('SUBDOMAIN', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CertStatus" AS ENUM ('PENDING', 'DNS_OK', 'ACTIVE', 'FAILED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'TENANT_ADMIN', 'TENANT_EDITOR');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('PAGE', 'NEWS', 'ANNOUNCEMENT', 'GALLERY', 'DOCUMENTS', 'STAFF', 'GROUPS', 'MENU_FOOD', 'VACANCIES', 'TRUSTEE_BOARD', 'ANTICORRUPTION', 'FEEDBACK', 'CONTACTS');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('CHARTER', 'LICENSE', 'ORDERS', 'RULES', 'PROCUREMENT', 'REPORTS', 'TRUSTEE', 'ANTICORRUPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'ANSWERED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'DRAFT',
    "templateCode" TEXT NOT NULL DEFAULT 'klassik',
    "palette" TEXT NOT NULL DEFAULT 'mandarin',
    "theme" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantProfile" (
    "tenantId" TEXT NOT NULL,
    "nameKk" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "shortNameKk" TEXT,
    "shortNameRu" TEXT,
    "kind" "TenantKind" NOT NULL DEFAULT 'NURSERY_GARDEN',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "bin" TEXT,
    "licenseNo" TEXT,
    "addressKk" TEXT,
    "addressRu" TEXT,
    "district" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "phoneExtra" TEXT,
    "email" TEXT,
    "workHours" TEXT,
    "headNameKk" TEXT,
    "headNameRu" TEXT,
    "groupsCount" INTEGER,
    "placesTotal" INTEGER,
    "placesFree" INTEGER DEFAULT 0,
    "langKk" BOOLEAN NOT NULL DEFAULT true,
    "langRu" BOOLEAN NOT NULL DEFAULT true,
    "aboutKk" TEXT,
    "aboutRu" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "logoMediaId" TEXT,
    "coverMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantProfile_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "DomainType" NOT NULL DEFAULT 'SUBDOMAIN',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "certStatus" "CertStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "code" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKk" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT,
    "palette" TEXT NOT NULL DEFAULT 'mandarin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TENANT_ADMIN',
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "slug" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "excerptKk" TEXT,
    "excerptRu" TEXT,
    "bodyKk" TEXT,
    "bodyRu" TEXT,
    "coverMediaId" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "bodyKk" TEXT,
    "bodyRu" TEXT,
    "seoTitleKk" TEXT,
    "seoTitleRu" TEXT,
    "seoDescKk" TEXT,
    "seoDescRu" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "origName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "sha256" TEXT NOT NULL,
    "altKk" TEXT,
    "altRu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "descKk" TEXT,
    "descRu" TEXT,
    "takenOn" TIMESTAMP(3),
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumItem" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AlbumItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL DEFAULT 'OTHER',
    "mediaId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "positionKk" TEXT NOT NULL,
    "positionRu" TEXT NOT NULL,
    "educationKk" TEXT,
    "educationRu" TEXT,
    "experience" TEXT,
    "categoryName" TEXT,
    "photoMediaId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nameKk" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "ageFrom" INTEGER,
    "ageTo" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'kk',
    "teachers" TEXT,
    "placesTotal" INTEGER,
    "placesFree" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuDay" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "breakfastKk" TEXT,
    "breakfastRu" TEXT,
    "lunchKk" TEXT,
    "lunchRu" TEXT,
    "snackKk" TEXT,
    "snackRu" TEXT,
    "dinnerKk" TEXT,
    "dinnerRu" TEXT,
    "scanMediaId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackMessage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 20000,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'kaspi',
    "invoiceNo" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userLogin" TEXT,
    "tenantId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "gardenName" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "comment" TEXT,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "excerptKk" TEXT,
    "excerptRu" TEXT,
    "bodyKk" TEXT,
    "bodyRu" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "TenantProfile_district_idx" ON "TenantProfile"("district");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_host_key" ON "Domain"("host");

-- CreateIndex
CREATE INDEX "Domain_tenantId_idx" ON "Domain"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Section_tenantId_position_idx" ON "Section"("tenantId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Section_tenantId_slug_key" ON "Section"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Post_tenantId_status_publishedAt_idx" ON "Post"("tenantId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Post_sectionId_publishedAt_idx" ON "Post"("sectionId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_tenantId_slug_key" ON "Post"("tenantId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_sectionId_key" ON "Page"("sectionId");

-- CreateIndex
CREATE INDEX "Page_tenantId_idx" ON "Page"("tenantId");

-- CreateIndex
CREATE INDEX "Media_tenantId_createdAt_idx" ON "Media"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Media_tenantId_sha256_key" ON "Media"("tenantId", "sha256");

-- CreateIndex
CREATE INDEX "Album_tenantId_position_idx" ON "Album"("tenantId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Album_tenantId_slug_key" ON "Album"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "AlbumItem_albumId_position_idx" ON "AlbumItem"("albumId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumItem_albumId_mediaId_key" ON "AlbumItem"("albumId", "mediaId");

-- CreateIndex
CREATE INDEX "Document_tenantId_category_position_idx" ON "Document"("tenantId", "category", "position");

-- CreateIndex
CREATE INDEX "StaffMember_tenantId_position_idx" ON "StaffMember"("tenantId", "position");

-- CreateIndex
CREATE INDEX "Group_tenantId_position_idx" ON "Group"("tenantId", "position");

-- CreateIndex
CREATE INDEX "MenuDay_tenantId_date_idx" ON "MenuDay"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MenuDay_tenantId_date_key" ON "MenuDay"("tenantId", "date");

-- CreateIndex
CREATE INDEX "FeedbackMessage_tenantId_status_createdAt_idx" ON "FeedbackMessage"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_periodEnd_idx" ON "Subscription"("tenantId", "periodEnd");

-- CreateIndex
CREATE INDEX "Payment_tenantId_paidAt_idx" ON "Payment"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_isHandled_createdAt_idx" ON "Lead"("isHandled", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalPost_slug_key" ON "PortalPost"("slug");

-- CreateIndex
CREATE INDEX "PortalPost_status_publishedAt_idx" ON "PortalPost"("status", "publishedAt");

-- AddForeignKey
ALTER TABLE "TenantProfile" ADD CONSTRAINT "TenantProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumItem" ADD CONSTRAINT "AlbumItem_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumItem" ADD CONSTRAINT "AlbumItem_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuDay" ADD CONSTRAINT "MenuDay_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMessage" ADD CONSTRAINT "FeedbackMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
