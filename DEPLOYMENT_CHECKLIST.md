# Production Deployment Checklist

## Pre-Deployment Checklist

### 🔐 Security
- [ ] All API keys in environment variables (not hardcoded)
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] Redis password is set
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on all endpoints
- [ ] Account lockout configured (5 attempts, 15 min)
- [ ] Audit logging enabled

### 🗄️ Database
- [ ] All Prisma migrations applied
- [ ] Database indexes verified
- [ ] Backup strategy configured
- [ ] Connection pooling configured
- [ ] Unique constraints on paymentId and reference
- [ ] Test database connectivity

### 📧 Email & Notifications
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] Email templates created
- [ ] Queue system tested
- [ ] Retry logic verified (3 attempts)
- [ ] Failed job alerts configured

### 💳 Payment (Paystack)
- [ ] Live API keys configured
- [ ] Webhook endpoint secured
- [ ] Idempotency system tested
- [ ] Payment callback URL set
- [ ] Test payment flow end-to-end

### 📊 Monitoring
- [ ] Sentry DSN configured
- [ ] Health endpoints accessible
- [ ] Error alerts configured (Slack/email)
- [ ] Performance monitoring enabled
- [ ] Queue monitoring dashboard

### 🚀 Performance
- [ ] Redis cache working
- [ ] Location batching enabled
- [ ] Menu caching verified
- [ ] Stock tracking tested
- [ ] Load testing completed (simulate 1K users)

### 📱 Mobile App
- [ ] API base URL updated to production
- [ ] Socket URL updated to production
- [ ] Push notification credentials configured
- [ ] Deep linking tested
- [ ] App store ready (if applicable)

---

## Environment Variables Checklist

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOLER_URL=postgresql://user:pass@pooler:6543/db

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-strong-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_CALLBACK_URL=https://your-domain.com/payment/callback

# Email (SendGrid example)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@your-domain.com

# SMS (Termii)
TERMII_API_KEY=xxxxx
TERMII_SENDER_ID=YourApp

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NODE_ENV=production

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=xxxxx
FIREBASE_CLIENT_EMAIL=xxxxx

# App URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Optional Variables
```env
# Feature Flags
ENABLE_MAINTENANCE_MODE=false
ENABLE_NEW_FEATURES=true

# Limits
MAX_UPLOAD_SIZE=10485760
MAX_REQUESTS_PER_MINUTE=100

# Logging
LOG_LEVEL=info
ENABLE_QUERY_LOGGING=false
```

---

## Deployment Steps

### Step 1: Prepare Code
```bash
# Pull latest code
git pull origin main

# Install dependencies
cd backend
npm ci --production

# Generate Prisma client
npx prisma generate

# Build (if using TypeScript compilation)
npm run build
```

### Step 2: Database Migration
```bash
# Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Run migrations
npx prisma migrate deploy

# Verify migration
npx prisma migrate status
```

### Step 3: Environment Setup
```bash
# Copy environment template
cp .env.example .env.production

# Edit with production values
nano .env.production

# Verify all required variables set
node -e "require('dotenv').config({path:'.env.production'}); console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL' : '✗ DATABASE_URL missing')"
```

### Step 4: Start Services
```bash
# Start Redis (if not managed)
docker-compose up -d redis

# Start backend with PM2
pm2 start npm --name "fulccrum-backend" -- run start:prod

# Or with Docker
docker-compose up -d backend

# Check logs
pm2 logs fulccrum-backend
```

### Step 5: Verify Deployment
```bash
# Health check
curl https://api.your-domain.com/health

# Database health
curl https://api.your-domain.com/health/database

# Cache health
curl https://api.your-domain.com/health/cache

# Queue health
curl https://api.your-domain.com/health/queue

# All health checks
curl https://api.your-domain.com/health/all
```

### Step 6: Test Critical Flows
```bash
# Test user registration
curl -X POST https://api.your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Test login
curl -X POST https://api.your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test menu loading
curl https://api.your-domain.com/api/menu/business/{businessId}/categories

# Test payment initialization (with auth)
curl -X POST https://api.your-domain.com/api/payment/initialize \
  -H "Authorization: Bearer {token}" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test-order","amount":5000}'
```

---

## Post-Deployment Monitoring

### First Hour
- [ ] Monitor error rate in Sentry
- [ ] Check health endpoints every 5 minutes
- [ ] Watch queue backlog
- [ ] Monitor database CPU/memory
- [ ] Check Redis memory usage

### First Day
- [ ] Review all error logs
- [ ] Check payment success rate
- [ ] Verify email delivery rate
- [ ] Monitor API response times
- [ ] Check for any failed jobs in queue

### First Week
- [ ] Daily error review
- [ ] Performance optimization based on metrics
- [ ] User feedback collection
- [ ] Database query optimization
- [ ] Cache hit rate analysis

---

## Rollback Plan

### If Critical Issue Detected

**Step 1: Stop New Deployments**
```bash
# Stop backend
pm2 stop fulccrum-backend
```

**Step 2: Restore Previous Version**
```bash
# Checkout previous commit
git checkout HEAD~1

# Reinstall dependencies
npm ci

# Restart
pm2 restart fulccrum-backend
```

**Step 3: Restore Database (if needed)**
```bash
# Restore from backup
psql $DATABASE_URL < backup_20260220.sql

# Or rollback migration
npx prisma migrate resolve --rolled-back "migration_name"
```

**Step 4: Notify Team**
- Post in Slack #incidents channel
- Update status page
- Notify affected users (if applicable)

---

## Performance Benchmarks

### Expected Metrics (Production)

| Metric | Target | Alert If |
|--------|--------|----------|
| **API Response Time (P95)** | < 500ms | > 2000ms |
| **Error Rate** | < 1% | > 5% |
| **Cache Hit Rate** | > 80% | < 70% |
| **Database CPU** | < 50% | > 80% |
| **Queue Processing Time** | < 5s | > 30s |
| **Memory Usage** | < 70% | > 90% |

### Load Testing Results

```bash
# Run load test
artillery quick --count 1000 --num 10 https://api.your-domain.com/health

# Expected results:
# - 1000 requests in 10 seconds
# - 0% error rate
# - P95 response time < 500ms
```

---

## Security Hardening

### SSL/TLS
- [ ] HTTPS enabled on all endpoints
- [ ] SSL certificate valid and auto-renewing
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header enabled

### Headers
```typescript
// Add security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### Rate Limiting
- [ ] Global rate limit: 100 req/min
- [ ] Auth endpoints: 5 req/min
- [ ] Payment endpoints: 10 req/min
- [ ] IP-based blocking for abuse

### Input Validation
- [ ] All DTOs have validation decorators
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention
- [ ] CSRF protection

---

## Backup Strategy

### Automated Backups
```bash
# Daily database backup (cron job)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### Manual Backup Before Major Changes
```bash
# Before deployment
pg_dump $DATABASE_URL > backup_pre_deploy_$(date +%Y%m%d_%H%M).sql

# Before migration
pg_dump $DATABASE_URL > backup_pre_migration_$(date +%Y%m%d_%H%M).sql
```

### Backup Verification
```bash
# Test restore monthly
psql test_db < backup_latest.sql
```

---

## Monitoring Dashboards

### Sentry Dashboard
- Error rate by endpoint
- Most common errors
- User impact
- Performance trends

### Health Dashboard
```bash
# Create simple dashboard
curl https://api.your-domain.com/health/all | jq
```

### Custom Metrics (Optional)
- Active users (real-time)
- Orders per hour
- Revenue per hour
- Driver availability
- Average delivery time

---

## Team Communication

### Deployment Announcement Template
```
🚀 Production Deployment - v1.2.0

Changes:
- Stock tracking system
- Payment idempotency
- Background job queue
- Location optimization

Deployed by: [Your Name]
Time: [Timestamp]
Commit: [Git SHA]

Monitoring:
- Sentry: https://sentry.io/...
- Health: https://api.your-domain.com/health/all

Rollback plan: See DEPLOYMENT_CHECKLIST.md
```

### Incident Response Template
```
🚨 Incident Report

Issue: [Brief description]
Severity: [Critical/High/Medium/Low]
Started: [Timestamp]
Affected: [Number of users/features]

Actions Taken:
1. [Action 1]
2. [Action 2]

Status: [Investigating/Mitigating/Resolved]
ETA: [Estimated resolution time]

Updates: [Link to status page]
```

---

## Success Criteria

### Deployment Successful If:
- ✅ All health checks passing
- ✅ Error rate < 1%
- ✅ No critical bugs reported
- ✅ Payment flow working
- ✅ Email delivery working
- ✅ Queue processing normally
- ✅ Database responsive
- ✅ Cache hit rate > 80%

### Deployment Failed If:
- ❌ Error rate > 5%
- ❌ Health checks failing
- ❌ Payment processing broken
- ❌ Database connection issues
- ❌ Critical features not working
- ❌ User complaints increasing

---

## Post-Deployment Tasks

### Immediate (Within 1 Hour)
- [ ] Announce deployment in team chat
- [ ] Monitor Sentry for new errors
- [ ] Check health endpoints
- [ ] Verify critical user flows
- [ ] Update status page

### Within 24 Hours
- [ ] Review all error logs
- [ ] Analyze performance metrics
- [ ] Check user feedback
- [ ] Document any issues
- [ ] Plan fixes for minor issues

### Within 1 Week
- [ ] Performance optimization
- [ ] Fix non-critical bugs
- [ ] Update documentation
- [ ] Team retrospective
- [ ] Plan next release

---

## Emergency Contacts

```
On-Call Engineer: [Phone/Slack]
Database Admin: [Phone/Slack]
DevOps Lead: [Phone/Slack]
Product Manager: [Phone/Slack]

Escalation Path:
1. On-Call Engineer (immediate)
2. Tech Lead (if not resolved in 30 min)
3. CTO (if critical and not resolved in 1 hour)
```

---

## Useful Commands

### Check System Status
```bash
# Backend status
pm2 status

# Database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Redis status
redis-cli ping

# Disk space
df -h

# Memory usage
free -h
```

### Quick Fixes
```bash
# Restart backend
pm2 restart fulccrum-backend

# Clear Redis cache
redis-cli FLUSHDB

# Restart queue workers
pm2 restart fulccrum-queue-worker

# View logs
pm2 logs fulccrum-backend --lines 100
```

---

## Final Checklist Before Going Live

- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Backup strategy verified
- [ ] Monitoring configured
- [ ] Team trained on deployment process
- [ ] Rollback plan tested
- [ ] Documentation updated
- [ ] Status page ready
- [ ] Customer support briefed

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Status:** _______________  

**Sign-off:**
- [ ] Engineering Lead
- [ ] DevOps Lead
- [ ] Product Manager
- [ ] QA Lead
