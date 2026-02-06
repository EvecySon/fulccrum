import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly User: "User";
    readonly CustomerProfile: "CustomerProfile";
    readonly DriverProfile: "DriverProfile";
    readonly BusinessProfile: "BusinessProfile";
    readonly Address: "Address";
    readonly Order: "Order";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "customerProfile" | "driverProfile" | "businessProfile" | "address" | "order";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        CustomerProfile: {
            payload: Prisma.$CustomerProfilePayload<ExtArgs>;
            fields: Prisma.CustomerProfileFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CustomerProfileFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CustomerProfileFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                findFirst: {
                    args: Prisma.CustomerProfileFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CustomerProfileFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                findMany: {
                    args: Prisma.CustomerProfileFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>[];
                };
                create: {
                    args: Prisma.CustomerProfileCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                createMany: {
                    args: Prisma.CustomerProfileCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CustomerProfileCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>[];
                };
                delete: {
                    args: Prisma.CustomerProfileDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                update: {
                    args: Prisma.CustomerProfileUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                deleteMany: {
                    args: Prisma.CustomerProfileDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CustomerProfileUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CustomerProfileUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>[];
                };
                upsert: {
                    args: Prisma.CustomerProfileUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomerProfilePayload>;
                };
                aggregate: {
                    args: Prisma.CustomerProfileAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCustomerProfile>;
                };
                groupBy: {
                    args: Prisma.CustomerProfileGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomerProfileGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CustomerProfileCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomerProfileCountAggregateOutputType> | number;
                };
            };
        };
        DriverProfile: {
            payload: Prisma.$DriverProfilePayload<ExtArgs>;
            fields: Prisma.DriverProfileFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DriverProfileFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DriverProfileFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                findFirst: {
                    args: Prisma.DriverProfileFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DriverProfileFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                findMany: {
                    args: Prisma.DriverProfileFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>[];
                };
                create: {
                    args: Prisma.DriverProfileCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                createMany: {
                    args: Prisma.DriverProfileCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DriverProfileCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>[];
                };
                delete: {
                    args: Prisma.DriverProfileDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                update: {
                    args: Prisma.DriverProfileUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                deleteMany: {
                    args: Prisma.DriverProfileDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DriverProfileUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DriverProfileUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>[];
                };
                upsert: {
                    args: Prisma.DriverProfileUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DriverProfilePayload>;
                };
                aggregate: {
                    args: Prisma.DriverProfileAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDriverProfile>;
                };
                groupBy: {
                    args: Prisma.DriverProfileGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DriverProfileGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DriverProfileCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DriverProfileCountAggregateOutputType> | number;
                };
            };
        };
        BusinessProfile: {
            payload: Prisma.$BusinessProfilePayload<ExtArgs>;
            fields: Prisma.BusinessProfileFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BusinessProfileFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BusinessProfileFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                findFirst: {
                    args: Prisma.BusinessProfileFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BusinessProfileFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                findMany: {
                    args: Prisma.BusinessProfileFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>[];
                };
                create: {
                    args: Prisma.BusinessProfileCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                createMany: {
                    args: Prisma.BusinessProfileCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BusinessProfileCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>[];
                };
                delete: {
                    args: Prisma.BusinessProfileDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                update: {
                    args: Prisma.BusinessProfileUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                deleteMany: {
                    args: Prisma.BusinessProfileDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BusinessProfileUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BusinessProfileUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>[];
                };
                upsert: {
                    args: Prisma.BusinessProfileUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BusinessProfilePayload>;
                };
                aggregate: {
                    args: Prisma.BusinessProfileAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBusinessProfile>;
                };
                groupBy: {
                    args: Prisma.BusinessProfileGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BusinessProfileGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BusinessProfileCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BusinessProfileCountAggregateOutputType> | number;
                };
            };
        };
        Address: {
            payload: Prisma.$AddressPayload<ExtArgs>;
            fields: Prisma.AddressFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AddressFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AddressFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                findFirst: {
                    args: Prisma.AddressFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AddressFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                findMany: {
                    args: Prisma.AddressFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>[];
                };
                create: {
                    args: Prisma.AddressCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                createMany: {
                    args: Prisma.AddressCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AddressCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>[];
                };
                delete: {
                    args: Prisma.AddressDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                update: {
                    args: Prisma.AddressUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                deleteMany: {
                    args: Prisma.AddressDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AddressUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AddressUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>[];
                };
                upsert: {
                    args: Prisma.AddressUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AddressPayload>;
                };
                aggregate: {
                    args: Prisma.AddressAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAddress>;
                };
                groupBy: {
                    args: Prisma.AddressGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AddressGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AddressCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AddressCountAggregateOutputType> | number;
                };
            };
        };
        Order: {
            payload: Prisma.$OrderPayload<ExtArgs>;
            fields: Prisma.OrderFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrderFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                findFirst: {
                    args: Prisma.OrderFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                findMany: {
                    args: Prisma.OrderFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>[];
                };
                create: {
                    args: Prisma.OrderCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                createMany: {
                    args: Prisma.OrderCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>[];
                };
                delete: {
                    args: Prisma.OrderDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                update: {
                    args: Prisma.OrderUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                deleteMany: {
                    args: Prisma.OrderDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrderUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>[];
                };
                upsert: {
                    args: Prisma.OrderUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrderPayload>;
                };
                aggregate: {
                    args: Prisma.OrderAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrder>;
                };
                groupBy: {
                    args: Prisma.OrderGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrderGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrderCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrderCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly email: "email";
    readonly phone: "phone";
    readonly passwordHash: "passwordHash";
    readonly firstName: "firstName";
    readonly lastName: "lastName";
    readonly avatarUrl: "avatarUrl";
    readonly dateOfBirth: "dateOfBirth";
    readonly role: "role";
    readonly status: "status";
    readonly emailVerified: "emailVerified";
    readonly phoneVerified: "phoneVerified";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly lastLogin: "lastLogin";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const CustomerProfileScalarFieldEnum: {
    readonly userId: "userId";
    readonly defaultAddressId: "defaultAddressId";
    readonly preferences: "preferences";
    readonly loyaltyPoints: "loyaltyPoints";
    readonly loyaltyTier: "loyaltyTier";
    readonly totalOrders: "totalOrders";
    readonly totalSpent: "totalSpent";
};
export type CustomerProfileScalarFieldEnum = (typeof CustomerProfileScalarFieldEnum)[keyof typeof CustomerProfileScalarFieldEnum];
export declare const DriverProfileScalarFieldEnum: {
    readonly userId: "userId";
    readonly vehicleType: "vehicleType";
    readonly vehicleMake: "vehicleMake";
    readonly vehicleModel: "vehicleModel";
    readonly vehicleYear: "vehicleYear";
    readonly vehicleColor: "vehicleColor";
    readonly licensePlate: "licensePlate";
    readonly driverLicenseNumber: "driverLicenseNumber";
    readonly backgroundCheckStatus: "backgroundCheckStatus";
    readonly backgroundCheckDate: "backgroundCheckDate";
    readonly insuranceExpiration: "insuranceExpiration";
    readonly rating: "rating";
    readonly totalDeliveries: "totalDeliveries";
    readonly onlineStatus: "onlineStatus";
    readonly lastLocationUpdate: "lastLocationUpdate";
};
export type DriverProfileScalarFieldEnum = (typeof DriverProfileScalarFieldEnum)[keyof typeof DriverProfileScalarFieldEnum];
export declare const BusinessProfileScalarFieldEnum: {
    readonly userId: "userId";
    readonly businessName: "businessName";
    readonly businessType: "businessType";
    readonly description: "description";
    readonly logoUrl: "logoUrl";
    readonly coverImageUrl: "coverImageUrl";
    readonly website: "website";
    readonly phone: "phone";
    readonly email: "email";
    readonly taxId: "taxId";
    readonly businessLicense: "businessLicense";
    readonly verificationStatus: "verificationStatus";
    readonly verificationDate: "verificationDate";
    readonly rating: "rating";
    readonly averagePreparationTime: "averagePreparationTime";
    readonly deliveryFee: "deliveryFee";
    readonly minimumOrderAmount: "minimumOrderAmount";
};
export type BusinessProfileScalarFieldEnum = (typeof BusinessProfileScalarFieldEnum)[keyof typeof BusinessProfileScalarFieldEnum];
export declare const AddressScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly businessId: "businessId";
    readonly label: "label";
    readonly streetAddress: "streetAddress";
    readonly apartment: "apartment";
    readonly city: "city";
    readonly state: "state";
    readonly postalCode: "postalCode";
    readonly country: "country";
    readonly latitude: "latitude";
    readonly longitude: "longitude";
    readonly isDefault: "isDefault";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AddressScalarFieldEnum = (typeof AddressScalarFieldEnum)[keyof typeof AddressScalarFieldEnum];
export declare const OrderScalarFieldEnum: {
    readonly id: "id";
    readonly orderNumber: "orderNumber";
    readonly customerId: "customerId";
    readonly businessId: "businessId";
    readonly driverId: "driverId";
    readonly status: "status";
    readonly subtotal: "subtotal";
    readonly deliveryFee: "deliveryFee";
    readonly serviceFee: "serviceFee";
    readonly taxAmount: "taxAmount";
    readonly tipAmount: "tipAmount";
    readonly discountAmount: "discountAmount";
    readonly totalAmount: "totalAmount";
    readonly placedAt: "placedAt";
    readonly acceptedAt: "acceptedAt";
    readonly preparationStartedAt: "preparationStartedAt";
    readonly readyAt: "readyAt";
    readonly pickedUpAt: "pickedUpAt";
    readonly deliveredAt: "deliveredAt";
    readonly specialInstructions: "specialInstructions";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>;
export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>;
export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>;
export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>;
export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>;
export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>;
export type ListEnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    customerProfile?: Prisma.CustomerProfileOmit;
    driverProfile?: Prisma.DriverProfileOmit;
    businessProfile?: Prisma.BusinessProfileOmit;
    address?: Prisma.AddressOmit;
    order?: Prisma.OrderOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
