/*
  Warnings:

  - Added the required column `size` to the `MerchPayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MerchPayments" ADD COLUMN     "size" TEXT NOT NULL;
