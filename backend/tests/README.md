# Testing Guide

## Quick Start

### 1. Install Testing Tools

```bash
# Install k6 for load testing
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

### 2. Run Quick Tests (5 minutes)

```bash
# From project root
chmod +x test-quick.sh
./test-quick.sh

# Or on Windows
test-quick.bat
```

### 3. Run Load Tests (20 minutes)

```bash
cd backend/tests/load
k6 run load-test.js
```

### 4. Run Stress Tests (30 minutes)

```bash
cd backend/tests/stress
k6 run stress-test.js
```

### 5. Run Race Condition Tests

```bash
cd backend/tests/race

# Set your auth token
export AUTH_TOKEN="your-test-token"

# Run test
k6 run concurrent-orders.test.js
```

---

## Test Types

### Load Test
**Purpose:** Simulate normal production load  
**Duration:** 20 minutes  
**Users:** 100 → 500 → 1000  
**Success:** Error rate < 1%, P95 < 500ms  

### Stress Test
**Purpose:** Find breaking point  
**Duration:** 30 minutes  
**Users:** 100 → 10,000  
**Success:** Identify max capacity  

### Race Condition Test
**Purpose:** Test concurrent operations  
**Duration:** 30 seconds  
**Users:** 10 simultaneous  
**Success:** No race conditions, no negative stock  

---

## Expected Results

### Load Test (1000 users)
```
✓ health check status 200
✓ menu load status 200
✓ menu load time < 100ms
✓ cache health status 200
✓ queue health status 200

checks.........................: 95%+
http_req_duration..............: avg=150ms p(95)=400ms
http_req_failed................: < 1%
http_reqs......................: 100,000+
```

### Stress Test (Breaking Point)
```
Expected breaking point: 5,000-10,000 concurrent users
Signs of stress:
- Response time > 2s
- Error rate > 5%
- Database connections maxed
- CPU at 100%
```

### Race Condition Test
```
Expected: 
- Some orders succeed (stock available)
- Some orders fail ("Insufficient stock")
- NO negative stock
- NO server errors (500)
```

---

## Monitoring During Tests

### Terminal 1: Run Test
```bash
k6 run load-test.js
```

### Terminal 2: Monitor Backend
```bash
pm2 logs fulccrum-backend --lines 100
```

### Terminal 3: Monitor Database
```bash
watch -n 1 'psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"'
```

### Terminal 4: Monitor Redis
```bash
watch -n 1 'redis-cli INFO stats | grep total_commands'
```

### Terminal 5: Monitor System
```bash
htop
```

---

## Troubleshooting

### Test Fails: Connection Refused
**Problem:** Backend not running  
**Solution:** 
```bash
cd backend
npm run start:dev
```

### Test Fails: High Error Rate
**Problem:** Backend overloaded  
**Solution:** 
- Reduce concurrent users
- Check database connections
- Check Redis memory
- Review backend logs

### Test Fails: Slow Response Time
**Problem:** Cache not working or database slow  
**Solution:**
```bash
# Check cache
curl http://localhost:3001/health/cache

# Check database
curl http://localhost:3001/health/database
```

---

## Custom Test Configuration

### Change Base URL
```bash
# Load test
k6 run -e BASE_URL=https://api.your-domain.com load-test.js

# Stress test
k6 run -e BASE_URL=https://api.your-domain.com stress-test.js
```

### Change Test Duration
```bash
# Quick 5-minute test
k6 run --duration 5m --vus 500 load-test.js

# Extended 1-hour test
k6 run --duration 1h --vus 1000 load-test.js
```

### Save Results
```bash
# Save to JSON
k6 run --out json=results.json load-test.js

# Save to CSV
k6 run --out csv=results.csv load-test.js
```

---

## Pre-Production Checklist

Before deploying to production, ensure:

- [ ] Quick tests pass (test-quick.sh)
- [ ] Load test passes with 1000 users
- [ ] Stress test identifies breaking point
- [ ] Race condition test shows no issues
- [ ] Error rate < 1% under load
- [ ] P95 response time < 500ms
- [ ] Cache hit rate > 80%
- [ ] Queue processing < 5s
- [ ] No memory leaks during extended tests
- [ ] Database connections stable

---

## Next Steps

After testing passes:
1. Review test results
2. Document breaking point
3. Plan scaling strategy
4. Set up monitoring alerts
5. Deploy to staging
6. Run tests on staging
7. Deploy to production

---

**Questions?** See TESTING_STRATEGY.md for detailed guide.
