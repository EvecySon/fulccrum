/*
  Warnings:

  - Added the required column `schedule_slot_id` to the `courier_schedule_slots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'scheduled';
ALTER TYPE "OrderStatus" ADD VALUE 'ready_for_pickup';

-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "estimated_delivery_time" VARCHAR(20),
ADD COLUMN     "is_open" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price_range" VARCHAR(10);

-- AlterTable
ALTER TABLE "courier_schedule_slots" ADD COLUMN     "schedule_slot_id" UUID NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'booked',
ADD COLUMN     "zone" VARCHAR(50) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_note" VARCHAR(500),
ADD COLUMN     "delivery_option" VARCHAR(30),
ADD COLUMN     "fulfillment_type" VARCHAR(20) NOT NULL DEFAULT 'delivery',
ADD COLUMN     "scheduled_for" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "schedule_slots" (
    "id" UUID NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "zone" VARCHAR(50) NOT NULL DEFAULT 'default',
    "total_spots" INTEGER NOT NULL DEFAULT 15,
    "demand" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "surge_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "estimated_earnings" INTEGER NOT NULL DEFAULT 15000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_zones" (
    "id" UUID NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_no_shows" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "penalty" VARCHAR(20) NOT NULL DEFAULT 'warning',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_no_shows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_slots_zone_active_idx" ON "schedule_slots"("zone", "active");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_slots_start_time_end_time_zone_key" ON "schedule_slots"("start_time", "end_time", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_zones_key_key" ON "schedule_zones"("key");

-- CreateIndex
CREATE INDEX "schedule_zones_active_idx" ON "schedule_zones"("active");

-- CreateIndex
CREATE INDEX "schedule_no_shows_courier_id_resolved_idx" ON "schedule_no_shows"("courier_id", "resolved");

-- CreateIndex
CREATE INDEX "courier_schedule_slots_schedule_slot_id_date_idx" ON "courier_schedule_slots"("schedule_slot_id", "date");

-- CreateIndex
CREATE INDEX "courier_schedule_slots_zone_date_start_time_idx" ON "courier_schedule_slots"("zone", "date", "start_time");

-- AddForeignKey
ALTER TABLE "courier_schedule_slots" ADD CONSTRAINT "courier_schedule_slots_schedule_slot_id_fkey" FOREIGN KEY ("schedule_slot_id") REFERENCES "schedule_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_no_shows" ADD CONSTRAINT "schedule_no_shows_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
