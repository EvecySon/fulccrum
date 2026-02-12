-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "address" VARCHAR(255),
ADD COLUMN     "address2" VARCHAR(255),
ADD COLUMN     "auto_accept_orders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "delivery_radius" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
ADD COLUMN     "lga" VARCHAR(100),
ADD COLUMN     "max_concurrent_orders" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "state" VARCHAR(100);

-- AlterTable
ALTER TABLE "crm_campaigns" ADD COLUMN     "offer_data" JSONB,
ADD COLUMN     "personalization_level" VARCHAR(20) NOT NULL DEFAULT 'basic',
ADD COLUMN     "target_segment" JSONB;

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "auto_reorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplier_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "custom_allergies" VARCHAR(500),
ADD COLUMN     "dietary_preferences" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "merchant_channels" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'delivery',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "channel_config" JSONB,
    "pricing_rules" JSONB,
    "inventory_sync" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_subscriptions" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'meal_plan',
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "schedule" VARCHAR(50) NOT NULL DEFAULT 'weekly',
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "delivery_schedule" JSONB,
    "customization_options" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_programs" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "points_per_order" INTEGER NOT NULL DEFAULT 10,
    "reward_threshold" INTEGER NOT NULL DEFAULT 100,
    "reward_value" INTEGER NOT NULL DEFAULT 500,
    "reward_type" VARCHAR(50) NOT NULL DEFAULT 'discount',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_loyalty" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lifetime_points" INTEGER NOT NULL DEFAULT 0,
    "tier" VARCHAR(20) NOT NULL DEFAULT 'Bronze',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_loyalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" UUID NOT NULL,
    "loyalty_id" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "points" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "order_id" UUID,
    "reward_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_rewards" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "points_cost" INTEGER NOT NULL,
    "icon" VARCHAR(50) NOT NULL DEFAULT 'gift-outline',
    "type" VARCHAR(30) NOT NULL DEFAULT 'discount',
    "value" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_insight_actions" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "insight_id" VARCHAR(255) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_insight_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" UUID NOT NULL,
    "merchant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'surge',
    "condition" JSONB,
    "adjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustment_type" VARCHAR(20) NOT NULL DEFAULT 'percentage',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_operations" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "item_id" UUID,
    "operation_type" VARCHAR(50) NOT NULL,
    "station_id" VARCHAR(50),
    "estimated_prep_time" INTEGER,
    "actual_prep_time" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kitchen_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_ai_insights" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "insight_type" VARCHAR(50) NOT NULL,
    "insight_data" JSONB NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "potential_impact" DECIMAL(10,2),
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_customer_profiles" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "favorite_items" JSONB,
    "order_frequency" VARCHAR(20),
    "loyalty_score" INTEGER NOT NULL DEFAULT 0,
    "last_visit" TIMESTAMP(3),
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL DEFAULT 'surplus',
    "original_price" DECIMAL(10,2) NOT NULL,
    "discounted_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "quantity_sold" INTEGER NOT NULL DEFAULT 0,
    "images" JSONB,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_orders" (
    "id" UUID NOT NULL,
    "host_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "invite_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "split_method" TEXT NOT NULL DEFAULT 'individual',
    "delivery_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_order_members" (
    "id" UUID NOT NULL,
    "group_order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_order_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_channels_merchant_id_idx" ON "merchant_channels"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_channels_merchant_id_type_key" ON "merchant_channels"("merchant_id", "type");

-- CreateIndex
CREATE INDEX "merchant_subscriptions_merchant_id_idx" ON "merchant_subscriptions"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_programs_merchant_id_key" ON "loyalty_programs"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_loyalty_user_id_key" ON "customer_loyalty"("user_id");

-- CreateIndex
CREATE INDEX "customer_loyalty_user_id_idx" ON "customer_loyalty"("user_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_loyalty_id_idx" ON "loyalty_transactions"("loyalty_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_created_at_idx" ON "loyalty_transactions"("created_at");

-- CreateIndex
CREATE INDEX "merchant_insight_actions_merchant_id_idx" ON "merchant_insight_actions"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_insight_actions_merchant_id_insight_id_key" ON "merchant_insight_actions"("merchant_id", "insight_id");

-- CreateIndex
CREATE INDEX "pricing_rules_merchant_id_idx" ON "pricing_rules"("merchant_id");

-- CreateIndex
CREATE INDEX "kitchen_operations_business_id_idx" ON "kitchen_operations"("business_id");

-- CreateIndex
CREATE INDEX "kitchen_operations_order_id_idx" ON "kitchen_operations"("order_id");

-- CreateIndex
CREATE INDEX "merchant_ai_insights_business_id_idx" ON "merchant_ai_insights"("business_id");

-- CreateIndex
CREATE INDEX "merchant_ai_insights_business_id_insight_type_idx" ON "merchant_ai_insights"("business_id", "insight_type");

-- CreateIndex
CREATE INDEX "merchant_customer_profiles_business_id_idx" ON "merchant_customer_profiles"("business_id");

-- CreateIndex
CREATE INDEX "merchant_customer_profiles_customer_id_idx" ON "merchant_customer_profiles"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_customer_profiles_business_id_customer_id_key" ON "merchant_customer_profiles"("business_id", "customer_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_business_id_idx" ON "marketplace_listings"("business_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_is_active_expires_at_idx" ON "marketplace_listings"("is_active", "expires_at");

-- CreateIndex
CREATE INDEX "marketplace_listings_category_idx" ON "marketplace_listings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "group_orders_invite_code_key" ON "group_orders"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "group_orders_order_id_key" ON "group_orders"("order_id");

-- CreateIndex
CREATE INDEX "group_orders_host_id_idx" ON "group_orders"("host_id");

-- CreateIndex
CREATE INDEX "group_orders_business_id_idx" ON "group_orders"("business_id");

-- CreateIndex
CREATE INDEX "group_orders_invite_code_idx" ON "group_orders"("invite_code");

-- CreateIndex
CREATE INDEX "group_order_members_group_order_id_idx" ON "group_order_members"("group_order_id");

-- CreateIndex
CREATE INDEX "group_order_members_user_id_idx" ON "group_order_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_order_members_group_order_id_user_id_key" ON "group_order_members"("group_order_id", "user_id");

-- AddForeignKey
ALTER TABLE "merchant_channels" ADD CONSTRAINT "merchant_channels_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_subscriptions" ADD CONSTRAINT "merchant_subscriptions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_loyalty" ADD CONSTRAINT "customer_loyalty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_loyalty_id_fkey" FOREIGN KEY ("loyalty_id") REFERENCES "customer_loyalty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_operations" ADD CONSTRAINT "kitchen_operations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_ai_insights" ADD CONSTRAINT "merchant_ai_insights_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_customer_profiles" ADD CONSTRAINT "merchant_customer_profiles_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_customer_profiles" ADD CONSTRAINT "merchant_customer_profiles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_orders" ADD CONSTRAINT "group_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_order_members" ADD CONSTRAINT "group_order_members_group_order_id_fkey" FOREIGN KEY ("group_order_id") REFERENCES "group_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_order_members" ADD CONSTRAINT "group_order_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
