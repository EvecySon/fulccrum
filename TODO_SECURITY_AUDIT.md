# 🔒 Security Audit TODO List - For Later

**Created:** March 18, 2026  
**Priority:** Before Production Launch  
**Status:** Deferred (Focus on building features first)

---

## 📋 **Current Status:**

**Vulnerabilities:** 43 remaining (down from 57)
- 🔴 8 Critical
- 🟠 23 High
- 🟡 9 Moderate
- 🟢 3 Low

**Location:**
- ~80% in dev dependencies (build tools, testing)
- ~20% in production dependencies

**Risk Level:** Low to Medium (most are dev tools)

---

## ✅ **What's Already Done:**

1. ✅ Ran `npm install --legacy-peer-deps` to resolve dependency conflicts
2. ✅ Ran `npm audit fix --force` to auto-patch vulnerabilities
3. ✅ Reduced vulnerabilities from 57 to 43
4. ✅ Fixed GitHub Actions dependency issues
5. ✅ Committed and pushed changes

---

## 📝 **TODO Before Production Launch:**

### **Phase 1: Critical Vulnerabilities Review (High Priority)**

#### **1. Review Critical Vulnerabilities (8 items)**

**Critical Issues to Address:**

1. **minimist - Prototype Pollution**
   - Package: `minimist`
   - Severity: Critical
   - Location: `@angular-devkit/schematics-cli/node_modules/minimist`
   - Issue: Prototype Pollution vulnerability
   - Fix: Update to `@nestjs/cli@11.0.16` (breaking change)
   - **Action:** Test if NestJS CLI update breaks anything

2. **protobufjs - Prototype Pollution**
   - Package: `protobufjs`
   - Severity: Critical
   - Location: `google-gax/node_modules/protobufjs`
   - Issue: Prototype Pollution vulnerability
   - Fix: Update `firebase-admin@13.7.0` (breaking change)
   - **Action:** Test Firebase Admin update

3. **webpack - XSS Vulnerabilities**
   - Package: `webpack`
   - Severity: Critical
   - Issues:
     - Cross-realm object access
     - DOM Clobbering Gadget leading to XSS
   - Fix: Update to `@nestjs/cli@11.0.16` (breaking change)
   - **Action:** Test if webpack update breaks build process

4. **@aws-sdk/core - Dependency Issues**
   - Package: `@aws-sdk/core`
   - Severity: Critical
   - Multiple sub-packages affected
   - Fix: Update to `@aws-sdk/client-s3@3.893.0` (breaking change)
   - **Action:** Test S3 file upload functionality

5. **jsonwebtoken - Multiple Security Issues**
   - Package: `jsonwebtoken`
   - Severity: High
   - Issues:
     - Unrestricted key type (legacy keys usage)
     - Insecure key retrieval (RSA to HMAC forgery)
     - Signature validation bypass
   - Fix: Update `firebase-admin@13.7.0` (breaking change)
   - **Action:** Test authentication and JWT token generation

**Steps for Each Critical Vulnerability:**
1. Read the vulnerability details (GitHub Advisory)
2. Understand the impact on your app
3. Check if you're actually using the vulnerable feature
4. Test the fix in a development branch
5. Run full test suite after update
6. Deploy to staging environment
7. Verify functionality
8. Merge to production

---

### **Phase 2: High Severity Vulnerabilities (23 items)**

**High Priority Issues:**

1. **shelljs - Improper Privilege Management**
   - Severity: High
   - Fix: Update `@nestjs/cli@11.0.16`
   - **Action:** Test CLI commands

2. **file-type - Infinite Loop in ASF Parser**
   - Severity: Moderate
   - Fix: Update `@swc/cli@0.5.2`
   - **Action:** Test file upload validation

**Steps:**
1. Group similar vulnerabilities
2. Prioritize based on actual usage in your app
3. Update packages in batches
4. Test after each batch

---

### **Phase 3: Dev Dependencies Review**

**Lower Priority (Dev Tools Only):**

1. **@angular-devkit packages**
   - Used by NestJS CLI
   - Only affects development
   - Can be updated when convenient

2. **Build tools (webpack, etc.)**
   - Only used during build
   - Not in production bundle
   - Update when doing major refactor

**Steps:**
1. Identify which dev dependencies are actually used
2. Remove unused dev dependencies
3. Update remaining ones
4. Test build process

---

## 🔧 **How to Execute This TODO:**

### **When to Start:**
- ⏰ **2-4 weeks before production launch**
- ⏰ When you have dedicated testing time
- ⏰ During a scheduled maintenance window

### **Estimated Time:**
- Phase 1 (Critical): **4-6 hours**
- Phase 2 (High): **3-4 hours**
- Phase 3 (Dev): **2-3 hours**
- **Total: 10-15 hours**

### **Process:**

1. **Create a Testing Branch**
   ```bash
   git checkout -b security-updates
   ```

2. **Update One Package at a Time**
   ```bash
   npm update package-name
   npm test
   npm run build
   ```

3. **Test Thoroughly**
   - Run all automated tests
   - Manual testing of affected features
   - Check error logs

4. **Document Changes**
   - Note what was updated
   - Record any breaking changes
   - Update documentation

5. **Merge to Main**
   ```bash
   git checkout main
   git merge security-updates
   git push
   ```

---

## 📊 **Specific Package Updates Needed:**

### **Breaking Changes Required:**

1. **@nestjs/cli: 7.x → 11.0.16**
   - **Impact:** CLI commands, code generation
   - **Test:** `nest generate`, `nest build`
   - **Breaking Changes:** Check NestJS migration guide

2. **firebase-admin: 10.3.0 → 13.7.0**
   - **Impact:** Push notifications, Firebase services
   - **Test:** Send notification, verify Firebase connection
   - **Breaking Changes:** Check Firebase Admin SDK changelog

3. **@aws-sdk/client-s3: 3.x → 3.893.0**
   - **Impact:** File uploads to S3
   - **Test:** Upload file, download file, delete file
   - **Breaking Changes:** Check AWS SDK v3 migration guide

4. **prisma: 5.x → 6.19.2**
   - **Impact:** Database queries, migrations
   - **Test:** All database operations
   - **Breaking Changes:** Check Prisma upgrade guide

5. **@swc/cli: 0.x → 0.5.0**
   - **Impact:** TypeScript compilation
   - **Test:** Build process
   - **Breaking Changes:** Check SWC changelog

---

## 🎯 **Quick Commands Reference:**

### **Check Current Vulnerabilities:**
```bash
cd backend
npm audit
```

### **Check Production-Only Vulnerabilities:**
```bash
npm audit --production
```

### **Update Specific Package:**
```bash
npm update package-name
```

### **Force Update (Breaking Changes):**
```bash
npm install package-name@latest --save
```

### **Test After Update:**
```bash
npm test
npm run build
npm run start:dev
```

---

## 📝 **Notes:**

### **Important Reminders:**

1. **Always test in development first**
   - Never update packages directly in production
   - Use a separate branch for security updates

2. **Read changelogs before updating**
   - Check for breaking changes
   - Understand what's changing

3. **Update one package at a time**
   - Easier to identify what breaks
   - Easier to rollback if needed

4. **Keep backups**
   - Commit before updating
   - Tag stable versions

5. **Monitor after deployment**
   - Check error logs
   - Monitor performance
   - Watch for user reports

### **Resources:**

- **NestJS Migration Guide:** https://docs.nestjs.com/migration-guide
- **Firebase Admin SDK Changelog:** https://firebase.google.com/support/release-notes/admin/node
- **AWS SDK v3 Migration:** https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html
- **Prisma Upgrade Guide:** https://www.prisma.io/docs/guides/upgrade-guides
- **npm Security Best Practices:** https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities

---

## ✅ **Success Criteria:**

**Before marking this TODO as complete:**

- [ ] All critical vulnerabilities addressed
- [ ] All high vulnerabilities reviewed and fixed/accepted
- [ ] All tests passing
- [ ] Build process working
- [ ] Staging environment tested
- [ ] Production deployment successful
- [ ] No new bugs introduced
- [ ] Documentation updated
- [ ] Team informed of changes

---

## 🚀 **Current Priority:**

**NOT THIS! Focus on:**
1. ✅ Company registration
2. ✅ Building features
3. ✅ Testing functionality
4. ✅ Getting to MVP

**Come back to this TODO:**
- 📅 2-4 weeks before launch
- 📅 When features are complete
- 📅 During pre-launch checklist

---

**Last Updated:** March 18, 2026  
**Next Review:** Before Production Launch  
**Owner:** Development Team
