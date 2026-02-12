/*
  Warnings:

  - You are about to drop the column `business_id` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_fee` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_delivery_time` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `max_orders` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `minimum_order` on the `delivery_zones` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `discount_type` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `discount_value` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `minimum_order` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `usage_limit_per_user` on the `promo_codes` table. All the data in the column will be lost.
  - You are about to drop the column `used_count` on the `promo_codes` table. All the data in the column will be lost.
  - The `applicable_to` column on the `promo_codes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `promo_usages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `base_fee` to the `delivery_zones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_delivery_radius` to the `delivery_zones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `per_km_rate` to the `delivery_zones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `polygon` to the `delivery_zones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `promo_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `promo_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `promo_codes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "delivery_zones" DROP CONSTRAINT "delivery_zones_business_id_fkey";

-- DropForeignKey
ALTER TABLE "promo_usages" DROP CONSTRAINT "promo_usages_promo_code_id_fkey";

-- DropForeignKey
ALTER TABLE "promo_usages" DROP CONSTRAINT "promo_usages_user_id_fkey";

-- DropIndex
DROP INDEX "delivery_zones_business_id_idx";

-- DropIndex
DROP INDEX "delivery_zones_is_active_idx";

-- DropIndex
DROP INDEX "promo_codes_business_id_idx";

-- DropIndex
DROP INDEX "promo_codes_code_idx";

-- DropIndex
DROP INDEX "promo_codes_is_active_idx";

-- AlterTable
ALTER TABLE "delivery_zones" DROP COLUMN "business_id",
DROP COLUMN "coordinates",
DROP COLUMN "delivery_fee",
DROP COLUMN "description",
DROP COLUMN "estimated_delivery_time",
DROP COLUMN "max_orders",
DROP COLUMN "minimum_order",
ADD COLUMN     "base_fee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100) NOT NULL DEFAULT 'Nigeria',
ADD COLUMN     "max_delivery_radius" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "per_km_rate" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "polygon" JSONB NOT NULL,
ADD COLUMN     "surge_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00;

-- AlterTable
ALTER TABLE "promo_codes" DROP COLUMN "business_id",
DROP COLUMN "description",
DROP COLUMN "discount_type",
DROP COLUMN "discount_value",
DROP COLUMN "minimum_order",
DROP COLUMN "usage_limit_per_user",
DROP COLUMN "used_count",
ADD COLUMN     "created_by" UUID NOT NULL,
ADD COLUMN     "min_order_value" DECIMAL(10,2),
ADD COLUMN     "per_user_limit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "type" VARCHAR(50) NOT NULL,
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "value" DECIMAL(10,2) NOT NULL,
DROP COLUMN "applicable_to",
ADD COLUMN     "applicable_to" JSONB;

-- DropTable
DROP TABLE "promo_usages";

-- CreateTable
CREATE TABLE "commission_tiers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "businessType" VARCHAR(50) NOT NULL,
    "minOrders" INTEGER NOT NULL DEFAULT 0,
    "maxOrders" INTEGER,
    "percentage" DECIMAL(5,2) NOT NULL,
    "flatFee" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_commissions" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "tier_id" UUID NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "flat_fee" DECIMAL(10,2),
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_revenue" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_total" DECIMAL(10,2) NOT NULL,
    "merchant_revenue" DECIMAL(10,2) NOT NULL,
    "courier_revenue" DECIMAL(10,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "payment_fee" DECIMAL(10,2) NOT NULL,
    "net_revenue" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "reconciled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "rejection_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chargebacks" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "evidence_url" TEXT,
    "notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chargebacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "department" VARCHAR(100),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" VARCHAR(255),
    "allowed_ips" TEXT[],
    "last_login_ip" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" UUID NOT NULL,
    "changes" JSONB,
    "ip_address" VARCHAR(50) NOT NULL,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_configs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "orderType" VARCHAR(50) NOT NULL,
    "maxPrepTime" INTEGER NOT NULL,
    "maxDeliveryTime" INTEGER NOT NULL,
    "maxTotalTime" INTEGER NOT NULL,
    "breachAction" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "severity" VARCHAR(50) NOT NULL,
    "order_id" UUID,
    "business_id" UUID,
    "driver_id" UUID,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "assigned_to" UUID,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_moderation_queue" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "resource_id" UUID NOT NULL,
    "resource_data" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "flags" TEXT[],
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_moderation_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_compliance" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "license_number" VARCHAR(100),
    "license_expiry" DATE,
    "health_permit" VARCHAR(100),
    "permit_expiry" DATE,
    "insurance_policy" VARCHAR(100),
    "insurance_expiry" DATE,
    "tax_id" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "documents" JSONB,
    "last_checked" TIMESTAMP(3) NOT NULL,
    "next_check_due" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "budget" DECIMAL(10,2),
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "target_audience" JSONB NOT NULL,
    "config" JSONB NOT NULL,
    "metrics" JSONB,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_reports" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "filters" JSONB NOT NULL,
    "columns" TEXT[],
    "schedule" VARCHAR(50),
    "recipients" TEXT[],
    "format" VARCHAR(10) NOT NULL DEFAULT 'csv',
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_analysis" (
    "id" UUID NOT NULL,
    "cohort_date" DATE NOT NULL,
    "cohortType" VARCHAR(50) NOT NULL,
    "user_count" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_tiers_businessType_is_active_idx" ON "commission_tiers"("businessType", "is_active");

-- CreateIndex
CREATE INDEX "merchant_commissions_business_id_effective_from_effective_t_idx" ON "merchant_commissions"("business_id", "effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "merchant_commissions_tier_id_idx" ON "merchant_commissions"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_revenue_order_id_key" ON "platform_revenue"("order_id");

-- CreateIndex
CREATE INDEX "platform_revenue_created_at_idx" ON "platform_revenue"("created_at");

-- CreateIndex
CREATE INDEX "platform_revenue_reconciled_at_idx" ON "platform_revenue"("reconciled_at");

-- CreateIndex
CREATE INDEX "refunds_order_id_idx" ON "refunds"("order_id");

-- CreateIndex
CREATE INDEX "refunds_status_created_at_idx" ON "refunds"("status", "created_at");

-- CreateIndex
CREATE INDEX "chargebacks_order_id_idx" ON "chargebacks"("order_id");

-- CreateIndex
CREATE INDEX "chargebacks_status_created_at_idx" ON "chargebacks"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "admin_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "admin_users"("user_id");

-- CreateIndex
CREATE INDEX "admin_users_user_id_idx" ON "admin_users"("user_id");

-- CreateIndex
CREATE INDEX "admin_users_role_id_idx" ON "admin_users"("role_id");

-- CreateIndex
CREATE INDEX "audit_logs_admin_user_id_created_at_idx" ON "audit_logs"("admin_user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "sla_configs_orderType_is_active_idx" ON "sla_configs"("orderType", "is_active");

-- CreateIndex
CREATE INDEX "incidents_status_severity_created_at_idx" ON "incidents"("status", "severity", "created_at");

-- CreateIndex
CREATE INDEX "incidents_order_id_idx" ON "incidents"("order_id");

-- CreateIndex
CREATE INDEX "content_moderation_queue_status_type_created_at_idx" ON "content_moderation_queue"("status", "type", "created_at");

-- CreateIndex
CREATE INDEX "content_moderation_queue_resource_id_idx" ON "content_moderation_queue"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_compliance_business_id_key" ON "merchant_compliance"("business_id");

-- CreateIndex
CREATE INDEX "merchant_compliance_status_next_check_due_idx" ON "merchant_compliance"("status", "next_check_due");

-- CreateIndex
CREATE INDEX "campaigns_status_start_date_end_date_idx" ON "campaigns"("status", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "campaigns_type_status_idx" ON "campaigns"("type", "status");

-- CreateIndex
CREATE INDEX "custom_reports_schedule_next_run_idx" ON "custom_reports"("schedule", "next_run");

-- CreateIndex
CREATE INDEX "cohort_analysis_cohort_date_cohortType_idx" ON "cohort_analysis"("cohort_date", "cohortType");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_analysis_cohort_date_cohortType_key" ON "cohort_analysis"("cohort_date", "cohortType");

-- CreateIndex
CREATE INDEX "delivery_zones_is_active_city_idx" ON "delivery_zones"("is_active", "city");

-- CreateIndex
CREATE INDEX "promo_codes_code_is_active_idx" ON "promo_codes"("code", "is_active");

-- AddForeignKey
ALTER TABLE "merchant_commissions" ADD CONSTRAINT "merchant_commissions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_commissions" ADD CONSTRAINT "merchant_commissions_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "commission_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_revenue" ADD CONSTRAINT "platform_revenue_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chargebacks" ADD CONSTRAINT "chargebacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_compliance" ADD CONSTRAINT "merchant_compliance_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
