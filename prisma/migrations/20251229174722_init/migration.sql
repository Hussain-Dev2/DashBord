-- CreateEnum
CREATE TYPE "Status" AS ENUM ('LEAD', 'PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "logoUrl" TEXT,
    "projectUrl" TEXT,
    "repoUrl" TEXT,
    "phone" TEXT,
    "status" "Status" NOT NULL DEFAULT 'LEAD',
    "priceQuoted" DECIMAL(65,30) DEFAULT 0,
    "amountPaid" DECIMAL(65,30) DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
