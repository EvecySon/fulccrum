-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500),
    "medium_url" VARCHAR(500),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_files_user_id_idx" ON "media_files"("user_id");

-- CreateIndex
CREATE INDEX "media_files_uploaded_at_idx" ON "media_files"("uploaded_at");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
