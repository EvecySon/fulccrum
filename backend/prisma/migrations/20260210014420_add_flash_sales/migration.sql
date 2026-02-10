-- CreateTable
CREATE TABLE "flash_sales" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "discount_type" VARCHAR(20) NOT NULL DEFAULT 'percentage',
    "discount_value" DOUBLE PRECISION NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "items_sold" INTEGER NOT NULL DEFAULT 0,
    "max_quantity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flash_sales_merchant_id_idx" ON "flash_sales"("merchant_id");

-- CreateIndex
CREATE INDEX "flash_sales_starts_at_ends_at_idx" ON "flash_sales"("starts_at", "ends_at");

-- AddForeignKey
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
