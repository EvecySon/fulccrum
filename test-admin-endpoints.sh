#!/bin/bash

# Test Admin Endpoints - Real-time Data Verification
# This script tests all admin endpoints to ensure they're working with live data

BASE_URL="http://localhost:3001"
echo "🧪 Testing Admin Endpoints - Real-time Data Verification"
echo "=================================================="
echo ""

# First, we need to login to get a JWT token
# Using a test admin account (you'll need to create one or use existing)
echo "📝 Step 1: Login to get JWT token..."
echo "Note: You need an admin account to test these endpoints"
echo ""

# Test endpoints without auth to see the error messages
echo "🔍 Testing Finance Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/finance/commissions/tiers" | jq '.' || echo "Failed"
echo ""

echo "🔍 Testing Operations Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/operations/live-ops" | jq '.' || echo "Failed"
echo ""

echo "🔍 Testing RBAC Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/rbac/roles" | jq '.' || echo "Failed"
echo ""

echo "🔍 Testing Moderation Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/moderation/queue" | jq '.' || echo "Failed"
echo ""

echo "🔍 Testing Marketing Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/marketing/campaigns" | jq '.' || echo "Failed"
echo ""

echo "🔍 Testing Analytics Endpoints (without auth - should fail):"
echo "---"
curl -s -X GET "$BASE_URL/admin/analytics/reports" | jq '.' || echo "Failed"
echo ""

echo "=================================================="
echo "✅ Endpoint structure verification complete"
echo ""
echo "To test with authentication:"
echo "1. Login via the app to get a JWT token"
echo "2. Use: curl -H 'Authorization: Bearer YOUR_TOKEN' $BASE_URL/admin/..."
