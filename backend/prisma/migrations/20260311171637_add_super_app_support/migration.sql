-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('food_delivery', 'package_delivery', 'service_booking', 'product_delivery');

-- CreateEnum
CREATE TYPE "PackageSize" AS ENUM ('small', 'medium', 'large');

-- CreateEnum
CREATE TYPE "DeliverySpeed" AS ENUM ('express', 'same_day', 'scheduled');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "base_price" DECIMAL(10,2),
ADD COLUMN     "delivery_speed" "DeliverySpeed",
ADD COLUMN     "distance_price" DECIMAL(10,2),
ADD COLUMN     "dropoff_location" JSONB,
ADD COLUMN     "order_type" "OrderType" NOT NULL DEFAULT 'food_delivery',
ADD COLUMN     "package_description" VARCHAR(500),
ADD COLUMN     "package_photo" TEXT,
ADD COLUMN     "package_size" "PackageSize",
ADD COLUMN     "package_weight" DOUBLE PRECISION,
ADD COLUMN     "pickup_location" JSONB,
ADD COLUMN     "size_multiplier" DOUBLE PRECISION,
ADD COLUMN     "surge_factor" DOUBLE PRECISION,
ALTER COLUMN "business_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "courier_locations" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_requests" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "pickup_location" JSONB NOT NULL,
    "dropoff_location" JSONB NOT NULL,
    "package_size" "PackageSize" NOT NULL,
    "estimated_price" DECIMAL(10,2) NOT NULL,
    "estimated_distance" DOUBLE PRECISION NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "sent_to_couriers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rejected_by" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accepted_by" UUID,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "delivery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_chain_entries" (
    "id" UUID NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "block_index" INTEGER NOT NULL,
    "previous_hash" VARCHAR(128) NOT NULL,
    "current_hash" VARCHAR(128) NOT NULL,
    "stage" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "handler" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "temperature" VARCHAR(20),
    "batch_number" VARCHAR(100),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "certificate" VARCHAR(255),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_chain_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_locations_courier_id_timestamp_idx" ON "courier_locations"("courier_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_requests_order_id_key" ON "delivery_requests"("order_id");

-- CreateIndex
CREATE INDEX "delivery_requests_status_expires_at_idx" ON "delivery_requests"("status", "expires_at");

-- CreateIndex
CREATE INDEX "delivery_requests_accepted_by_idx" ON "delivery_requests"("accepted_by");

-- CreateIndex
CREATE INDEX "supply_chain_entries_menu_item_id_idx" ON "supply_chain_entries"("menu_item_id");

-- CreateIndex
CREATE INDEX "supply_chain_entries_business_id_idx" ON "supply_chain_entries"("business_id");

-- CreateIndex
CREATE INDEX "supply_chain_entries_stage_idx" ON "supply_chain_entries"("stage");

-- CreateIndex
CREATE INDEX "supply_chain_entries_timestamp_idx" ON "supply_chain_entries"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "supply_chain_entries_menu_item_id_block_index_key" ON "supply_chain_entries"("menu_item_id", "block_index");

-- CreateIndex
CREATE INDEX "orders_order_type_status_idx" ON "orders"("order_type", "status");

-- AddForeignKey
ALTER TABLE "courier_locations" ADD CONSTRAINT "courier_locations_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_chain_entries" ADD CONSTRAINT "supply_chain_entries_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
