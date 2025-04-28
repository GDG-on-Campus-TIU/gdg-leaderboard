/*
  Warnings:

  - You are about to drop the column `size` on the `MerchPayments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "merch_payments_size_index";

-- AlterTable
ALTER TABLE "MerchPayments" DROP COLUMN "size";
