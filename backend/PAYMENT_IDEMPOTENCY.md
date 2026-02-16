# Payment Idempotency Implementation Plan

## Problem Statement
Without idempotency, network retries can cause:
- Double-charging customers
- Double-paying couriers
- Duplicate wallet transactions
- Incorrect financial records

## Solution Architecture

### Layer 1: Redis-Based Idempotency Keys (24-48 hours)
```typescript
// Middleware to check idempotency
async function checkIdempotency(key: string) {
  const cached = await redis.get(`idempotency:${key}`);
  if (cached) {
    return JSON.parse(cached); // Return cached response
  }
  return null;
}

// Store successful response
async function storeIdempotencyResult(key: string, response: any) {
  await redis.setex(
    `idempotency:${key}`,
    172800, // 48 hours (2 days)
    JSON.stringify(response)
  );
}
```

### Layer 2: Database Constraints
```sql
-- Prevent duplicate order payments
ALTER TABLE payments ADD CONSTRAINT unique_order_payment 
  UNIQUE (order_id, payment_reference);

-- Prevent duplicate withdrawals
ALTER TABLE withdrawal_requests ADD CONSTRAINT unique_withdrawal_reference
  UNIQUE (reference);

-- Prevent duplicate wallet transactions
ALTER TABLE wallet_transactions ADD CONSTRAINT unique_transaction_reference
  UNIQUE (reference);
```

### Layer 3: Payment Provider Deduplication
```typescript
// Generate unique reference with timestamp
function generatePaymentReference(orderId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `ORD-${orderId}-${timestamp}-${random}`;
}

// Paystack will reject duplicate references
const payment = await paystack.initializeTransaction({
  reference: generatePaymentReference(order.id),
  amount: order.total * 100,
  email: customer.email,
});
```

### Layer 4: Reconciliation & Monitoring
```typescript
// Daily cron job
@Cron('0 2 * * *') // 2 AM daily
async reconcilePayments() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get all payments from our database
  const ourPayments = await prisma.payment.findMany({
    where: { createdAt: { gte: yesterday } }
  });
  
  // Get all transactions from Paystack
  const paystackTxns = await paystack.listTransactions({
    from: yesterday,
    to: new Date(),
  });
  
  // Compare and detect discrepancies
  const discrepancies = findDiscrepancies(ourPayments, paystackTxns);
  
  if (discrepancies.length > 0) {
    // Alert admin
    await notifyAdmin('Payment discrepancies detected', discrepancies);
    
    // Auto-refund duplicates
    for (const dup of discrepancies.duplicates) {
      await refundDuplicatePayment(dup);
    }
  }
}
```

## Implementation Steps

### Phase 1: Immediate (Critical)
1. Add unique constraints to payment tables
2. Generate unique payment references with timestamps
3. Add basic duplicate detection in payment service

### Phase 2: Short-term (1-2 weeks)
1. Implement Redis-based idempotency middleware
2. Add idempotency key header support (`Idempotency-Key`)
3. Update payment endpoints to use idempotency

### Phase 3: Medium-term (1 month)
1. Implement daily reconciliation job
2. Add payment monitoring dashboard
3. Set up alerts for duplicate transactions

## API Usage

### Client-Side (Frontend)
```typescript
// Generate idempotency key for payment
const idempotencyKey = `${userId}-${orderId}-${Date.now()}`;

const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': idempotencyKey, // Critical header
  },
  body: JSON.stringify({
    orderId: order.id,
    amount: order.total,
  }),
});
```

### Server-Side (Backend)
```typescript
@Post('initialize')
@UseInterceptors(IdempotencyInterceptor) // Check Redis cache
async initializePayment(
  @Body() dto: InitializePaymentDto,
  @Headers('idempotency-key') idempotencyKey?: string,
) {
  // If no key provided, generate one
  const key = idempotencyKey || `${dto.orderId}-${Date.now()}`;
  
  // Check if already processed
  const cached = await this.redis.get(`idempotency:${key}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Process payment
  const result = await this.paymentService.initialize(dto);
  
  // Cache result for 48 hours
  await this.redis.setex(
    `idempotency:${key}`,
    172800,
    JSON.stringify(result)
  );
  
  return result;
}
```

## Edge Cases Handled

### 1. Key Expires After 48 Hours
- **Problem:** Request replayed after key expiry
- **Solution:** Database unique constraint rejects duplicate
- **Fallback:** Paystack rejects duplicate reference

### 2. Redis Failure
- **Problem:** Redis down, can't check cache
- **Solution:** Database constraints still prevent duplicates
- **Monitoring:** Alert if Redis unavailable

### 3. Network Partition
- **Problem:** Client thinks request failed, retries
- **Solution:** Idempotency key returns cached response
- **Result:** No duplicate charge

### 4. Concurrent Requests
- **Problem:** Two identical requests at exact same time
- **Solution:** Redis atomic operations + DB constraints
- **Result:** Only one succeeds

## Monitoring & Alerts

### Metrics to Track
1. **Idempotency Hit Rate** - % of requests using cached responses
2. **Duplicate Attempts** - Requests blocked by idempotency
3. **Reconciliation Discrepancies** - Mismatches with Paystack
4. **Failed Payments** - Track retry patterns

### Alert Triggers
- Duplicate payment detected
- Reconciliation finds discrepancy
- Idempotency hit rate > 10% (unusual retry pattern)
- Redis unavailable

## Cost Analysis

### Storage Requirements
- Average idempotency key: ~500 bytes (JSON response)
- 1000 payments/day × 500 bytes × 2 days = ~1 MB
- Redis cost: Negligible

### Benefits
- Prevent customer complaints
- Avoid refund processing costs
- Maintain financial integrity
- Build customer trust

## Testing Strategy

### Unit Tests
```typescript
describe('Payment Idempotency', () => {
  it('should return cached response for duplicate request', async () => {
    const key = 'test-key-123';
    const dto = { orderId: 'order-1', amount: 5000 };
    
    // First request
    const result1 = await paymentService.initialize(dto, key);
    
    // Duplicate request
    const result2 = await paymentService.initialize(dto, key);
    
    expect(result1).toEqual(result2);
    expect(mockPaystack.initialize).toHaveBeenCalledTimes(1);
  });
  
  it('should reject duplicate payment at database level', async () => {
    const payment = { orderId: 'order-1', reference: 'REF-123' };
    
    await prisma.payment.create({ data: payment });
    
    await expect(
      prisma.payment.create({ data: payment })
    ).rejects.toThrow('Unique constraint violation');
  });
});
```

### Integration Tests
1. Simulate network retry scenarios
2. Test Redis failure fallback
3. Verify reconciliation job accuracy
4. Test concurrent request handling

## Rollout Plan

### Week 1
- Add database constraints
- Update payment reference generation
- Deploy to staging

### Week 2
- Implement Redis idempotency
- Add monitoring
- Test thoroughly in staging

### Week 3
- Deploy to production (gradual rollout)
- Monitor for 7 days
- Collect metrics

### Week 4
- Implement reconciliation job
- Set up alerts
- Document for team

## References

- [Stripe Idempotency Guide](https://stripe.com/docs/api/idempotent_requests)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Redis Best Practices](https://redis.io/topics/lru-cache)

---

**Status:** Not Implemented  
**Priority:** High (Critical for financial integrity)  
**Estimated Effort:** 2-3 weeks  
**Dependencies:** Redis already available in docker-compose
