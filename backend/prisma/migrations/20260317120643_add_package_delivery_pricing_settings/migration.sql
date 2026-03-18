-- AlterTable
ALTER TABLE "platform_settings" ALTER COLUMN "express_speed_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "package_size_large_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "package_size_medium_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "package_size_small_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "peak_hour_surge_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "same_day_speed_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "scheduled_speed_multiplier" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "weekend_surge_multiplier" SET DATA TYPE DECIMAL(5,2);
