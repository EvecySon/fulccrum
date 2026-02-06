/*
  Warnings:

  - Added the required column `updated_at` to the `business_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "menu_categories" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "cost_price" DECIMAL(10,2),
    "images" JSONB NOT NULL DEFAULT '[]',
    "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nutritional_info" JSONB,
    "preparation_time" INTEGER NOT NULL DEFAULT 15,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_modifiers" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier_options" (
    "id" UUID NOT NULL,
    "modifier_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price_adjustment" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modifier_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_modifier_links" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "modifier_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_modifier_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "dayOfWeek" SMALLINT NOT NULL,
    "opening_time" VARCHAR(5) NOT NULL,
    "closing_time" VARCHAR(5) NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 0,
    "unit" VARCHAR(50) NOT NULL DEFAULT 'pieces',
    "cost_per_unit" DECIMAL(8,2),
    "supplier" VARCHAR(255),
    "last_restocked" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_categories_business_id_idx" ON "menu_categories"("business_id");

-- CreateIndex
CREATE INDEX "menu_categories_business_id_is_active_idx" ON "menu_categories"("business_id", "is_active");

-- CreateIndex
CREATE INDEX "menu_items_business_id_idx" ON "menu_items"("business_id");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");

-- CreateIndex
CREATE INDEX "menu_items_business_id_is_available_idx" ON "menu_items"("business_id", "is_available");

-- CreateIndex
CREATE INDEX "menu_items_business_id_is_featured_idx" ON "menu_items"("business_id", "is_featured");

-- CreateIndex
CREATE INDEX "item_modifiers_business_id_idx" ON "item_modifiers"("business_id");

-- CreateIndex
CREATE INDEX "modifier_options_modifier_id_idx" ON "modifier_options"("modifier_id");

-- CreateIndex
CREATE INDEX "item_modifier_links_item_id_idx" ON "item_modifier_links"("item_id");

-- CreateIndex
CREATE INDEX "item_modifier_links_modifier_id_idx" ON "item_modifier_links"("modifier_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_modifier_links_item_id_modifier_id_key" ON "item_modifier_links"("item_id", "modifier_id");

-- CreateIndex
CREATE INDEX "business_hours_business_id_idx" ON "business_hours"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_business_id_dayOfWeek_key" ON "business_hours"("business_id", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_id_key" ON "inventory"("item_id");

-- CreateIndex
CREATE INDEX "inventory_business_id_idx" ON "inventory"("business_id");

-- CreateIndex
CREATE INDEX "inventory_business_id_current_stock_idx" ON "inventory"("business_id", "current_stock");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_options" ADD CONSTRAINT "modifier_options_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "item_modifiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_modifier_links" ADD CONSTRAINT "item_modifier_links_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_modifier_links" ADD CONSTRAINT "item_modifier_links_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "item_modifiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
