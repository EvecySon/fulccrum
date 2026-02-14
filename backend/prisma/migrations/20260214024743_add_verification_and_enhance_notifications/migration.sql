-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'order';
ALTER TYPE "NotificationType" ADD VALUE 'promo';
ALTER TYPE "NotificationType" ADD VALUE 'earnings';
ALTER TYPE "NotificationType" ADD VALUE 'system';
ALTER TYPE "NotificationType" ADD VALUE 'quest';
ALTER TYPE "NotificationType" ADD VALUE 'safety';
ALTER TYPE "NotificationType" ADD VALUE 'document';

-- CreateTable
CREATE TABLE "verification_attempts" (
    "id" UUID NOT NULL,
    "courier_id" UUID NOT NULL,
    "photo_url" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_attempts_courier_id_created_at_idx" ON "verification_attempts"("courier_id", "created_at");

-- AddForeignKey
ALTER TABLE "verification_attempts" ADD CONSTRAINT "verification_attempts_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
