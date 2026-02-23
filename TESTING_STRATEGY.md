# Pre-Production Testing Strategy

## 🎯 Goal: Test to the Max Before Production

This guide will help you stress-test your Fulccrum backend to ensure it's truly ready for 100K+ users.

---

## Testing Levels

### 1. Unit Testing (Code Level)
### 2. Integration Testing (API Level)
### 3. Load Testing (Performance Level)
### 4. Stress Testing (Breaking Point)
### 5. Chaos Testing (Failure Scenarios)
### 6. Security Testing (Penetration Testing)

---

# 1️⃣ Unit Testing

## What to Test
- Individual functions and methods
- Business logic
- Edge cases

## Setup

```bash
cd backend

# Install testing dependencies
npm install --save-dev @nestjs/testing jest @types/jest supertest

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Example Tests

### Test Stock Tracking
```typescript
// backend/src/orders/orders.service.spec.ts
describe('OrdersService - Stock Tracking', () => {
  it('should prevent order when stock insufficient', async () => {
    // Setup: Item with 5 stock
    await prisma.inventory.create({
      data: { itemId: 'item-1', currentStock: 5 }
    });

    // Try to order 10 items
    await expect(
      ordersService.createOrder({
        items: [{ menuItemId: 'item-1', quantity: 10 }]
      })
    ).rejects.toThrow('Insufficient stock');
  });

  it('should decrement stock atomically', async () => {
    // Setup: Item with 10 stock
    await prisma.inventory.create({
      data: { itemId: 'item-1', currentStock: 10 }
    });

    // Order 3 items
    await ordersService.createOrder({
      items: [{ menuItemId: 'item-1', quantity: 3 }]
    });

    // Verify stock decreased
    const inventory = await prisma.inventory.findUnique({
      where: { itemId: 'item-1' }
    });
    expect(inventory.currentStock).toBe(7);
  });

  it('should restore stock on cancellation', async () => {
    // Create order
    const order = await ordersService.createOrder({
      items: [{ menuItemId: 'item-1', quantity: 3 }]
    });

    // Cancel order
    await ordersService.cancelOrder(order.id);

    // Verify stock restored
    const inventory = await prisma.inventory.findUnique({
      where: { itemId: 'item-1' }
    });
    expect(inventory.currentStock).toBe(10);
  });
});
```

### Test Payment Idempotency
```typescript
// backend/src/payment/payment.service.spec.ts (already created)
describe('PaymentService - Idempotency', () => {
  it('should return cached response for duplicate request', async () => {
    const key = 'test-key-123';
    
    // First request
    const result1 = await paymentService.initializePayment(
      { orderId: 'order-1', amount: 5000 },
      key
    );

    // Second request with same key
    const result2 = await paymentService.initializePayment(
      { orderId: 'order-1', amount: 5000 },
      key
    );

    // Should return same result
    expect(result1).toEqual(result2);
    
    // Paystack should only be called once
    expect(paystackService.initializeTransaction).toHaveBeenCalledTimes(1);
  });
});
```

### Test Caching
```typescript
// backend/src/menu/menu.service.spec.ts
describe('MenuService - Caching', () => {
  it('should cache menu categories', async () => {
    // First call - cache miss
    const result1 = await menuService.getCategories('business-1');
    
    // Second call - cache hit
    const result2 = await menuService.getCategories('business-1');
    
    // Should return same data
    expect(result1).toEqual(result2);
    
    // Database should only be queried once
    expect(prisma.menuCategory.findMany).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache on update', async () => {
    // Get categories (cached)
    await menuService.getCategories('business-1');
    
    // Update category
    await menuService.updateCategory('cat-1', { name: 'New Name' });
    
    // Get categories again - should query DB
    await menuService.getCategories('business-1');
    
    // Database should be queried twice
    expect(prisma.menuCategory.findMany).toHaveBeenCalledTimes(2);
  });
});
```

---

# 2️⃣ Integration Testing

## What to Test
- API endpoints end-to-end
- Database interactions
- External service integrations

## Setup

```bash
# Install Artillery for API testing
npm install -g artillery

# Or use k6
brew install k6  # macOS
# or download from https://k6.io/
```

## Test Critical Flows

### Test User Registration Flow
```bash
# Create test script
cat > test-registration.yml << 'EOF'
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "User Registration"
    flow:
      - post:
          url: "/auth/register"
          json:
            email: "test{{ $randomNumber() }}@example.com"
            password: "Test123!"
            firstName: "Test"
            lastName: "User"
            phone: "+234{{ $randomNumber() }}"
          capture:
            - json: "$.userId"
              as: "userId"
      - think: 2
      - post:
          url: "/auth/verify-registration"
          json:
            userId: "{{ userId }}"
            otp: "123456"
EOF

# Run test
artillery run test-registration.yml
```

### Test Order Creation Flow
```bash
cat > test-order-flow.yml << 'EOF'
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 20
scenarios:
  - name: "Complete Order Flow"
    flow:
      # Login
      - post:
          url: "/auth/login"
          json:
            email: "customer@test.com"
            password: "Test123!"
          capture:
            - json: "$.accessToken"
              as: "token"
      
      # Browse menu
      - get:
          url: "/api/menu/business/{{ businessId }}/categories"
          headers:
            Authorization: "Bearer {{ token }}"
      
      # Create order
      - post:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            businessId: "{{ businessId }}"
            items:
              - menuItemId: "{{ itemId }}"
                quantity: 2
          capture:
            - json: "$.id"
              as: "orderId"
      
      # Initialize payment
      - post:
          url: "/api/payment/initialize"
          headers:
            Authorization: "Bearer {{ token }}"
            Idempotency-Key: "order-{{ orderId }}-{{ $timestamp }}"
          json:
            orderId: "{{ orderId }}"
            amount: 5000
EOF

artillery run test-order-flow.yml
```

### Test Location Updates
```bash
cat > test-location-updates.yml << 'EOF'
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 100  # 100 riders/second
scenarios:
  - name: "Driver Location Updates"
    flow:
      - post:
          url: "/api/location/update"
          headers:
            Authorization: "Bearer {{ driverToken }}"
          json:
            latitude: "{{ $randomNumber(6, 7) }}"
            longitude: "{{ $randomNumber(3, 4) }}"
            accuracy: 10
            heading: "{{ $randomNumber(0, 360) }}"
            speed: "{{ $randomNumber(0, 60) }}"
EOF

artillery run test-location-updates.yml
```

---

# 3️⃣ Load Testing

## Goal: Simulate Real Production Load

### Install k6 (Better for Load Testing)

```bash
# Install k6
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Load Test Script

```javascript
// backend/tests/load/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    errors: ['rate<0.1'],              // Custom error rate under 10%
  },
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  // Test 1: Health Check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Menu Loading (Cached)
  res = http.get(`${BASE_URL}/api/menu/business/test-business/categories`);
  check(res, {
    'menu load status 200': (r) => r.status === 200,
    'menu load time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Login
  const loginPayload = JSON.stringify({
    email: `test${Math.floor(Math.random() * 1000)}@example.com`,
    password: 'Test123!',
  });

  res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status 200 or 401': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(2);

  // Test 4: Location Update (if driver)
  const locationPayload = JSON.stringify({
    latitude: 6.5 + Math.random(),
    longitude: 3.3 + Math.random(),
    accuracy: 10,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 60),
  });

  res = http.post(`${BASE_URL}/api/location/update`, locationPayload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    },
  });

  check(res, {
    'location update processed': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);
}
```

### Run Load Test

```bash
cd backend/tests/load

# Run load test
k6 run load-test.js

# Run with custom duration
k6 run --duration 10m --vus 500 load-test.js

# Run and save results
k6 run --out json=results.json load-test.js
```

### Expected Results

```
✓ health check status 200
✓ menu load status 200
✓ menu load time < 100ms
✓ login status 200 or 401
✓ location update processed

checks.........................: 95.00% ✓ 95000 ✗ 5000
data_received..................: 50 MB  100 kB/s
data_sent......................: 25 MB  50 kB/s
http_req_duration..............: avg=150ms min=10ms med=100ms max=2s p(95)=400ms
http_req_failed................: 0.50%  ✓ 500   ✗ 99500
http_reqs......................: 100000 200/s
iteration_duration.............: avg=5s
vus............................: 1000
vus_max........................: 1000
```

---

# 4️⃣ Stress Testing

## Goal: Find the Breaking Point

### Stress Test Script

```javascript
// backend/tests/stress/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 2000 },   // Push it!
    { duration: '5m', target: 5000 },   // Push harder!
    { duration: '10m', target: 10000 }, // Break it!
    { duration: '3m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

### Run Stress Test

```bash
k6 run stress-test.js
```

### What to Monitor During Stress Test

```bash
# Terminal 1: Watch backend logs
pm2 logs fulccrum-backend --lines 100

# Terminal 2: Monitor database
watch -n 1 'psql $DATABASE_URL -c "SELECT count(*) as connections FROM pg_stat_activity;"'

# Terminal 3: Monitor Redis
watch -n 1 'redis-cli INFO stats | grep total_commands_processed'

# Terminal 4: Monitor system resources
htop
```

### Signs of Breaking Point
- Response time > 2 seconds
- Error rate > 5%
- Database connections maxed out
- Redis memory full
- CPU at 100%
- Memory swapping

---

# 5️⃣ Chaos Testing

## Goal: Test Failure Scenarios

### Test Database Failure

```bash
# Stop database
docker-compose stop postgres

# App should:
# - Return 503 errors gracefully
# - Not crash
# - Reconnect when DB comes back

# Start database
docker-compose start postgres

# Verify app recovers
curl http://localhost:3001/health/database
```

### Test Redis Failure

```bash
# Stop Redis
docker-compose stop redis

# App should:
# - Continue working (cache misses)
# - Degrade gracefully
# - Not crash

# Start Redis
docker-compose start redis

# Verify caching resumes
curl http://localhost:3001/health/cache
```

### Test Queue Failure

```bash
# Fill queue with failed jobs
# Simulate email service down

# App should:
# - Retry 3 times
# - Move to failed queue
# - Not block API requests
# - Alert on too many failures

# Check queue stats
curl http://localhost:3001/health/queue
```

### Test Network Latency

```bash
# Install toxiproxy
docker run -d --name toxiproxy -p 8474:8474 -p 5432:5432 shopify/toxiproxy

# Add latency to database
toxiproxy-cli create -l localhost:5432 -u postgres:5432 postgres
toxiproxy-cli toxic add -t latency -a latency=1000 postgres

# App should:
# - Handle slow queries
# - Timeout appropriately
# - Not hang indefinitely
```

---

# 6️⃣ Security Testing

## Test Authentication

```bash
# Test rate limiting
for i in {1..100}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done

# Should get 429 Too Many Requests after 5 attempts
```

## Test Account Lockout

```bash
# Try 5 failed logins
for i in {1..5}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  sleep 1
done

# 6th attempt should be locked
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"correct"}'

# Should return: "Account locked for 15 minutes"
```

## Test SQL Injection

```bash
# Try SQL injection in login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"anything"}'

# Should be safely handled by Prisma ORM
```

## Test Payment Idempotency

```bash
# Send same payment request twice
IDEMPOTENCY_KEY="test-$(date +%s)"

# First request
curl -X POST http://localhost:3001/api/payment/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"order-123","amount":5000}'

# Second request (should return cached response)
curl -X POST http://localhost:3001/api/payment/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"order-123","amount":5000}'

# Should return same response, Paystack called only once
```

---

# 7️⃣ Race Condition Testing

## Test Concurrent Orders (Stock)

```javascript
// backend/tests/race/concurrent-orders.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    concurrent_orders: {
      executor: 'shared-iterations',
      vus: 10,              // 10 users
      iterations: 10,       // 10 orders total
      maxDuration: '30s',
    },
  },
};

const BASE_URL = 'http://localhost:3001';
const TOKEN = 'your-test-token';

export default function () {
  // All 10 users try to order the last 5 items simultaneously
  const res = http.post(
    `${BASE_URL}/api/orders`,
    JSON.stringify({
      businessId: 'test-business',
      items: [
        { menuItemId: 'last-item', quantity: 1 }
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
    }
  );

  check(res, {
    'order created or stock insufficient': (r) => 
      r.status === 201 || 
      (r.status === 400 && r.body.includes('Insufficient stock')),
  });
}
```

### Expected Result
- Only 5 orders succeed (stock available)
- 5 orders fail with "Insufficient stock"
- No negative stock
- No race conditions

---

# 8️⃣ Performance Benchmarking

## Benchmark Critical Operations

```bash
# Create benchmark script
cat > benchmark.sh << 'EOF'
#!/bin/bash

echo "=== Performance Benchmarks ==="

# 1. Menu Loading
echo "1. Menu Loading (should be < 10ms with cache)"
time curl -s http://localhost:3001/api/menu/business/test/categories > /dev/null

# 2. Health Check
echo "2. Health Check (should be < 50ms)"
time curl -s http://localhost:3001/health > /dev/null

# 3. Location Update
echo "3. Location Update (should be < 100ms)"
time curl -s -X POST http://localhost:3001/api/location/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"latitude":6.5,"longitude":3.3,"accuracy":10}' > /dev/null

# 4. Order Creation
echo "4. Order Creation (should be < 500ms)"
time curl -s -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"businessId":"test","items":[{"menuItemId":"item1","quantity":1}]}' > /dev/null

echo "=== Benchmarks Complete ==="
EOF

chmod +x benchmark.sh
./benchmark.sh
```

---

# 9️⃣ Monitoring During Tests

## Set Up Monitoring Dashboard

```bash
# Install monitoring tools
npm install -g clinic

# Profile your app
clinic doctor -- node dist/main.js

# Or use built-in Node profiler
node --prof dist/main.js

# Process profiler output
node --prof-process isolate-*.log > profile.txt
```

## Monitor Key Metrics

```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

while true; do
  clear
  echo "=== System Monitoring ==="
  echo ""
  
  # Health checks
  echo "Health Status:"
  curl -s http://localhost:3001/health/all | jq '.services'
  
  echo ""
  echo "Queue Stats:"
  curl -s http://localhost:3001/health/queue | jq '.queues'
  
  echo ""
  echo "Cache Stats:"
  curl -s http://localhost:3001/health/cache | jq
  
  echo ""
  echo "Database Connections:"
  psql $DATABASE_URL -t -c "SELECT count(*) FROM pg_stat_activity;"
  
  echo ""
  echo "Redis Memory:"
  redis-cli INFO memory | grep used_memory_human
  
  sleep 5
done
EOF

chmod +x monitor.sh
./monitor.sh
```

---

# 🎯 Pre-Production Testing Checklist

## Week Before Launch

### Day 1-2: Unit & Integration Tests
- [ ] All unit tests passing
- [ ] Integration tests for critical flows
- [ ] Test coverage > 70%
- [ ] No console errors or warnings

### Day 3-4: Load Testing
- [ ] Load test with 100 concurrent users
- [ ] Load test with 500 concurrent users
- [ ] Load test with 1000 concurrent users
- [ ] All tests pass with < 1% error rate
- [ ] P95 response time < 500ms

### Day 5: Stress Testing
- [ ] Find breaking point (users)
- [ ] Find breaking point (requests/sec)
- [ ] Document maximum capacity
- [ ] Plan scaling strategy

### Day 6: Chaos Testing
- [ ] Test database failure recovery
- [ ] Test Redis failure graceful degradation
- [ ] Test queue failure handling
- [ ] Test network latency tolerance

### Day 7: Security Testing
- [ ] Test rate limiting
- [ ] Test account lockout
- [ ] Test payment idempotency
- [ ] Test SQL injection protection
- [ ] Test XSS protection
- [ ] Test CSRF protection

## Launch Day Checklist

- [ ] All tests passing
- [ ] Load test completed successfully
- [ ] Monitoring dashboards set up
- [ ] Alerts configured
- [ ] Rollback plan tested
- [ ] Team briefed
- [ ] Support team ready
- [ ] Status page ready

---

# 📊 Success Criteria

Your app is ready for production if:

✅ **Unit Tests:** 100% critical paths covered  
✅ **Load Tests:** Handles 1000 concurrent users  
✅ **Error Rate:** < 1% under load  
✅ **Response Time:** P95 < 500ms  
✅ **Stock Tracking:** No race conditions  
✅ **Payment:** No duplicates under load  
✅ **Caching:** > 80% hit rate  
✅ **Queue:** Processing < 5s  
✅ **Recovery:** Graceful degradation on failures  
✅ **Security:** All attacks blocked  

---

# 🚀 Quick Start Testing

```bash
# 1. Install tools
npm install -g artillery k6

# 2. Run unit tests
cd backend
npm test

# 3. Run integration tests
artillery run test-order-flow.yml

# 4. Run load test
k6 run load-test.js

# 5. Monitor during tests
./monitor.sh

# 6. Review results
cat results.json | jq
```

---

**Testing Time Estimate:** 5-7 days  
**Team Required:** 2-3 engineers  
**Cost:** $0 (all tools free)  
**Confidence Level After:** 95%+  

Your app will be battle-tested and production-ready! 🛡️
