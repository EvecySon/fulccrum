# Sentry Error Monitoring Setup Guide

## Why Sentry?

**Problem:** You don't know when errors happen in production until users complain

**Sentry Benefits:**
- ✅ Real-time error tracking
- ✅ Performance monitoring (APM)
- ✅ User context (who experienced the error)
- ✅ Stack traces with source maps
- ✅ Release tracking
- ✅ Slack/email alerts
- ✅ **FREE tier:** 5,000 errors/month

---

## Setup Steps

### Step 1: Create Sentry Account

1. Go to https://sentry.io/signup/
2. Create account (free tier)
3. Create new project:
   - Platform: **Node.js**
   - Project name: **Fulccrum Backend**
4. Copy your DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

---

### Step 2: Install Sentry SDK

```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

---

### Step 3: Configure Sentry in Backend

**Create `backend/src/sentry/sentry.config.ts`:**

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: prisma }),
    ],
    
    // Don't send errors in development
    enabled: process.env.NODE_ENV === 'production',
    
    // Release tracking
    release: process.env.npm_package_version,
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });
}
```

---

### Step 4: Add to Main Entry Point

**Update `backend/src/main.ts`:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSentry } from './sentry/sentry.config';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Initialize Sentry FIRST
  initSentry();
  
  const app = await NestFactory.create(AppModule);
  
  // ... rest of your setup
  
  // Add Sentry error handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  
  await app.listen(3001, '0.0.0.0');
  
  // Add error handler AFTER routes
  app.use(Sentry.Handlers.errorHandler());
}

bootstrap();
```

---

### Step 5: Add Environment Variable

**Update `backend/.env`:**

```env
# Sentry
SENTRY_DSN=https://your-dsn@o123.ingest.sentry.io/456
NODE_ENV=production
```

---

### Step 6: Create Sentry Interceptor (Optional)

**Create `backend/src/common/interceptors/sentry.interceptor.ts`:**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Set user context
    if (request.user) {
      Sentry.setUser({
        id: request.user.sub,
        email: request.user.email,
        role: request.user.role,
      });
    }
    
    // Set request context
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    
    return next.handle().pipe(
      tap(() => {
        // Clear context after request
        Sentry.setUser(null);
      }),
      catchError((error) => {
        // Capture error in Sentry
        Sentry.captureException(error);
        return throwError(() => error);
      }),
    );
  }
}
```

**Apply globally in `app.module.ts`:**

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
```

---

### Step 7: Manual Error Tracking

**In any service:**

```typescript
import * as Sentry from '@sentry/node';

async someMethod() {
  try {
    // Your code
  } catch (error) {
    // Log to Sentry with context
    Sentry.captureException(error, {
      tags: {
        service: 'payment',
        action: 'initialize',
      },
      extra: {
        orderId: 'order-123',
        amount: 5000,
      },
    });
    
    throw error;
  }
}
```

---

### Step 8: Performance Monitoring

**Track slow operations:**

```typescript
import * as Sentry from '@sentry/node';

async processOrder(orderId: string) {
  const transaction = Sentry.startTransaction({
    op: 'order.process',
    name: 'Process Order',
  });
  
  try {
    // Step 1: Validate
    const span1 = transaction.startChild({
      op: 'order.validate',
      description: 'Validate order data',
    });
    await validateOrder(orderId);
    span1.finish();
    
    // Step 2: Process payment
    const span2 = transaction.startChild({
      op: 'payment.process',
      description: 'Process payment',
    });
    await processPayment(orderId);
    span2.finish();
    
    transaction.finish();
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    throw error;
  }
}
```

---

## Alert Configuration

### Step 1: Set Up Alerts in Sentry Dashboard

1. Go to **Settings** → **Alerts**
2. Create new alert rule:
   - **Trigger:** When error count > 10 in 1 hour
   - **Action:** Send Slack notification
   - **Action:** Send email to team

### Step 2: Slack Integration

1. Go to **Settings** → **Integrations**
2. Add Slack integration
3. Choose channel: `#backend-errors`
4. Test notification

### Step 3: Custom Alerts

```typescript
// Alert on critical errors
Sentry.captureException(error, {
  level: 'fatal', // This triggers high-priority alert
  tags: {
    critical: 'true',
  },
});
```

---

## Dashboard Setup

### Key Metrics to Monitor

1. **Error Rate**
   - Target: < 1% of requests
   - Alert: > 5% error rate

2. **Response Time (P95)**
   - Target: < 500ms
   - Alert: > 2000ms

3. **Most Common Errors**
   - Track top 10 errors
   - Fix highest impact first

4. **User Impact**
   - How many users affected
   - Which features broken

---

## Testing Sentry

**Test error tracking:**

```typescript
// Add test endpoint
@Get('test/sentry')
testSentry() {
  throw new Error('Test Sentry error tracking');
}
```

**Test in production:**

```bash
curl http://your-domain.com/test/sentry
```

**Check Sentry dashboard:**
- Should see error appear within seconds
- Should have stack trace
- Should have user context (if logged in)

---

## Best Practices

### 1. Add Context to Errors

```typescript
Sentry.setContext('order', {
  orderId: order.id,
  status: order.status,
  amount: order.totalAmount,
});

Sentry.captureException(error);
```

### 2. Use Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'Initializing payment',
  level: 'info',
  data: { orderId, amount },
});

// Later if error occurs, breadcrumbs show what led to it
```

### 3. Filter Noise

```typescript
// Don't send validation errors
beforeSend(event) {
  if (event.exception?.values?.[0]?.type === 'BadRequestException') {
    return null; // Don't send to Sentry
  }
  return event;
}
```

### 4. Release Tracking

```bash
# Tag releases
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Or use package version
export SENTRY_RELEASE=v1.2.3
```

---

## Cost Management

### Free Tier Limits
- 5,000 errors/month
- 10,000 performance transactions/month
- 1 project
- 7 days data retention

### Staying Within Free Tier

**1. Sample in production:**
```typescript
tracesSampleRate: 0.1, // Only track 10% of requests
```

**2. Filter noisy errors:**
```typescript
ignoreErrors: [
  'NetworkError',
  'AbortError',
  'TimeoutError',
],
```

**3. Use error grouping:**
- Sentry groups similar errors
- Counts as 1 error, not 1000

### When to Upgrade ($26/month)
- > 5,000 errors/month
- Need > 7 days retention
- Need multiple projects
- Need advanced features

---

## Monitoring Checklist

- [ ] Sentry installed and configured
- [ ] DSN added to environment variables
- [ ] Error tracking tested
- [ ] Performance monitoring enabled
- [ ] Alerts configured (Slack/email)
- [ ] Team has access to dashboard
- [ ] Release tracking set up
- [ ] Sensitive data filtered
- [ ] Sample rate configured for production

---

## Alternative: Self-Hosted Sentry

**If you want free unlimited:**

```bash
# Install Sentry on your server
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted
./install.sh

# Access at http://your-server:9000
```

**Pros:**
- Unlimited errors
- Full control
- No data leaves your server

**Cons:**
- Requires maintenance
- Uses server resources
- No managed infrastructure

---

## Integration with Other Tools

### 1. GitHub Issues

- Auto-create GitHub issue for new errors
- Link commits to error resolution

### 2. Jira

- Create Jira tickets from Sentry errors
- Track error resolution in sprint

### 3. PagerDuty

- Alert on-call engineer for critical errors
- Escalation policies

---

## Troubleshooting

### Issue: No errors showing in Sentry

**Check:**
1. Is `SENTRY_DSN` set correctly?
2. Is `enabled: true` in config?
3. Are you in production mode?
4. Check backend logs for Sentry errors

### Issue: Too many errors

**Solution:**
```typescript
// Increase sample rate
beforeSend(event) {
  // Only send 10% of errors
  if (Math.random() > 0.1) return null;
  return event;
}
```

### Issue: Missing stack traces

**Solution:**
```typescript
// Enable source maps
Sentry.init({
  integrations: [
    new Sentry.Integrations.RewriteFrames({
      root: __dirname,
    }),
  ],
});
```

---

## Next Steps After Setup

1. **Week 1:** Monitor error patterns
2. **Week 2:** Fix top 5 most common errors
3. **Week 3:** Set up performance budgets
4. **Week 4:** Configure custom alerts
5. **Ongoing:** Review Sentry weekly, fix critical errors

---

## Support Resources

- **Docs:** https://docs.sentry.io/platforms/node/
- **Discord:** https://discord.gg/sentry
- **Status:** https://status.sentry.io/

---

**Status:** Ready to implement  
**Time Required:** 30 minutes  
**Cost:** Free (5K errors/month)  
**Priority:** High (implement before launch)  
