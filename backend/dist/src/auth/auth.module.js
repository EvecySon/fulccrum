"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const refresh_token_service_1 = require("./refresh-token.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: async (config) => ({
                    secret: config.get('JWT_SECRET') ?? 'dev-secret',
                    signOptions: {
                        expiresIn: (config.get('JWT_EXPIRES_IN') ?? '1h'),
                        issuer: config.get('JWT_ISSUER') ?? 'delivery-platform',
                        audience: config.get('JWT_AUDIENCE') ?? 'delivery-platform-app',
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, refresh_token_service_1.RefreshTokenService],
        exports: [jwt_1.JwtModule, auth_service_1.AuthService, refresh_token_service_1.RefreshTokenService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map