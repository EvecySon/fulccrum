-- CreateTable
CREATE TABLE "restaurant_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "restaurant_type" VARCHAR(100) NOT NULL,
    "cuisine_types" TEXT[],
    "description" TEXT,
    "business_email" VARCHAR(255) NOT NULL,
    "business_phone" VARCHAR(20) NOT NULL,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "delivery_radius" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "operating_hours" JSONB NOT NULL DEFAULT '{}',
    "food_license" VARCHAR(255),
    "business_reg_number" VARCHAR(100),
    "kitchen_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "sub_categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "business_email" VARCHAR(255) NOT NULL,
    "business_phone" VARCHAR(20) NOT NULL,
    "service_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hourly_rate" DECIMAL(10,2),
    "fixed_pricing" JSONB DEFAULT '{}',
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" INTEGER,
    "portfolio" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_jobs" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_service_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "profession" VARCHAR(100) NOT NULL,
    "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "business_email" VARCHAR(255) NOT NULL,
    "business_phone" VARCHAR(20) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "credentials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "years_of_experience" INTEGER NOT NULL DEFAULT 0,
    "consultation_fee" DECIMAL(10,2) NOT NULL,
    "availability" JSONB NOT NULL DEFAULT '{}',
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_consultations" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_service_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "store_name" VARCHAR(255) NOT NULL,
    "store_description" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "business_email" VARCHAR(255) NOT NULL,
    "business_phone" VARCHAR(20) NOT NULL,
    "store_logo" VARCHAR(500),
    "banner_image" VARCHAR(500),
    "return_policy" TEXT,
    "shipping_policy" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_service_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "service_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "business_email" VARCHAR(255) NOT NULL,
    "business_phone" VARCHAR(20) NOT NULL,
    "service_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricing" JSONB NOT NULL DEFAULT '{}',
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "insurance_info" VARCHAR(255),
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_jobs" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_service_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_deliveries" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "courier_id" UUID,
    "pickup_latitude" DOUBLE PRECISION NOT NULL,
    "pickup_longitude" DOUBLE PRECISION NOT NULL,
    "pickup_address" VARCHAR(500) NOT NULL,
    "pickup_contact_name" VARCHAR(255) NOT NULL,
    "pickup_contact_phone" VARCHAR(20) NOT NULL,
    "dropoff_latitude" DOUBLE PRECISION NOT NULL,
    "dropoff_longitude" DOUBLE PRECISION NOT NULL,
    "dropoff_address" VARCHAR(500) NOT NULL,
    "dropoff_contact_name" VARCHAR(255) NOT NULL,
    "dropoff_contact_phone" VARCHAR(20) NOT NULL,
    "package_size" "PackageSize" NOT NULL,
    "delivery_speed" "DeliverySpeed" NOT NULL,
    "package_description" TEXT,
    "package_weight" DOUBLE PRECISION,
    "special_instructions" TEXT,
    "package_photo_url" VARCHAR(500),
    "base_price" DECIMAL(10,2) NOT NULL,
    "distance_price" DECIMAL(10,2) NOT NULL,
    "size_multiplier" DOUBLE PRECISION NOT NULL,
    "speed_multiplier" DOUBLE PRECISION NOT NULL,
    "surge_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "total_price" DECIMAL(10,2) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "request_id" VARCHAR(100) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "package_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_delivery_ratings" (
    "id" UUID NOT NULL,
    "delivery_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "courier_rating" INTEGER,
    "courier_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_delivery_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_profiles_user_id_key" ON "restaurant_profiles"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_profiles_user_id_idx" ON "restaurant_profiles"("user_id");

-- CreateIndex
CREATE INDEX "restaurant_profiles_is_approved_idx" ON "restaurant_profiles"("is_approved");

-- CreateIndex
CREATE INDEX "restaurant_profiles_is_active_idx" ON "restaurant_profiles"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "service_provider_profiles_user_id_key" ON "service_provider_profiles"("user_id");

-- CreateIndex
CREATE INDEX "service_provider_profiles_user_id_idx" ON "service_provider_profiles"("user_id");

-- CreateIndex
CREATE INDEX "service_provider_profiles_category_idx" ON "service_provider_profiles"("category");

-- CreateIndex
CREATE INDEX "service_provider_profiles_is_approved_idx" ON "service_provider_profiles"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "health_service_profiles_user_id_key" ON "health_service_profiles"("user_id");

-- CreateIndex
CREATE INDEX "health_service_profiles_user_id_idx" ON "health_service_profiles"("user_id");

-- CreateIndex
CREATE INDEX "health_service_profiles_profession_idx" ON "health_service_profiles"("profession");

-- CreateIndex
CREATE INDEX "health_service_profiles_is_approved_idx" ON "health_service_profiles"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "seller_profiles_user_id_key" ON "seller_profiles"("user_id");

-- CreateIndex
CREATE INDEX "seller_profiles_user_id_idx" ON "seller_profiles"("user_id");

-- CreateIndex
CREATE INDEX "seller_profiles_is_approved_idx" ON "seller_profiles"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "home_service_profiles_user_id_key" ON "home_service_profiles"("user_id");

-- CreateIndex
CREATE INDEX "home_service_profiles_user_id_idx" ON "home_service_profiles"("user_id");

-- CreateIndex
CREATE INDEX "home_service_profiles_is_approved_idx" ON "home_service_profiles"("is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "package_deliveries_request_id_key" ON "package_deliveries"("request_id");

-- CreateIndex
CREATE INDEX "package_deliveries_customer_id_idx" ON "package_deliveries"("customer_id");

-- CreateIndex
CREATE INDEX "package_deliveries_courier_id_idx" ON "package_deliveries"("courier_id");

-- CreateIndex
CREATE INDEX "package_deliveries_status_idx" ON "package_deliveries"("status");

-- CreateIndex
CREATE INDEX "package_deliveries_created_at_idx" ON "package_deliveries"("created_at");

-- CreateIndex
CREATE INDEX "package_deliveries_request_id_idx" ON "package_deliveries"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_delivery_ratings_delivery_id_key" ON "package_delivery_ratings"("delivery_id");

-- CreateIndex
CREATE INDEX "package_delivery_ratings_delivery_id_idx" ON "package_delivery_ratings"("delivery_id");

-- AddForeignKey
ALTER TABLE "restaurant_profiles" ADD CONSTRAINT "restaurant_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_profiles" ADD CONSTRAINT "service_provider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_service_profiles" ADD CONSTRAINT "health_service_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_profiles" ADD CONSTRAINT "seller_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_service_profiles" ADD CONSTRAINT "home_service_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_deliveries" ADD CONSTRAINT "package_deliveries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_deliveries" ADD CONSTRAINT "package_deliveries_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_delivery_ratings" ADD CONSTRAINT "package_delivery_ratings_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "package_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
