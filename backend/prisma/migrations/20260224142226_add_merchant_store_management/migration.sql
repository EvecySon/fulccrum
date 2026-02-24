-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "acceptance_rate" DECIMAL(5,2) NOT NULL DEFAULT 100,
ADD COLUMN     "auto_accept_timeout" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "average_response_time" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_seen_at" TIMESTAMP(3),
ADD COLUMN     "manual_status" VARCHAR(20) NOT NULL DEFAULT 'auto',
ADD COLUMN     "pause_reason" VARCHAR(200),
ADD COLUMN     "paused_until" TIMESTAMP(3),
ADD COLUMN     "show_phone_to_customers" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "merchant_notified_at" TIMESTAMP(3),
ADD COLUMN     "merchant_response_time" INTEGER,
ADD COLUMN     "timeout_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "merchant_activity_logs" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "device_info" VARCHAR(200),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_activity_logs_merchant_id_timestamp_idx" ON "merchant_activity_logs"("merchant_id", "timestamp");

-- AddForeignKey
ALTER TABLE "merchant_activity_logs" ADD CONSTRAINT "merchant_activity_logs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
