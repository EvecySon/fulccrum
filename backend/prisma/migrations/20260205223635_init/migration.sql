-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'business_owner', 'driver', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'accepted', 'rejected', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "user_id" UUID NOT NULL,
    "default_address_id" UUID,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "loyalty_points" INTEGER NOT NULL DEFAULT 0,
    "loyalty_tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "driver_profiles" (
    "user_id" UUID NOT NULL,
    "vehicle_type" VARCHAR(50) NOT NULL,
    "vehicle_make" VARCHAR(50),
    "vehicle_model" VARCHAR(50),
    "vehicle_year" INTEGER,
    "vehicle_color" VARCHAR(30),
    "license_plate" VARCHAR(20),
    "driver_license_number" VARCHAR(50),
    "background_check_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "background_check_date" TIMESTAMP(3),
    "insurance_expiration" DATE,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "online_status" BOOLEAN NOT NULL DEFAULT false,
    "last_location_update" TIMESTAMP(3),

    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "business_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "website" VARCHAR(255),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "tax_id" VARCHAR(50),
    "business_license" VARCHAR(100),
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "verification_date" TIMESTAMP(3),
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "average_preparation_time" INTEGER NOT NULL DEFAULT 15,
    "delivery_fee" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "minimum_order_amount" DECIMAL(8,2) NOT NULL DEFAULT 0.0,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "business_id" UUID,
    "label" VARCHAR(50),
    "street_address" VARCHAR(255) NOT NULL,
    "apartment" VARCHAR(50),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(20) NOT NULL,
    "customer_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "driver_id" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "delivery_fee" DECIMAL(5,2) NOT NULL,
    "service_fee" DECIMAL(5,2) NOT NULL,
    "tax_amount" DECIMAL(5,2) NOT NULL,
    "tip_amount" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "discount_amount" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "placed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "preparation_started_at" TIMESTAMP(3),
    "ready_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_business_id_idx" ON "orders"("business_id");

-- CreateIndex
CREATE INDEX "orders_driver_id_idx" ON "orders"("driver_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
