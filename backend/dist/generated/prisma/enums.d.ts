export declare const UserRole: {
    readonly customer: "customer";
    readonly business_owner: "business_owner";
    readonly driver: "driver";
    readonly admin: "admin";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserStatus: {
    readonly active: "active";
    readonly inactive: "inactive";
    readonly suspended: "suspended";
    readonly deleted: "deleted";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const OrderStatus: {
    readonly pending: "pending";
    readonly accepted: "accepted";
    readonly rejected: "rejected";
    readonly preparing: "preparing";
    readonly ready: "ready";
    readonly picked_up: "picked_up";
    readonly in_transit: "in_transit";
    readonly delivered: "delivered";
    readonly cancelled: "cancelled";
    readonly refunded: "refunded";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
