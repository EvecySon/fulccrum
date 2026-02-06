"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.JsonNullValueInput = exports.SortOrder = exports.OrderScalarFieldEnum = exports.AddressScalarFieldEnum = exports.BusinessProfileScalarFieldEnum = exports.DriverProfileScalarFieldEnum = exports.CustomerProfileScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    CustomerProfile: 'CustomerProfile',
    DriverProfile: 'DriverProfile',
    BusinessProfile: 'BusinessProfile',
    Address: 'Address',
    Order: 'Order'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    phone: 'phone',
    passwordHash: 'passwordHash',
    firstName: 'firstName',
    lastName: 'lastName',
    avatarUrl: 'avatarUrl',
    dateOfBirth: 'dateOfBirth',
    role: 'role',
    status: 'status',
    emailVerified: 'emailVerified',
    phoneVerified: 'phoneVerified',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastLogin: 'lastLogin'
};
exports.CustomerProfileScalarFieldEnum = {
    userId: 'userId',
    defaultAddressId: 'defaultAddressId',
    preferences: 'preferences',
    loyaltyPoints: 'loyaltyPoints',
    loyaltyTier: 'loyaltyTier',
    totalOrders: 'totalOrders',
    totalSpent: 'totalSpent'
};
exports.DriverProfileScalarFieldEnum = {
    userId: 'userId',
    vehicleType: 'vehicleType',
    vehicleMake: 'vehicleMake',
    vehicleModel: 'vehicleModel',
    vehicleYear: 'vehicleYear',
    vehicleColor: 'vehicleColor',
    licensePlate: 'licensePlate',
    driverLicenseNumber: 'driverLicenseNumber',
    backgroundCheckStatus: 'backgroundCheckStatus',
    backgroundCheckDate: 'backgroundCheckDate',
    insuranceExpiration: 'insuranceExpiration',
    rating: 'rating',
    totalDeliveries: 'totalDeliveries',
    onlineStatus: 'onlineStatus',
    lastLocationUpdate: 'lastLocationUpdate'
};
exports.BusinessProfileScalarFieldEnum = {
    userId: 'userId',
    businessName: 'businessName',
    businessType: 'businessType',
    description: 'description',
    logoUrl: 'logoUrl',
    coverImageUrl: 'coverImageUrl',
    website: 'website',
    phone: 'phone',
    email: 'email',
    taxId: 'taxId',
    businessLicense: 'businessLicense',
    verificationStatus: 'verificationStatus',
    verificationDate: 'verificationDate',
    rating: 'rating',
    averagePreparationTime: 'averagePreparationTime',
    deliveryFee: 'deliveryFee',
    minimumOrderAmount: 'minimumOrderAmount'
};
exports.AddressScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    businessId: 'businessId',
    label: 'label',
    streetAddress: 'streetAddress',
    apartment: 'apartment',
    city: 'city',
    state: 'state',
    postalCode: 'postalCode',
    country: 'country',
    latitude: 'latitude',
    longitude: 'longitude',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.OrderScalarFieldEnum = {
    id: 'id',
    orderNumber: 'orderNumber',
    customerId: 'customerId',
    businessId: 'businessId',
    driverId: 'driverId',
    status: 'status',
    subtotal: 'subtotal',
    deliveryFee: 'deliveryFee',
    serviceFee: 'serviceFee',
    taxAmount: 'taxAmount',
    tipAmount: 'tipAmount',
    discountAmount: 'discountAmount',
    totalAmount: 'totalAmount',
    placedAt: 'placedAt',
    acceptedAt: 'acceptedAt',
    preparationStartedAt: 'preparationStartedAt',
    readyAt: 'readyAt',
    pickedUpAt: 'pickedUpAt',
    deliveredAt: 'deliveredAt',
    specialInstructions: 'specialInstructions',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map