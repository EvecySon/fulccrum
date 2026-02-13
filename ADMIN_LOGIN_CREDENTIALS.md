# ADMIN LOGIN CREDENTIALS

## 🔐 Admin Account

Use these credentials to login and test the admin features:

### Option 1: Standard Admin Account
```
📧 Email:    admin@fulccrum.com
📱 Phone:    +2348012345678
🔑 Password: Admin123!
```

### Option 2: Create Your Own Admin
If the above doesn't work, you can create an admin account through the app:

1. **Register a new account** in the app
2. **Verify your email/phone** 
3. **Manually update the database** to make it an admin:

```sql
-- Connect to your PostgreSQL database and run:
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Then create an AdminUser record:
INSERT INTO "AdminUser" (id, "userId", department, permissions, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'your-email@example.com'),
  'Operations',
  ARRAY['all'],
  NOW(),
  NOW()
);
```

### Option 3: Use Existing User
If you already have a user account, I can help you convert it to admin by running the SQL above with your email.

---

## 📱 How to Login

1. **Open the app** at http://localhost:8081
2. **Click Login** (if not already on login screen)
3. **Enter credentials:**
   - Email: `admin@fulccrum.com`
   - Password: `Admin123!`
4. **Click Login button**
5. **Navigate to More tab** to access admin features

---

## 🧪 Testing Admin Features

Once logged in, you can test all admin features:

### Finance
- Commission Tiers - Create/manage commission structures
- Revenue Analytics - View revenue data and forecasts
- Refund Management - Approve/reject refund requests

### Operations
- Live Operations Map - Real-time order tracking
- Incident Management - Create and resolve incidents
- SLA Monitoring - Monitor service level agreements

### Security & Access
- Roles Management - Create and manage admin roles
- Audit Logs - View system audit trail

### Content & Compliance
- Content Moderation - Review flagged content
- Merchant Compliance - Track licenses and permits

### Marketing
- Campaign Management - Create marketing campaigns
- Promo Code Manager - Manage promotional codes

### Analytics
- Custom Reports - Build custom analytics reports
- Cohort Analysis - Analyze user retention

---

## ⚠️ Troubleshooting

### If login fails:
1. Check backend is running on port 3001
2. Check frontend is running on port 8081
3. Verify database is accessible
4. Check network tab in browser for API errors

### If "No token provided" error:
- The JWT authentication is working correctly
- You need to login first to get a token
- Token is automatically stored after successful login

### If "Unauthorized" error:
- Your account might not have admin role
- Use Option 2 or 3 above to grant admin access

---

## 📞 Need Help?

Let me know if:
- The credentials don't work
- You need to create a custom admin account
- You encounter any errors during login
- You need help testing specific features
