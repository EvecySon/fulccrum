-- CreateTable
CREATE TABLE "platform_settings" (
    "id" UUID NOT NULL,
    "base_delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 200,
    "per_km_rate" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "min_delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 200,
    "max_delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 2000,
    "free_delivery_threshold" DECIMAL(10,2),
    "service_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "min_service_fee" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "max_service_fee" DECIMAL(10,2),
    "tax_percentage" DECIMAL(5,2) NOT NULL DEFAULT 7.5,
    "tax_name" VARCHAR(50) NOT NULL DEFAULT 'VAT',
    "platform_commission_percentage" DECIMAL(5,2) NOT NULL DEFAULT 15,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
