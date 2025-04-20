-- CreateTable
CREATE TABLE "employee_updates" (
    "id" TEXT NOT NULL,
    "userid" TEXT,
    "username" TEXT,
    "content" TEXT,
    "date" TEXT,

    CONSTRAINT "employee_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MerchPayments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "upiId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "confirmationSS" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchPayments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchPayments_orderId_key" ON "MerchPayments"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchPayments_email_key" ON "MerchPayments"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MerchPayments_upiId_key" ON "MerchPayments"("upiId");

-- CreateIndex
CREATE UNIQUE INDEX "MerchPayments_phone_key" ON "MerchPayments"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "MerchPayments_confirmationSS_key" ON "MerchPayments"("confirmationSS");

-- CreateIndex
CREATE INDEX "merch_payments_upiId_index" ON "MerchPayments"("upiId");

-- CreateIndex
CREATE INDEX "merch_payments_phone_index" ON "MerchPayments"("phone");

-- CreateIndex
CREATE INDEX "merch_payments_orderId_index" ON "MerchPayments"("orderId");

-- CreateIndex
CREATE INDEX "merch_payments_confirmationSS_index" ON "MerchPayments"("confirmationSS");
