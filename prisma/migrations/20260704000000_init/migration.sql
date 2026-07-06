-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PROPOSED', 'REQUESTED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "SelectionStatus" AS ENUM ('ENTRY', 'DOCUMENT', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED');

-- CreateEnum
CREATE TYPE "Aspiration" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "Ca" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "universityName" TEXT,
    "faculty" TEXT,
    "graduationYear" INTEGER,
    "caId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisionItem" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "VisionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentVisionScore" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,

    CONSTRAINT "StudentVisionScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyVisionScore" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "CompanyVisionScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoSession" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,

    CONSTRAINT "InfoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "status" "SelectionStatus" NOT NULL DEFAULT 'ENTRY',
    "aspiration" "Aspiration" NOT NULL DEFAULT 'MEDIUM',
    "nextDate" TIMESTAMP(3),
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "caId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PROPOSED',
    "chosenSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VisionItem_key_key" ON "VisionItem"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StudentVisionScore_studentId_itemId_key" ON "StudentVisionScore"("studentId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyVisionScore_companyId_itemId_key" ON "CompanyVisionScore"("companyId", "itemId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_caId_fkey" FOREIGN KEY ("caId") REFERENCES "Ca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisionScore" ADD CONSTRAINT "StudentVisionScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVisionScore" ADD CONSTRAINT "StudentVisionScore_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "VisionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVisionScore" ADD CONSTRAINT "CompanyVisionScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVisionScore" ADD CONSTRAINT "CompanyVisionScore_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "VisionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoSession" ADD CONSTRAINT "InfoSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_caId_fkey" FOREIGN KEY ("caId") REFERENCES "Ca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_chosenSessionId_fkey" FOREIGN KEY ("chosenSessionId") REFERENCES "InfoSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
