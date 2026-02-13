-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('business_license', 'health_permit', 'owner_id', 'insurance', 'tax_certificate', 'business_logo', 'cover_photo', 'drivers_license', 'vehicle_registration', 'national_id', 'profile_photo', 'guarantor_form');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('uploaded', 'verified', 'rejected', 'expired', 'missing');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'uploaded',
    "rejection_reason" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documents_user_id_type_idx" ON "documents"("user_id", "type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
