-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "shippingAddress" TEXT NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryUpdate" (
    "id" SERIAL NOT NULL,
    "deliveryId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudDetection" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "flags" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FraudDetection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_saleId_key" ON "Delivery"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_trackingNumber_key" ON "Delivery"("trackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FraudDetection_saleId_key" ON "FraudDetection"("saleId");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryUpdate" ADD CONSTRAINT "DeliveryUpdate_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudDetection" ADD CONSTRAINT "FraudDetection_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudDetection" ADD CONSTRAINT "FraudDetection_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
