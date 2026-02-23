#!/bin/bash

# Quick Test Script - Run this before production
# Tests all critical features in 5 minutes

echo "🚀 Starting Quick Pre-Production Tests..."
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

# Function to test with timing
test_with_timing() {
    local name=$1
    local url=$2
    local max_time=$3
    
    echo -n "Testing $name (max ${max_time}ms)... "
    
    start=$(date +%s%N)
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    end=$(date +%s%N)
    
    duration=$(( (end - start) / 1000000 ))
    
    if [ "$response" -eq 200 ] && [ "$duration" -lt "$max_time" ]; then
        echo -e "${GREEN}✓ PASS${NC} (${duration}ms)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (${duration}ms, Status: $response)"
        ((FAILED++))
    fi
}

echo "=== 1. Health Checks ==="
test_endpoint "Basic Health" "$BASE_URL/health" 200
test_endpoint "Database Health" "$BASE_URL/health/database" 200
test_endpoint "Cache Health" "$BASE_URL/health/cache" 200
test_endpoint "Queue Health" "$BASE_URL/health/queue" 200
test_endpoint "All Health Checks" "$BASE_URL/health/all" 200
echo ""

echo "=== 2. Performance Tests ==="
test_with_timing "Health Endpoint" "$BASE_URL/health" 100
test_with_timing "Cache Endpoint" "$BASE_URL/health/cache" 200
echo ""

echo "=== 3. Cache Test ==="
echo -n "Testing cache (first call - cache miss)... "
start=$(date +%s%N)
curl -s "$BASE_URL/health/cache" > /dev/null
end=$(date +%s%N)
first_call=$(( (end - start) / 1000000 ))
echo "${first_call}ms"

echo -n "Testing cache (second call - cache hit)... "
start=$(date +%s%N)
curl -s "$BASE_URL/health/cache" > /dev/null
end=$(date +%s%N)
second_call=$(( (end - start) / 1000000 ))
echo "${second_call}ms"

if [ "$second_call" -lt "$first_call" ]; then
    echo -e "${GREEN}✓ Cache working${NC} (${second_call}ms < ${first_call}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Cache may not be working${NC}"
    ((FAILED++))
fi
echo ""

echo "=== 4. Queue Test ==="
echo "Checking queue status..."
curl -s "$BASE_URL/health/queue" | jq '.queues[] | {queue: .queue, waiting: .waiting, active: .active, failed: .failed}'
echo ""

echo "=== 5. Load Test (100 requests) ==="
echo "Sending 100 concurrent requests..."
echo "This will take ~10 seconds..."

success=0
errors=0

for i in {1..100}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" &)
    if [ "$response" -eq 200 ]; then
        ((success++))
    else
        ((errors++))
    fi
done

wait

echo "Success: $success, Errors: $errors"
if [ "$errors" -eq 0 ]; then
    echo -e "${GREEN}✓ Load test passed${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Load test failed${NC} ($errors errors)"
    ((FAILED++))
fi
echo ""

echo "=== Test Summary ==="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Review before deploying.${NC}"
    exit 1
fi
