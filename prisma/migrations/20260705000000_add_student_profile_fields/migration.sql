-- AlterTable
ALTER TABLE "Student" ADD COLUMN "dateOfBirth"    TIMESTAMP(3);
ALTER TABLE "Student" ADD COLUMN "email"           TEXT;
ALTER TABLE "Student" ADD COLUMN "faculty"         TEXT;
ALTER TABLE "Student" ADD COLUMN "graduationYear"  INTEGER;
ALTER TABLE "Student" ADD COLUMN "universityName"  TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
