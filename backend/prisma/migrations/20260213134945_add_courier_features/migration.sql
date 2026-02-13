-- CreateTable
CREATE TABLE "courier_schedule_slots" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "demand" VARCHAR(20) NOT NULL,
    "surge_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "target" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_quest_progress" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "quest_id" UUID NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_quest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_preferences" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "max_distance" INTEGER NOT NULL DEFAULT 10,
    "min_pay" INTEGER NOT NULL DEFAULT 0,
    "auto_accept" BOOLEAN NOT NULL DEFAULT false,
    "auto_accept_surge" BOOLEAN NOT NULL DEFAULT false,
    "stacked_orders" BOOLEAN NOT NULL DEFAULT true,
    "avoid_highways" BOOLEAN NOT NULL DEFAULT false,
    "night_mode" BOOLEAN NOT NULL DEFAULT false,
    "order_types" TEXT[] DEFAULT ARRAY['food', 'grocery', 'pharmacy']::TEXT[],
    "preferred_zones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "referrer_id" UUID NOT NULL,
    "referred_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "deliveries_required" INTEGER NOT NULL DEFAULT 25,
    "deliveries_completed" INTEGER NOT NULL DEFAULT 0,
    "reward_amount" INTEGER NOT NULL DEFAULT 5000,
    "paid_out" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_proofs" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "photo_url" TEXT NOT NULL,
    "notes" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_ratings" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "tags" TEXT[],
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_plans" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "monthly_premium" INTEGER NOT NULL,
    "coverage" TEXT[],
    "max_coverage" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "action" VARCHAR(200) NOT NULL,
    "cost" INTEGER NOT NULL,
    "mileage" VARCHAR(50),
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_modules" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "duration" VARCHAR(50) NOT NULL,
    "lessons" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "category" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_training_progress" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_training_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surge_zones" (
    "id" UUID NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "estimated_orders" INTEGER NOT NULL,
    "level" VARCHAR(20) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surge_zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courier_schedule_slots_courier_id_date_idx" ON "courier_schedule_slots"("courier_id", "date");

-- CreateIndex
CREATE INDEX "quests_active_expires_at_idx" ON "quests"("active", "expires_at");

-- CreateIndex
CREATE INDEX "courier_quest_progress_courier_id_completed_idx" ON "courier_quest_progress"("courier_id", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "courier_quest_progress_courier_id_quest_id_key" ON "courier_quest_progress"("courier_id", "quest_id");

-- CreateIndex
CREATE UNIQUE INDEX "courier_preferences_courier_id_key" ON "courier_preferences"("courier_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_status_idx" ON "referrals"("referrer_id", "status");

-- CreateIndex
CREATE INDEX "referrals_referred_id_idx" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "delivery_proofs_order_id_idx" ON "delivery_proofs"("order_id");

-- CreateIndex
CREATE INDEX "customer_ratings_courier_id_idx" ON "customer_ratings"("courier_id");

-- CreateIndex
CREATE INDEX "customer_ratings_customer_id_idx" ON "customer_ratings"("customer_id");

-- CreateIndex
CREATE INDEX "insurance_plans_active_type_idx" ON "insurance_plans"("active", "type");

-- CreateIndex
CREATE INDEX "insurance_claims_courier_id_status_idx" ON "insurance_claims"("courier_id", "status");

-- CreateIndex
CREATE INDEX "maintenance_logs_courier_id_date_idx" ON "maintenance_logs"("courier_id", "date");

-- CreateIndex
CREATE INDEX "training_modules_category_sort_order_idx" ON "training_modules"("category", "sort_order");

-- CreateIndex
CREATE INDEX "courier_training_progress_courier_id_idx" ON "courier_training_progress"("courier_id");

-- CreateIndex
CREATE UNIQUE INDEX "courier_training_progress_courier_id_module_id_key" ON "courier_training_progress"("courier_id", "module_id");

-- CreateIndex
CREATE INDEX "surge_zones_active_expires_at_idx" ON "surge_zones"("active", "expires_at");

-- CreateIndex
CREATE INDEX "surge_zones_latitude_longitude_idx" ON "surge_zones"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "courier_schedule_slots" ADD CONSTRAINT "courier_schedule_slots_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_quest_progress" ADD CONSTRAINT "courier_quest_progress_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_quest_progress" ADD CONSTRAINT "courier_quest_progress_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_preferences" ADD CONSTRAINT "courier_preferences_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_training_progress" ADD CONSTRAINT "courier_training_progress_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_training_progress" ADD CONSTRAINT "courier_training_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
