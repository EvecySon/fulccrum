-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_address_id" UUID;

-- CreateIndex
CREATE INDEX "orders_delivery_address_id_idx" ON "orders"("delivery_address_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
