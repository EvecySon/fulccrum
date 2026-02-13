#!/usr/bin/env node

/**
 * Admin Real-time Data Verification Script
 * Tests all admin endpoints to ensure they're working with live data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, headers = {}, data = null) {
  try {
    const config = { method, url: `${BASE_URL}${url}`, headers };
    if (data) config.data = data;
    
    const response = await axios(config);
    log(`✅ ${name}: ${response.status}`, 'green');
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.message || error.message;
    
    if (status === 401) {
      log(`🔒 ${name}: ${status} - Authentication required (expected)`, 'yellow');
    } else if (status === 404) {
      log(`❌ ${name}: ${status} - Endpoint not found`, 'red');
    } else {
      log(`⚠️  ${name}: ${status} - ${message}`, 'yellow');
    }
    
    return { success: false, status, message };
  }
}

async function main() {
  log('\n🧪 ADMIN REAL-TIME DATA VERIFICATION', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  // Test Finance Endpoints
  log('\n📊 FINANCE ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Commission Tiers - List', 'GET', '/admin/finance/commissions/tiers');
  await testEndpoint('Revenue Analytics', 'GET', '/admin/finance/revenue/analytics?range=week');
  await testEndpoint('Revenue Forecast', 'GET', '/admin/finance/revenue/forecast');
  await testEndpoint('Refunds - List', 'GET', '/admin/finance/refunds');
  
  // Test Operations Endpoints
  log('\n🚨 OPERATIONS ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Live Operations', 'GET', '/admin/operations/live-ops');
  await testEndpoint('Incidents - List', 'GET', '/admin/operations/incidents');
  await testEndpoint('SLA Breaches', 'GET', '/admin/operations/sla/breaches');
  await testEndpoint('SLA Configs', 'GET', '/admin/operations/sla/configs');
  
  // Test RBAC Endpoints
  log('\n🔐 RBAC ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Roles - List', 'GET', '/admin/rbac/roles');
  await testEndpoint('Permissions - List', 'GET', '/admin/rbac/permissions');
  await testEndpoint('Audit Logs - List', 'GET', '/admin/rbac/audit-logs');
  
  // Test Moderation Endpoints
  log('\n🛡️  MODERATION ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Moderation Queue', 'GET', '/admin/moderation/queue');
  await testEndpoint('Merchant Compliance', 'GET', '/admin/moderation/compliance');
  
  // Test Marketing Endpoints
  log('\n📢 MARKETING ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Campaigns - List', 'GET', '/admin/marketing/campaigns');
  await testEndpoint('Promo Codes - List', 'GET', '/admin/marketing/promo-codes');
  
  // Test Analytics Endpoints
  log('\n📈 ANALYTICS ENDPOINTS', 'blue');
  log('-'.repeat(60), 'blue');
  await testEndpoint('Custom Reports - List', 'GET', '/admin/analytics/reports');
  await testEndpoint('Cohort Analysis', 'GET', '/admin/analytics/cohorts?type=customer');
  
  log('\n' + '='.repeat(60), 'cyan');
  log('✅ VERIFICATION COMPLETE', 'cyan');
  log('\nNOTE: 401/403 responses are expected - endpoints require authentication', 'yellow');
  log('404 responses indicate missing routes that need to be fixed\n', 'yellow');
}

main().catch(console.error);
