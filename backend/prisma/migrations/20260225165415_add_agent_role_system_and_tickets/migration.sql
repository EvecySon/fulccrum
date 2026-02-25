-- CreateEnum
CREATE TYPE "AgentLevel" AS ENUM ('TIER1', 'TIER2', 'TIER3', 'SPECIALIST', 'MANAGER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('CUSTOMER_SUPPORT', 'MERCHANT_SUPPORT', 'COURIER_SUPPORT', 'GENERAL', 'VIP_SUPPORT', 'FRAUD_PREVENTION');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_TICKETS', 'CREATE_TICKETS', 'ASSIGN_TICKETS', 'CLOSE_TICKETS', 'REOPEN_TICKETS', 'ISSUE_REFUNDS', 'ISSUE_LARGE_REFUNDS', 'ESCALATE_TICKETS', 'VIEW_ANALYTICS', 'MANAGE_AGENTS', 'ACCESS_ADMIN_PANEL', 'EDIT_ORDERS', 'BAN_USERS', 'APPROVE_MERCHANTS', 'MANAGE_PROMOTIONS', 'VIEW_FINANCIAL_DATA', 'EXPORT_DATA');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('ORDER_ISSUE', 'PAYMENT_ISSUE', 'DELIVERY_ISSUE', 'ACCOUNT_ISSUE', 'REFUND_REQUEST', 'TECHNICAL_ISSUE', 'MERCHANT_ISSUE', 'DRIVER_ISSUE', 'GENERAL_INQUIRY', 'COMPLAINT', 'FEEDBACK');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "agent_level" "AgentLevel",
ADD COLUMN     "agent_status" VARCHAR(20) NOT NULL DEFAULT 'offline',
ADD COLUMN     "department" "Department",
ADD COLUMN     "device_info" JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN     "fcm_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "max_refund_amount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[];

-- CreateTable
CREATE TABLE "agent_metrics" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "total_tickets_handled" INTEGER NOT NULL DEFAULT 0,
    "tickets_handled_today" INTEGER NOT NULL DEFAULT 0,
    "tickets_handled_this_week" INTEGER NOT NULL DEFAULT 0,
    "tickets_handled_this_month" INTEGER NOT NULL DEFAULT 0,
    "avg_response_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_resolution_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "first_contact_resolution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customer_satisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "sla_compliance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active_tickets" INTEGER NOT NULL DEFAULT 0,
    "hours_worked_today" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours_worked_this_week" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours_worked_this_month" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_ticket_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" "TicketCategory" NOT NULL,
    "assigned_to" UUID,
    "assigned_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" UUID,
    "customer_id" UUID NOT NULL,
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(20),
    "order_id" UUID,
    "merchant_id" UUID,
    "courier_id" UUID,
    "sla_deadline" TIMESTAMP(3),
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "first_response_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_metrics_user_id_key" ON "agent_metrics"("user_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_priority_idx" ON "tickets"("priority");

-- CreateIndex
CREATE INDEX "tickets_assigned_to_idx" ON "tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "tickets_customer_id_idx" ON "tickets"("customer_id");

-- CreateIndex
CREATE INDEX "tickets_created_at_idx" ON "tickets"("created_at");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_id_idx" ON "ticket_messages"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_id_idx" ON "ticket_messages"("sender_id");

-- CreateIndex
CREATE INDEX "ticket_messages_timestamp_idx" ON "ticket_messages"("timestamp");

-- AddForeignKey
ALTER TABLE "agent_metrics" ADD CONSTRAINT "agent_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
