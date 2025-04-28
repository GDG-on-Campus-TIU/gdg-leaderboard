-- AlterTable
ALTER TABLE "MerchPayments" ADD COLUMN     "items" TEXT[];

-- CreateIndex
CREATE INDEX "merch_payments_size_index" ON "MerchPayments"("size");
