"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermiiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let TermiiService = class TermiiService {
    config;
    apiKey;
    senderId;
    baseUrl = 'https://api.ng.termii.com/api';
    constructor(config) {
        this.config = config;
        this.apiKey = this.config.get('TERMII_API_KEY') || 'your_termii_api_key';
        this.senderId = this.config.get('TERMII_SENDER_ID') || 'Fulccrum';
    }
    async sendSMS(to, message) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/sms/send`, {
                to,
                from: this.senderId,
                sms: message,
                type: 'plain',
                channel: 'generic',
                api_key: this.apiKey,
            });
            console.log(`[TERMII SMS] Sent to ${to}: ${message}`);
            return {
                success: true,
                messageId: response.data.message_id,
                message: 'SMS sent successfully',
            };
        }
        catch (error) {
            console.error('[TERMII SMS] Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }
    async sendOTP(phoneNumber) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.sendSMS(phoneNumber, `Your Fulccrum verification code is: ${otp}. Valid for 10 minutes.`);
        return { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    }
    async sendOrderNotification(phoneNumber, orderNumber, status) {
        const messages = {
            accepted: `Your order ${orderNumber} has been accepted and is being prepared.`,
            preparing: `Your order ${orderNumber} is being prepared by the restaurant.`,
            ready: `Your order ${orderNumber} is ready for pickup!`,
            picked_up: `Your order ${orderNumber} is on the way! Track your delivery in the app.`,
            in_transit: `Your order ${orderNumber} will arrive soon!`,
            delivered: `Your order ${orderNumber} has been delivered. Enjoy your meal!`,
            cancelled: `Your order ${orderNumber} has been cancelled.`,
        };
        const message = messages[status] || `Order ${orderNumber} status: ${status}`;
        return this.sendSMS(phoneNumber, message);
    }
    async sendWithdrawalCode(phoneNumber, code, amount) {
        const message = `Your withdrawal confirmation code is: ${code}. Amount: ₦${amount.toFixed(2)}. Valid for 10 minutes.`;
        return this.sendSMS(phoneNumber, message);
    }
    async sendWelcomeSMS(phoneNumber, firstName) {
        const message = `Welcome to Fulccrum, ${firstName}! Your account has been created successfully. Start ordering delicious food now!`;
        return this.sendSMS(phoneNumber, message);
    }
    async sendDriverAssignment(phoneNumber, orderNumber, driverName) {
        const message = `${driverName} has been assigned to deliver your order ${orderNumber}. You can track the delivery in real-time.`;
        return this.sendSMS(phoneNumber, message);
    }
};
exports.TermiiService = TermiiService;
exports.TermiiService = TermiiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TermiiService);
//# sourceMappingURL=termii.service.js.map