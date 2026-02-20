/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `withdrawal_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reference` to the `withdrawal_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "withdrawal_requests" ADD COLUMN     "reference" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_payment_id_key" ON "orders"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_requests_reference_key" ON "withdrawal_requests"("reference");
