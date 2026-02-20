# Managed Database Migration Guide

## Why Move to Managed Database?

**Current Setup:** PostgreSQL in Docker on same VPS as backend
**Problem:** Single point of failure, manual backups, limited scaling

**Managed Database Benefits:**
- ✅ Automatic backups (daily + point-in-time recovery)
- ✅ High availability (99.9% uptime SLA)
- ✅ Easy scaling (vertical + horizontal)
- ✅ Monitoring and alerts included
- ✅ Automatic security patches
- ✅ Connection pooling built-in

---

## Recommended Providers

### Option 1: Railway Postgres (Recommended)
**Cost:** $5-25/month
**Pros:** Easy setup, auto-scaling, great DX
**Cons:** Newer service

### Option 2: Supabase
**Cost:** $25/month
**Pros:** Full Postgres, real-time features, auth included
**Cons:** More expensive

### Option 3: Neon
**Cost:** $19/month
**Pros:** Serverless, instant branching, cheap
**Cons:** Beta features

### Option 4: AWS RDS
**Cost:** $15-50/month
**Pros:** Enterprise-grade, highly reliable
**Cons:** Complex setup, more expensive

---

## Migration Steps (Railway Example)

### Step 1: Create Railway Database

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add Postgres
railway add postgres
```

**Or use Railway Dashboard:**
1. Go to https://railway.app
2. Create new project
3. Add "PostgreSQL" service
4. Copy connection string

---

### Step 2: Backup Current Database

```bash
# Export current database
docker exec cascade_postgres pg_dump -U postgres cascade_dev > backup_$(date +%Y%m%d).sql

# Verify backup
ls -lh backup_*.sql
```

---

### Step 3: Update Environment Variables

**Old `.env`:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cascade_dev"
```

**New `.env`:**
```env
# Railway provides this format:
DATABASE_URL="postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway"

# Or Supabase:
DATABASE_URL="postgresql://postgres:password@db.abc123.supabase.co:5432/postgres"
```

---

### Step 4: Restore Data to Managed Database

```bash
# Get Railway database URL
railway variables

# Restore backup
psql $DATABASE_URL < backup_20260220.sql

# Or using Docker:
docker run --rm -i postgres:15 psql $DATABASE_URL < backup_20260220.sql
```

---

### Step 5: Run Prisma Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to new database
npx prisma db push

# Or run migrations
npx prisma migrate deploy

# Verify
npx prisma studio
```

---

### Step 6: Test Connection

```bash
# Test backend connection
npm run start:dev

# Check logs for successful connection
# Should see: "Database connected successfully"

# Test health endpoint
curl http://localhost:3001/health/database
```

---

### Step 7: Update Production Deployment

**If using Railway for backend too:**
```bash
# Set environment variable
railway variables set DATABASE_URL="postgresql://..."

# Redeploy
railway up
```

**If using VPS:**
```bash
# Update .env on server
ssh user@your-server
cd /path/to/backend
nano .env
# Update DATABASE_URL

# Restart backend
pm2 restart backend
```

---

### Step 8: Remove Local Database (Optional)

```bash
# Stop local Postgres
docker-compose stop postgres

# Remove from docker-compose.yml
# Comment out or remove postgres service

# Keep Redis running!
docker-compose up -d redis
```

---

## Connection Pooling

### Why You Need It
- Managed databases limit connections (usually 100-500)
- Each backend instance uses multiple connections
- Without pooling, you'll hit limits quickly

### Option 1: Prisma Connection Pool (Built-in)

**Update `schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add connection pooling
  connectionLimit = 10
}
```

### Option 2: PgBouncer (External)

**Railway:**
```bash
# Railway includes PgBouncer automatically
# Just use the pooled connection string
DATABASE_URL="postgresql://postgres:password@pooler.railway.app:5432/railway"
```

**Supabase:**
```env
# Supabase provides both:
DATABASE_URL="postgresql://...supabase.co:5432/postgres"  # Direct
DATABASE_POOLER_URL="postgresql://...pooler.supabase.com:6543/postgres"  # Pooled

# Use pooled for backend
DATABASE_URL=$DATABASE_POOLER_URL
```

---

## Monitoring & Alerts

### Railway Dashboard
- CPU/Memory usage
- Connection count
- Query performance
- Automatic alerts

### Supabase Dashboard
- Real-time metrics
- Slow query logs
- Connection pool stats
- Custom alerts

### Custom Monitoring (Any Provider)

```typescript
// Add to health check
@Get('database/stats')
async getDatabaseStats() {
  const result = await this.prisma.$queryRaw`
    SELECT 
      count(*) as total_connections,
      count(*) FILTER (WHERE state = 'active') as active_connections,
      count(*) FILTER (WHERE state = 'idle') as idle_connections
    FROM pg_stat_activity
    WHERE datname = current_database();
  `;
  
  return result[0];
}
```

---

## Cost Comparison

| Provider | Storage | Connections | Backups | Cost/Month |
|----------|---------|-------------|---------|------------|
| **Railway** | 10GB | 100 | Daily | $5-25 |
| **Supabase** | 8GB | 60 | Daily | $25 |
| **Neon** | 10GB | 100 | Daily | $19 |
| **AWS RDS** | 20GB | 100 | Manual | $15-50 |
| **Docker (Current)** | Unlimited | Unlimited | Manual | $0 |

**Recommendation:** Start with Railway ($5-10/month), upgrade to Supabase or AWS RDS when you hit 10K users.

---

## Rollback Plan

If migration fails:

```bash
# 1. Stop backend
pm2 stop backend

# 2. Restore old DATABASE_URL
nano .env
# Change back to: postgresql://localhost:5432/cascade_dev

# 3. Start local Postgres
docker-compose up -d postgres

# 4. Restart backend
npm run start:dev
```

---

## Performance Optimization

### Enable Query Logging

```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Add Indexes (Already Done)

```sql
-- Verify indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Monitor Slow Queries

```sql
-- Enable slow query logging (Railway/Supabase dashboard)
-- Or query directly:
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Security Best Practices

### 1. Use Connection Pooling
```env
# Never use direct connection in production
DATABASE_URL="postgresql://...pooler..."  # ✅ Good
DATABASE_URL="postgresql://...direct..."   # ❌ Bad (for production)
```

### 2. Rotate Credentials
```bash
# Railway: Regenerate password in dashboard
# Supabase: Reset database password
# Update .env and redeploy
```

### 3. Enable SSL
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### 4. Restrict IP Access
- Railway: Automatic (private network)
- Supabase: Configure in dashboard
- AWS RDS: Security groups

---

## Troubleshooting

### Issue: "Too many connections"

**Solution:**
```env
# Reduce connection limit in Prisma
# schema.prisma
datasource db {
  connectionLimit = 5  # Lower this
}

# Or use connection pooler
DATABASE_URL="postgresql://...pooler..."
```

### Issue: "Connection timeout"

**Solution:**
```env
# Increase timeout
DATABASE_URL="postgresql://...?connect_timeout=30"
```

### Issue: "SSL required"

**Solution:**
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Issue: "Migration failed"

**Solution:**
```bash
# Reset migrations
npx prisma migrate reset

# Or push schema directly
npx prisma db push --accept-data-loss
```

---

## Timeline

**Estimated Time:** 1-2 hours

- ✅ Create managed database: 10 min
- ✅ Backup current data: 5 min
- ✅ Restore to managed DB: 15 min
- ✅ Run migrations: 10 min
- ✅ Test connection: 10 min
- ✅ Update production: 15 min
- ✅ Monitor for issues: 30 min

---

## When to Migrate

**Migrate Now If:**
- ✅ You're launching soon
- ✅ You have paying customers
- ✅ You need automatic backups
- ✅ You want better reliability

**Wait If:**
- ⏸️ Still in development
- ⏸️ No users yet
- ⏸️ Budget is very tight ($0)

**Our Recommendation:** Migrate before launch or when you hit 100 users.

---

## Post-Migration Checklist

- [ ] Database connection working
- [ ] All migrations applied
- [ ] Data restored correctly
- [ ] Health checks passing
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Old database backed up
- [ ] Team notified of new connection string
- [ ] Documentation updated
- [ ] Rollback plan tested

---

## Support

**Railway:** https://railway.app/help
**Supabase:** https://supabase.com/docs
**Neon:** https://neon.tech/docs

**Need Help?** Check backend logs:
```bash
# Local
npm run start:dev

# Production
pm2 logs backend

# Railway
railway logs
```

---

**Status:** Ready to migrate when needed  
**Recommended:** Before launch or at 100 users  
**Cost Impact:** +$5-25/month  
**Time Required:** 1-2 hours  
