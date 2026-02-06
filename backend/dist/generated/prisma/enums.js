"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.UserStatus = exports.UserRole = void 0;
exports.UserRole = {
    customer: 'customer',
    business_owner: 'business_owner',
    driver: 'driver',
    admin: 'admin'
};
exports.UserStatus = {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
    deleted: 'deleted'
};
exports.OrderStatus = {
    pending: 'pending',
    accepted: 'accepted',
    rejected: 'rejected',
    preparing: 'preparing',
    ready: 'ready',
    picked_up: 'picked_up',
    in_transit: 'in_transit',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'refunded'
};
//# sourceMappingURL=enums.js.map