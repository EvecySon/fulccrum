# Security Features Implementation

## Overview
This document outlines the security features implemented in the Fulccrum backend to protect against common authentication attacks and ensure secure user access.

## 1. Rate Limiting ✅

### Implementation
- **Package:** `@nestjs/throttler`
- **Global Limit:** 100 requests per minute per IP/user
- **Auth-Specific Limits:**
  - Login: 5 attempts per minute
  - Register: 3 attempts per minute
  - Password Reset: 3 attempts per 5 minutes
  - OTP Verification: 5 attempts per minute
  - Resend OTP: 3 attempts per 5 minutes

### Protection Against
- Brute force attacks
- Credential stuffing
- API abuse
- DDoS attacks

### Configuration
Located in `src/app.module.ts` and individual controller decorators using `@Throttle()`.

---

## 2. Account Lockout ✅

### Implementation
- **Max Failed Attempts:** 5
- **Lockout Duration:** 15 minutes
- **Database Fields:**
  - `failedLoginAttempts` - Counter for failed login attempts
  - `accountLockedUntil` - Timestamp when account will be unlocked

### Features
- Automatic account locking after 5 failed login attempts
- Email notification sent to user when account is locked
- Failed attempt counter resets on successful login
- Clear error message showing time remaining until unlock

### Protection Against
- Brute force password attacks
- Automated login attempts
- Credential stuffing

### Code Location
- `src/auth/auth.service.ts` - Login method with lockout logic
- `prisma/schema.prisma` - User model with lockout fields

---

## 3. Audit Logging ✅

### Implementation
- **Service:** `AuditService` in `src/audit/audit.service.ts`
- **Database Table:** `audit_logs`

### Logged Events
- **Login Attempts:**
  - Successful logins
  - Failed logins (invalid password)
  - Failed logins (user not found)
  - Account locked attempts
  - Suspended/deleted account attempts

### Audit Log Fields
- `userId` - User who performed the action (nullable)
- `action` - Type of action (e.g., 'login', 'logout', 'password_reset')
- `resource` - Resource being accessed (e.g., 'auth', 'user', 'order')
- `status` - Result of action ('success', 'failure', 'error')
- `ipAddress` - IP address of the request
- `userAgent` - Browser/device information
- `metadata` - Additional context (JSON)
- `createdAt` - Timestamp

### Features
- Track all authentication events
- Identify suspicious activity patterns
- Monitor failed login attempts by IP
- User activity history
- Security incident investigation

### Available Methods
```typescript
// Log an event
await auditService.log({
  userId: 'user-id',
  action: 'login',
  resource: 'auth',
  status: 'success',
  ipAddress: '192.168.1.1',
  metadata: { role: 'customer' }
});

// Get user's login history
await auditService.getLoginAttempts(userId, since);

// Get failed logins by IP
await auditService.getFailedLoginsByIp(ipAddress, since);

// Get suspicious activity
await auditService.getSuspiciousActivity(since);
```

---

## Database Migration Required

To enable these features, run the following migration:

```bash
cd backend
npx prisma migrate dev --name add_security_features
```

This will:
1. Add `failedLoginAttempts` and `accountLockedUntil` fields to User table
2. Create `audit_logs` table
3. Add necessary indexes for performance

---

## Testing the Features

### 1. Test Rate Limiting
```bash
# Try to login more than 5 times in a minute
for i in {1..6}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

Expected: 6th request should return `429 Too Many Requests`

### 2. Test Account Lockout
1. Attempt login with wrong password 5 times
2. Account should be locked for 15 minutes
3. Check email for lockout notification
4. Try to login again - should see lockout message with time remaining

### 3. Test Audit Logging
```typescript
// Get user's audit logs
const logs = await auditService.getUserAuditLogs(userId);
console.log(logs);

// Check for suspicious IPs
const suspicious = await auditService.getSuspiciousActivity(
  new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
);
```

---

## Security Best Practices Implemented

✅ **Rate Limiting** - Prevents brute force attacks  
✅ **Account Lockout** - Automatic protection after failed attempts  
✅ **Audit Logging** - Complete activity tracking  
✅ **Password Hashing** - bcrypt with cost factor 12  
✅ **JWT Tokens** - Short-lived access tokens (1 hour)  
✅ **Refresh Tokens** - Secure token rotation  
✅ **Email Notifications** - Alert users of security events  

---

## Future Enhancements

### High Priority
- [ ] **MFA (Two-Factor Authentication)**
  - SMS OTP via Termii
  - Authenticator app (TOTP)
  - Backup codes

- [ ] **Token Blacklist**
  - Redis-based revocation
  - Immediate logout across devices

- [ ] **IP Throttling**
  - Block suspicious IPs temporarily
  - CAPTCHA after multiple failures

### Medium Priority
- [ ] **Session Management**
  - Track active sessions
  - Device fingerprinting
  - "Active sessions" view for users

- [ ] **Password Reset Security**
  - Time-limited reset tokens
  - Prevent token reuse
  - Email verification required

### Nice to Have
- [ ] **SSO Integration**
  - Google OAuth
  - Apple Sign-In
  - Facebook Login

- [ ] **Admin Monitoring Dashboard**
  - Real-time failed login attempts
  - Suspicious activity alerts
  - Geographic login patterns

---

## Configuration

### Environment Variables
```env
# Rate Limiting (optional - defaults shown)
THROTTLE_TTL=60000  # 1 minute
THROTTLE_LIMIT=100  # 100 requests per minute

# Account Lockout (hardcoded in auth.service.ts)
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
```

### Customization
To change lockout settings, edit `src/auth/auth.service.ts`:
```typescript
private readonly MAX_LOGIN_ATTEMPTS = 5;
private readonly LOCKOUT_DURATION_MINUTES = 15;
```

---

## Monitoring & Alerts

### Recommended Monitoring
1. **Failed Login Attempts** - Alert if > 10 failures in 5 minutes from same IP
2. **Account Lockouts** - Track frequency of lockouts
3. **Suspicious IPs** - Monitor IPs with multiple failed attempts across different accounts
4. **Audit Log Growth** - Ensure database can handle log volume

### Query Examples
```sql
-- Failed logins in last hour
SELECT ip_address, COUNT(*) as attempts
FROM audit_logs
WHERE action = 'login' 
  AND status = 'failure'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5;

-- Recently locked accounts
SELECT u.email, u.account_locked_until
FROM users u
WHERE u.account_locked_until > NOW()
ORDER BY u.account_locked_until DESC;
```

---

## Support

For security issues or questions, contact the development team.

**Last Updated:** February 16, 2026
