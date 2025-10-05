-- CreateTable
CREATE TABLE "PricingRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPricingRule" (
    "id" SERIAL NOT NULL,
    "pricingRuleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPricingRule" (
    "id" SERIAL NOT NULL,
    "pricingRuleId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPricingRule" (
    "id" SERIAL NOT NULL,
    "pricingRuleId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" TEXT NOT NULL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDiscountRule" (
    "id" SERIAL NOT NULL,
    "discountRuleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDiscountRule" (
    "id" SERIAL NOT NULL,
    "discountRuleId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryDiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDiscountRule" (
    "id" SERIAL NOT NULL,
    "discountRuleId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPricingRule_pricingRuleId_productId_key" ON "ProductPricingRule"("pricingRuleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPricingRule_pricingRuleId_categoryId_key" ON "CategoryPricingRule"("pricingRuleId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPricingRule_pricingRuleId_customerId_key" ON "CustomerPricingRule"("pricingRuleId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountRule_couponCode_key" ON "DiscountRule"("couponCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDiscountRule_discountRuleId_productId_key" ON "ProductDiscountRule"("discountRuleId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDiscountRule_discountRuleId_categoryId_key" ON "CategoryDiscountRule"("discountRuleId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDiscountRule_discountRuleId_customerId_key" ON "CustomerDiscountRule"("discountRuleId", "customerId");

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_discountRule_fkey" FOREIGN KEY ("couponId") REFERENCES "DiscountRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricingRule" ADD CONSTRAINT "ProductPricingRule_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPricingRule" ADD CONSTRAINT "ProductPricingRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPricingRule" ADD CONSTRAINT "CategoryPricingRule_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPricingRule" ADD CONSTRAINT "CategoryPricingRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPricingRule" ADD CONSTRAINT "CustomerPricingRule_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPricingRule" ADD CONSTRAINT "CustomerPricingRule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscountRule" ADD CONSTRAINT "ProductDiscountRule_discountRuleId_fkey" FOREIGN KEY ("discountRuleId") REFERENCES "DiscountRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDiscountRule" ADD CONSTRAINT "ProductDiscountRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDiscountRule" ADD CONSTRAINT "CategoryDiscountRule_discountRuleId_fkey" FOREIGN KEY ("discountRuleId") REFERENCES "DiscountRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryDiscountRule" ADD CONSTRAINT "CategoryDiscountRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDiscountRule" ADD CONSTRAINT "CustomerDiscountRule_discountRuleId_fkey" FOREIGN KEY ("discountRuleId") REFERENCES "DiscountRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDiscountRule" ADD CONSTRAINT "CustomerDiscountRule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
