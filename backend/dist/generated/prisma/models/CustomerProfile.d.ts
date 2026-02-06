import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type CustomerProfileModel = runtime.Types.Result.DefaultSelection<Prisma.$CustomerProfilePayload>;
export type AggregateCustomerProfile = {
    _count: CustomerProfileCountAggregateOutputType | null;
    _avg: CustomerProfileAvgAggregateOutputType | null;
    _sum: CustomerProfileSumAggregateOutputType | null;
    _min: CustomerProfileMinAggregateOutputType | null;
    _max: CustomerProfileMaxAggregateOutputType | null;
};
export type CustomerProfileAvgAggregateOutputType = {
    loyaltyPoints: number | null;
    totalOrders: number | null;
    totalSpent: runtime.Decimal | null;
};
export type CustomerProfileSumAggregateOutputType = {
    loyaltyPoints: number | null;
    totalOrders: number | null;
    totalSpent: runtime.Decimal | null;
};
export type CustomerProfileMinAggregateOutputType = {
    userId: string | null;
    defaultAddressId: string | null;
    loyaltyPoints: number | null;
    loyaltyTier: string | null;
    totalOrders: number | null;
    totalSpent: runtime.Decimal | null;
};
export type CustomerProfileMaxAggregateOutputType = {
    userId: string | null;
    defaultAddressId: string | null;
    loyaltyPoints: number | null;
    loyaltyTier: string | null;
    totalOrders: number | null;
    totalSpent: runtime.Decimal | null;
};
export type CustomerProfileCountAggregateOutputType = {
    userId: number;
    defaultAddressId: number;
    preferences: number;
    loyaltyPoints: number;
    loyaltyTier: number;
    totalOrders: number;
    totalSpent: number;
    _all: number;
};
export type CustomerProfileAvgAggregateInputType = {
    loyaltyPoints?: true;
    totalOrders?: true;
    totalSpent?: true;
};
export type CustomerProfileSumAggregateInputType = {
    loyaltyPoints?: true;
    totalOrders?: true;
    totalSpent?: true;
};
export type CustomerProfileMinAggregateInputType = {
    userId?: true;
    defaultAddressId?: true;
    loyaltyPoints?: true;
    loyaltyTier?: true;
    totalOrders?: true;
    totalSpent?: true;
};
export type CustomerProfileMaxAggregateInputType = {
    userId?: true;
    defaultAddressId?: true;
    loyaltyPoints?: true;
    loyaltyTier?: true;
    totalOrders?: true;
    totalSpent?: true;
};
export type CustomerProfileCountAggregateInputType = {
    userId?: true;
    defaultAddressId?: true;
    preferences?: true;
    loyaltyPoints?: true;
    loyaltyTier?: true;
    totalOrders?: true;
    totalSpent?: true;
    _all?: true;
};
export type CustomerProfileAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomerProfileWhereInput;
    orderBy?: Prisma.CustomerProfileOrderByWithRelationInput | Prisma.CustomerProfileOrderByWithRelationInput[];
    cursor?: Prisma.CustomerProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | CustomerProfileCountAggregateInputType;
    _avg?: CustomerProfileAvgAggregateInputType;
    _sum?: CustomerProfileSumAggregateInputType;
    _min?: CustomerProfileMinAggregateInputType;
    _max?: CustomerProfileMaxAggregateInputType;
};
export type GetCustomerProfileAggregateType<T extends CustomerProfileAggregateArgs> = {
    [P in keyof T & keyof AggregateCustomerProfile]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCustomerProfile[P]> : Prisma.GetScalarType<T[P], AggregateCustomerProfile[P]>;
};
export type CustomerProfileGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomerProfileWhereInput;
    orderBy?: Prisma.CustomerProfileOrderByWithAggregationInput | Prisma.CustomerProfileOrderByWithAggregationInput[];
    by: Prisma.CustomerProfileScalarFieldEnum[] | Prisma.CustomerProfileScalarFieldEnum;
    having?: Prisma.CustomerProfileScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CustomerProfileCountAggregateInputType | true;
    _avg?: CustomerProfileAvgAggregateInputType;
    _sum?: CustomerProfileSumAggregateInputType;
    _min?: CustomerProfileMinAggregateInputType;
    _max?: CustomerProfileMaxAggregateInputType;
};
export type CustomerProfileGroupByOutputType = {
    userId: string;
    defaultAddressId: string | null;
    preferences: runtime.JsonValue;
    loyaltyPoints: number;
    loyaltyTier: string;
    totalOrders: number;
    totalSpent: runtime.Decimal;
    _count: CustomerProfileCountAggregateOutputType | null;
    _avg: CustomerProfileAvgAggregateOutputType | null;
    _sum: CustomerProfileSumAggregateOutputType | null;
    _min: CustomerProfileMinAggregateOutputType | null;
    _max: CustomerProfileMaxAggregateOutputType | null;
};
type GetCustomerProfileGroupByPayload<T extends CustomerProfileGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CustomerProfileGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CustomerProfileGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CustomerProfileGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CustomerProfileGroupByOutputType[P]>;
}>>;
export type CustomerProfileWhereInput = {
    AND?: Prisma.CustomerProfileWhereInput | Prisma.CustomerProfileWhereInput[];
    OR?: Prisma.CustomerProfileWhereInput[];
    NOT?: Prisma.CustomerProfileWhereInput | Prisma.CustomerProfileWhereInput[];
    userId?: Prisma.UuidFilter<"CustomerProfile"> | string;
    defaultAddressId?: Prisma.UuidNullableFilter<"CustomerProfile"> | string | null;
    preferences?: Prisma.JsonFilter<"CustomerProfile">;
    loyaltyPoints?: Prisma.IntFilter<"CustomerProfile"> | number;
    loyaltyTier?: Prisma.StringFilter<"CustomerProfile"> | string;
    totalOrders?: Prisma.IntFilter<"CustomerProfile"> | number;
    totalSpent?: Prisma.DecimalFilter<"CustomerProfile"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type CustomerProfileOrderByWithRelationInput = {
    userId?: Prisma.SortOrder;
    defaultAddressId?: Prisma.SortOrderInput | Prisma.SortOrder;
    preferences?: Prisma.SortOrder;
    loyaltyPoints?: Prisma.SortOrder;
    loyaltyTier?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type CustomerProfileWhereUniqueInput = Prisma.AtLeast<{
    userId?: string;
    AND?: Prisma.CustomerProfileWhereInput | Prisma.CustomerProfileWhereInput[];
    OR?: Prisma.CustomerProfileWhereInput[];
    NOT?: Prisma.CustomerProfileWhereInput | Prisma.CustomerProfileWhereInput[];
    defaultAddressId?: Prisma.UuidNullableFilter<"CustomerProfile"> | string | null;
    preferences?: Prisma.JsonFilter<"CustomerProfile">;
    loyaltyPoints?: Prisma.IntFilter<"CustomerProfile"> | number;
    loyaltyTier?: Prisma.StringFilter<"CustomerProfile"> | string;
    totalOrders?: Prisma.IntFilter<"CustomerProfile"> | number;
    totalSpent?: Prisma.DecimalFilter<"CustomerProfile"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "userId">;
export type CustomerProfileOrderByWithAggregationInput = {
    userId?: Prisma.SortOrder;
    defaultAddressId?: Prisma.SortOrderInput | Prisma.SortOrder;
    preferences?: Prisma.SortOrder;
    loyaltyPoints?: Prisma.SortOrder;
    loyaltyTier?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
    _count?: Prisma.CustomerProfileCountOrderByAggregateInput;
    _avg?: Prisma.CustomerProfileAvgOrderByAggregateInput;
    _max?: Prisma.CustomerProfileMaxOrderByAggregateInput;
    _min?: Prisma.CustomerProfileMinOrderByAggregateInput;
    _sum?: Prisma.CustomerProfileSumOrderByAggregateInput;
};
export type CustomerProfileScalarWhereWithAggregatesInput = {
    AND?: Prisma.CustomerProfileScalarWhereWithAggregatesInput | Prisma.CustomerProfileScalarWhereWithAggregatesInput[];
    OR?: Prisma.CustomerProfileScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CustomerProfileScalarWhereWithAggregatesInput | Prisma.CustomerProfileScalarWhereWithAggregatesInput[];
    userId?: Prisma.UuidWithAggregatesFilter<"CustomerProfile"> | string;
    defaultAddressId?: Prisma.UuidNullableWithAggregatesFilter<"CustomerProfile"> | string | null;
    preferences?: Prisma.JsonWithAggregatesFilter<"CustomerProfile">;
    loyaltyPoints?: Prisma.IntWithAggregatesFilter<"CustomerProfile"> | number;
    loyaltyTier?: Prisma.StringWithAggregatesFilter<"CustomerProfile"> | string;
    totalOrders?: Prisma.IntWithAggregatesFilter<"CustomerProfile"> | number;
    totalSpent?: Prisma.DecimalWithAggregatesFilter<"CustomerProfile"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileCreateInput = {
    defaultAddressId?: string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    user: Prisma.UserCreateNestedOneWithoutCustomerProfileInput;
};
export type CustomerProfileUncheckedCreateInput = {
    userId: string;
    defaultAddressId?: string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileUpdateInput = {
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    user?: Prisma.UserUpdateOneRequiredWithoutCustomerProfileNestedInput;
};
export type CustomerProfileUncheckedUpdateInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileCreateManyInput = {
    userId: string;
    defaultAddressId?: string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileUpdateManyMutationInput = {
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileUncheckedUpdateManyInput = {
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileNullableScalarRelationFilter = {
    is?: Prisma.CustomerProfileWhereInput | null;
    isNot?: Prisma.CustomerProfileWhereInput | null;
};
export type CustomerProfileCountOrderByAggregateInput = {
    userId?: Prisma.SortOrder;
    defaultAddressId?: Prisma.SortOrder;
    preferences?: Prisma.SortOrder;
    loyaltyPoints?: Prisma.SortOrder;
    loyaltyTier?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
};
export type CustomerProfileAvgOrderByAggregateInput = {
    loyaltyPoints?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
};
export type CustomerProfileMaxOrderByAggregateInput = {
    userId?: Prisma.SortOrder;
    defaultAddressId?: Prisma.SortOrder;
    loyaltyPoints?: Prisma.SortOrder;
    loyaltyTier?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
};
export type CustomerProfileMinOrderByAggregateInput = {
    userId?: Prisma.SortOrder;
    defaultAddressId?: Prisma.SortOrder;
    loyaltyPoints?: Prisma.SortOrder;
    loyaltyTier?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
};
export type CustomerProfileSumOrderByAggregateInput = {
    loyaltyPoints?: Prisma.SortOrder;
    totalOrders?: Prisma.SortOrder;
    totalSpent?: Prisma.SortOrder;
};
export type CustomerProfileCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.CustomerProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.CustomerProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.CustomerProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.CustomerProfileUpsertWithoutUserInput;
    disconnect?: Prisma.CustomerProfileWhereInput | boolean;
    delete?: Prisma.CustomerProfileWhereInput | boolean;
    connect?: Prisma.CustomerProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CustomerProfileUpdateToOneWithWhereWithoutUserInput, Prisma.CustomerProfileUpdateWithoutUserInput>, Prisma.CustomerProfileUncheckedUpdateWithoutUserInput>;
};
export type CustomerProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.CustomerProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.CustomerProfileUpsertWithoutUserInput;
    disconnect?: Prisma.CustomerProfileWhereInput | boolean;
    delete?: Prisma.CustomerProfileWhereInput | boolean;
    connect?: Prisma.CustomerProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.CustomerProfileUpdateToOneWithWhereWithoutUserInput, Prisma.CustomerProfileUpdateWithoutUserInput>, Prisma.CustomerProfileUncheckedUpdateWithoutUserInput>;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileCreateWithoutUserInput = {
    defaultAddressId?: string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileUncheckedCreateWithoutUserInput = {
    defaultAddressId?: string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    totalOrders?: number;
    totalSpent?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileCreateOrConnectWithoutUserInput = {
    where: Prisma.CustomerProfileWhereUniqueInput;
    create: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
};
export type CustomerProfileUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.CustomerProfileUpdateWithoutUserInput, Prisma.CustomerProfileUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.CustomerProfileCreateWithoutUserInput, Prisma.CustomerProfileUncheckedCreateWithoutUserInput>;
    where?: Prisma.CustomerProfileWhereInput;
};
export type CustomerProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.CustomerProfileWhereInput;
    data: Prisma.XOR<Prisma.CustomerProfileUpdateWithoutUserInput, Prisma.CustomerProfileUncheckedUpdateWithoutUserInput>;
};
export type CustomerProfileUpdateWithoutUserInput = {
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileUncheckedUpdateWithoutUserInput = {
    defaultAddressId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    preferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    loyaltyPoints?: Prisma.IntFieldUpdateOperationsInput | number;
    loyaltyTier?: Prisma.StringFieldUpdateOperationsInput | string;
    totalOrders?: Prisma.IntFieldUpdateOperationsInput | number;
    totalSpent?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type CustomerProfileSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    userId?: boolean;
    defaultAddressId?: boolean;
    preferences?: boolean;
    loyaltyPoints?: boolean;
    loyaltyTier?: boolean;
    totalOrders?: boolean;
    totalSpent?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customerProfile"]>;
export type CustomerProfileSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    userId?: boolean;
    defaultAddressId?: boolean;
    preferences?: boolean;
    loyaltyPoints?: boolean;
    loyaltyTier?: boolean;
    totalOrders?: boolean;
    totalSpent?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customerProfile"]>;
export type CustomerProfileSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    userId?: boolean;
    defaultAddressId?: boolean;
    preferences?: boolean;
    loyaltyPoints?: boolean;
    loyaltyTier?: boolean;
    totalOrders?: boolean;
    totalSpent?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["customerProfile"]>;
export type CustomerProfileSelectScalar = {
    userId?: boolean;
    defaultAddressId?: boolean;
    preferences?: boolean;
    loyaltyPoints?: boolean;
    loyaltyTier?: boolean;
    totalOrders?: boolean;
    totalSpent?: boolean;
};
export type CustomerProfileOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"userId" | "defaultAddressId" | "preferences" | "loyaltyPoints" | "loyaltyTier" | "totalOrders" | "totalSpent", ExtArgs["result"]["customerProfile"]>;
export type CustomerProfileInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type CustomerProfileIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type CustomerProfileIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $CustomerProfilePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CustomerProfile";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        userId: string;
        defaultAddressId: string | null;
        preferences: runtime.JsonValue;
        loyaltyPoints: number;
        loyaltyTier: string;
        totalOrders: number;
        totalSpent: runtime.Decimal;
    }, ExtArgs["result"]["customerProfile"]>;
    composites: {};
};
export type CustomerProfileGetPayload<S extends boolean | null | undefined | CustomerProfileDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload, S>;
export type CustomerProfileCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CustomerProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CustomerProfileCountAggregateInputType | true;
};
export interface CustomerProfileDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CustomerProfile'];
        meta: {
            name: 'CustomerProfile';
        };
    };
    findUnique<T extends CustomerProfileFindUniqueArgs>(args: Prisma.SelectSubset<T, CustomerProfileFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends CustomerProfileFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CustomerProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends CustomerProfileFindFirstArgs>(args?: Prisma.SelectSubset<T, CustomerProfileFindFirstArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends CustomerProfileFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CustomerProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends CustomerProfileFindManyArgs>(args?: Prisma.SelectSubset<T, CustomerProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends CustomerProfileCreateArgs>(args: Prisma.SelectSubset<T, CustomerProfileCreateArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends CustomerProfileCreateManyArgs>(args?: Prisma.SelectSubset<T, CustomerProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends CustomerProfileCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CustomerProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends CustomerProfileDeleteArgs>(args: Prisma.SelectSubset<T, CustomerProfileDeleteArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends CustomerProfileUpdateArgs>(args: Prisma.SelectSubset<T, CustomerProfileUpdateArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends CustomerProfileDeleteManyArgs>(args?: Prisma.SelectSubset<T, CustomerProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends CustomerProfileUpdateManyArgs>(args: Prisma.SelectSubset<T, CustomerProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends CustomerProfileUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CustomerProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends CustomerProfileUpsertArgs>(args: Prisma.SelectSubset<T, CustomerProfileUpsertArgs<ExtArgs>>): Prisma.Prisma__CustomerProfileClient<runtime.Types.Result.GetResult<Prisma.$CustomerProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends CustomerProfileCountArgs>(args?: Prisma.Subset<T, CustomerProfileCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CustomerProfileCountAggregateOutputType> : number>;
    aggregate<T extends CustomerProfileAggregateArgs>(args: Prisma.Subset<T, CustomerProfileAggregateArgs>): Prisma.PrismaPromise<GetCustomerProfileAggregateType<T>>;
    groupBy<T extends CustomerProfileGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CustomerProfileGroupByArgs['orderBy'];
    } : {
        orderBy?: CustomerProfileGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CustomerProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustomerProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: CustomerProfileFieldRefs;
}
export interface Prisma__CustomerProfileClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface CustomerProfileFieldRefs {
    readonly userId: Prisma.FieldRef<"CustomerProfile", 'String'>;
    readonly defaultAddressId: Prisma.FieldRef<"CustomerProfile", 'String'>;
    readonly preferences: Prisma.FieldRef<"CustomerProfile", 'Json'>;
    readonly loyaltyPoints: Prisma.FieldRef<"CustomerProfile", 'Int'>;
    readonly loyaltyTier: Prisma.FieldRef<"CustomerProfile", 'String'>;
    readonly totalOrders: Prisma.FieldRef<"CustomerProfile", 'Int'>;
    readonly totalSpent: Prisma.FieldRef<"CustomerProfile", 'Decimal'>;
}
export type CustomerProfileFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where?: Prisma.CustomerProfileWhereInput;
    orderBy?: Prisma.CustomerProfileOrderByWithRelationInput | Prisma.CustomerProfileOrderByWithRelationInput[];
    cursor?: Prisma.CustomerProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomerProfileScalarFieldEnum | Prisma.CustomerProfileScalarFieldEnum[];
};
export type CustomerProfileFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where?: Prisma.CustomerProfileWhereInput;
    orderBy?: Prisma.CustomerProfileOrderByWithRelationInput | Prisma.CustomerProfileOrderByWithRelationInput[];
    cursor?: Prisma.CustomerProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomerProfileScalarFieldEnum | Prisma.CustomerProfileScalarFieldEnum[];
};
export type CustomerProfileFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where?: Prisma.CustomerProfileWhereInput;
    orderBy?: Prisma.CustomerProfileOrderByWithRelationInput | Prisma.CustomerProfileOrderByWithRelationInput[];
    cursor?: Prisma.CustomerProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomerProfileScalarFieldEnum | Prisma.CustomerProfileScalarFieldEnum[];
};
export type CustomerProfileCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomerProfileCreateInput, Prisma.CustomerProfileUncheckedCreateInput>;
};
export type CustomerProfileCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.CustomerProfileCreateManyInput | Prisma.CustomerProfileCreateManyInput[];
    skipDuplicates?: boolean;
};
export type CustomerProfileCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    data: Prisma.CustomerProfileCreateManyInput | Prisma.CustomerProfileCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.CustomerProfileIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type CustomerProfileUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomerProfileUpdateInput, Prisma.CustomerProfileUncheckedUpdateInput>;
    where: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.CustomerProfileUpdateManyMutationInput, Prisma.CustomerProfileUncheckedUpdateManyInput>;
    where?: Prisma.CustomerProfileWhereInput;
    limit?: number;
};
export type CustomerProfileUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.CustomerProfileUpdateManyMutationInput, Prisma.CustomerProfileUncheckedUpdateManyInput>;
    where?: Prisma.CustomerProfileWhereInput;
    limit?: number;
    include?: Prisma.CustomerProfileIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type CustomerProfileUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where: Prisma.CustomerProfileWhereUniqueInput;
    create: Prisma.XOR<Prisma.CustomerProfileCreateInput, Prisma.CustomerProfileUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.CustomerProfileUpdateInput, Prisma.CustomerProfileUncheckedUpdateInput>;
};
export type CustomerProfileDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
    where: Prisma.CustomerProfileWhereUniqueInput;
};
export type CustomerProfileDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomerProfileWhereInput;
    limit?: number;
};
export type CustomerProfileDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CustomerProfileSelect<ExtArgs> | null;
    omit?: Prisma.CustomerProfileOmit<ExtArgs> | null;
    include?: Prisma.CustomerProfileInclude<ExtArgs> | null;
};
export {};
