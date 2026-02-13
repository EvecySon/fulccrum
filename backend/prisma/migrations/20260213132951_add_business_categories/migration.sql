-- CreateTable
CREATE TABLE "business_categories" (
    "id" UUID NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" VARCHAR(20) NOT NULL DEFAULT '#7f8c8d',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 99,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_key_key" ON "business_categories"("key");

-- CreateIndex
CREATE INDEX "business_categories_active_sort_order_idx" ON "business_categories"("active", "sort_order");
