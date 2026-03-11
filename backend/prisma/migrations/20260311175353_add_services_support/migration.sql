-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('home_service', 'health_service', 'beauty_service', 'repair_service');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'pest_control', 'doctor_consultation', 'nursing', 'physiotherapy', 'lab_test', 'hair_styling', 'makeup', 'spa', 'massage', 'appliance_repair', 'phone_repair', 'computer_repair', 'other');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('pending_approval', 'active', 'suspended', 'inactive');

-- DropIndex
DROP INDEX "delivery_requests_accepted_by_idx";

-- CreateTable
CREATE TABLE "service_providers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "categories" "ServiceCategory"[],
    "business_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "experience" INTEGER,
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "serviceArea" JSONB NOT NULL,
    "hourly_rate" DECIMAL(10,2),
    "fixed_rates" JSONB,
    "availability" JSONB NOT NULL DEFAULT '{}',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "completed_jobs" INTEGER NOT NULL DEFAULT 0,
    "status" "ProviderStatus" NOT NULL DEFAULT 'pending_approval',
    "verification_docs" JSONB NOT NULL DEFAULT '[]',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bookings" (
    "id" UUID NOT NULL,
    "booking_number" VARCHAR(50) NOT NULL,
    "customer_id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "service_details" JSONB NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" VARCHAR(20) NOT NULL,
    "duration" INTEGER,
    "location" JSONB NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "price" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(50),
    "special_notes" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "rating" INTEGER,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_providers_user_id_key" ON "service_providers"("user_id");

-- CreateIndex
CREATE INDEX "service_providers_service_type_status_idx" ON "service_providers"("service_type", "status");

-- CreateIndex
CREATE INDEX "service_providers_status_idx" ON "service_providers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "service_bookings_booking_number_key" ON "service_bookings"("booking_number");

-- CreateIndex
CREATE INDEX "service_bookings_customer_id_idx" ON "service_bookings"("customer_id");

-- CreateIndex
CREATE INDEX "service_bookings_provider_id_idx" ON "service_bookings"("provider_id");

-- CreateIndex
CREATE INDEX "service_bookings_status_idx" ON "service_bookings"("status");

-- CreateIndex
CREATE INDEX "service_bookings_scheduled_date_idx" ON "service_bookings"("scheduled_date");

-- CreateIndex
CREATE INDEX "delivery_requests_order_id_idx" ON "delivery_requests"("order_id");

-- AddForeignKey
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
