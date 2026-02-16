-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "status" VARCHAR(20),
ADD COLUMN     "user_id" UUID,
ALTER COLUMN "admin_user_id" DROP NOT NULL,
ALTER COLUMN "resource_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_locked_until" TIMESTAMP(3),
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_ip_address_created_at_idx" ON "audit_logs"("ip_address", "created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
