"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const realtime_module_1 = require("./realtime/realtime.module");
const orders_module_1 = require("./orders/orders.module");
const wallet_module_1 = require("./wallet/wallet.module");
const notifications_module_1 = require("./notifications/notifications.module");
const upload_module_1 = require("./upload/upload.module");
const location_module_1 = require("./location/location.module");
const payment_module_1 = require("./payment/payment.module");
const analytics_module_1 = require("./analytics/analytics.module");
const admin_module_1 = require("./admin/admin.module");
const messaging_module_1 = require("./messaging/messaging.module");
const menu_module_1 = require("./menu/menu.module");
const reviews_module_1 = require("./reviews/reviews.module");
const promos_module_1 = require("./promos/promos.module");
const fees_module_1 = require("./fees/fees.module");
const throttle_guard_1 = require("./common/guards/throttle.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            realtime_module_1.RealtimeModule,
            orders_module_1.OrdersModule,
            wallet_module_1.WalletModule,
            notifications_module_1.NotificationsModule,
            upload_module_1.UploadModule,
            location_module_1.LocationModule,
            payment_module_1.PaymentModule,
            analytics_module_1.AnalyticsModule,
            admin_module_1.AdminModule,
            messaging_module_1.MessagingModule,
            menu_module_1.MenuModule,
            reviews_module_1.ReviewsModule,
            promos_module_1.PromosModule,
            fees_module_1.FeesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttle_guard_1.CustomThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map