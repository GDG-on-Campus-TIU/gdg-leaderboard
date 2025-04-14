/*
  Warnings:

  - Changed the type of `domain` on the `Score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('CLOUD', 'DSA', 'AIML', 'WEB', 'ANDROID', 'BLOCKCHAIN', 'IOT', 'CYBERSECURITY', 'DEVOPS');

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "domain",
ADD COLUMN     "domain" "Domain" NOT NULL;

-- CreateTable
CREATE TABLE "Pfp" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pfp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pfp_studentId_key" ON "Pfp"("studentId");

-- CreateIndex
CREATE INDEX "pfp_studentId_index" ON "Pfp"("studentId");

-- AddForeignKey
ALTER TABLE "Pfp" ADD CONSTRAINT "Pfp_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
