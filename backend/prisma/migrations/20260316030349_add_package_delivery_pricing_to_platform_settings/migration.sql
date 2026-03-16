-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN     "base_package_price" DECIMAL(10,2) NOT NULL DEFAULT 500,
ADD COLUMN     "express_speed_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.3,
ADD COLUMN     "package_size_large_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 2.0,
ADD COLUMN     "package_size_medium_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.5,
ADD COLUMN     "package_size_small_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
ADD COLUMN     "peak_hour_surge_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.3,
ADD COLUMN     "per_km_package_rate" DECIMAL(10,2) NOT NULL DEFAULT 100,
ADD COLUMN     "same_day_speed_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
ADD COLUMN     "scheduled_speed_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 0.8,
ADD COLUMN     "weekend_surge_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.2;
