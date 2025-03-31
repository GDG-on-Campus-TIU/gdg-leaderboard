/*
  Warnings:

  - A unique constraint covering the columns `[empId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clgId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empId` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clgId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "empId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "clgId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_empId_key" ON "Admin"("empId");

-- CreateIndex
CREATE INDEX "admin_empId_index" ON "Admin"("empId");

-- CreateIndex
CREATE INDEX "admin_email_index" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_key" ON "Score"("studentId");

-- CreateIndex
CREATE INDEX "score_studentId_index" ON "Score"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_clgId_key" ON "Student"("clgId");

-- CreateIndex
CREATE INDEX "student_clgId_index" ON "Student"("clgId");

-- CreateIndex
CREATE INDEX "email_index" ON "Student"("email");
