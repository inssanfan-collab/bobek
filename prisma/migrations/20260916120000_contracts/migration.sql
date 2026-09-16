-- Реквизиты исполнителя и договоры с садами.
--
-- Реквизиты держим в базе, а не в коде: меняются банк, адрес и подписант,
-- и править ради этого исходники неправильно. Строка всегда одна.
CREATE TABLE "PortalSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "companyNameKk" TEXT NOT NULL DEFAULT '',
    "companyNameRu" TEXT NOT NULL DEFAULT '',
    "ownerNameKk" TEXT NOT NULL DEFAULT '',
    "ownerNameRu" TEXT NOT NULL DEFAULT '',
    "taxId" TEXT NOT NULL DEFAULT '',
    "basisKk" TEXT NOT NULL DEFAULT '',
    "basisRu" TEXT NOT NULL DEFAULT '',
    "addressKk" TEXT NOT NULL DEFAULT '',
    "addressRu" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "bankNameKk" TEXT NOT NULL DEFAULT '',
    "bankNameRu" TEXT NOT NULL DEFAULT '',
    "iban" TEXT NOT NULL DEFAULT '',
    "bic" TEXT NOT NULL DEFAULT '',
    "kbe" TEXT NOT NULL DEFAULT '17',
    "taxNoteKk" TEXT NOT NULL DEFAULT '',
    "taxNoteRu" TEXT NOT NULL DEFAULT '',
    "signerNameKk" TEXT NOT NULL DEFAULT '',
    "signerNameRu" TEXT NOT NULL DEFAULT '',
    "signerTitleKk" TEXT NOT NULL DEFAULT '',
    "signerTitleRu" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalSettings_pkey" PRIMARY KEY ("id")
);

-- Договор хранится ради номера и дат: пересчитывать номер при каждой
-- печати нельзя — у сада в бухгалтерии останется первый.
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "signedAt" TIMESTAMP(3),
    "actSignedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Contract_number_key" ON "Contract"("number");
CREATE INDEX "Contract_tenantId_issuedAt_idx" ON "Contract"("tenantId", "issuedAt");

ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
