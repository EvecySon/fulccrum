-- CreateTable
CREATE TABLE "delivery_zones" (
    "id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "coordinates" JSONB NOT NULL,
    "delivery_fee" DECIMAL(10,2),
    "minimum_order" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_orders" INTEGER,
    "estimated_delivery_time" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "ticket_number" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "assigned_to_id" UUID,
    "order_id" UUID,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "satisfaction_rating" SMALLINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_zones_business_id_idx" ON "delivery_zones"("business_id");

-- CreateIndex
CREATE INDEX "delivery_zones_is_active_idx" ON "delivery_zones"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_assigned_to_id_idx" ON "support_tickets"("assigned_to_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_created_at_idx" ON "support_tickets"("created_at");

-- CreateIndex
CREATE INDEX "support_messages_ticket_id_idx" ON "support_messages"("ticket_id");

-- CreateIndex
CREATE INDEX "support_messages_sender_id_idx" ON "support_messages"("sender_id");

-- CreateIndex
CREATE INDEX "support_messages_created_at_idx" ON "support_messages"("created_at");

-- AddForeignKey
ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
