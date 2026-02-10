-- CreateTable
CREATE TABLE "crm_campaigns" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'promotion',
    "target_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "effectiveness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_customer_notes" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "customer_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_customer_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_campaigns_merchant_id_idx" ON "crm_campaigns"("merchant_id");

-- CreateIndex
CREATE INDEX "crm_customer_notes_merchant_id_idx" ON "crm_customer_notes"("merchant_id");

-- CreateIndex
CREATE INDEX "crm_customer_notes_customer_id_idx" ON "crm_customer_notes"("customer_id");

-- AddForeignKey
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_customer_notes" ADD CONSTRAINT "crm_customer_notes_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_customer_notes" ADD CONSTRAINT "crm_customer_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
