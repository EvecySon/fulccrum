import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    concurrent_orders: {
      executor: 'shared-iterations',
      vus: 10,              // 10 users trying simultaneously
      iterations: 10,       // 10 total orders
      maxDuration: '30s',
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const TOKEN = __ENV.AUTH_TOKEN || 'your-test-token-here';
const ITEM_ID = __ENV.ITEM_ID || 'test-item-with-limited-stock';

export default function () {
  // All users try to order the same item with limited stock
  const payload = JSON.stringify({
    businessId: 'test-business',
    items: [
      {
        menuItemId: ITEM_ID,
        quantity: 1,
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/orders`, payload, params);

  // Either order succeeds OR we get "Insufficient stock" error
  // No other outcome should happen (no race conditions)
  check(res, {
    'order created or stock insufficient': (r) => 
      r.status === 201 || 
      (r.status === 400 && r.body.includes('Insufficient stock')),
    'no server errors': (r) => r.status !== 500,
  });
}

export function handleSummary(data) {
  const successfulOrders = data.metrics.checks.values.passes;
  const totalAttempts = data.metrics.iterations.values.count;
  
  console.log('\n=== RACE CONDITION TEST RESULTS ===');
  console.log(`Total order attempts: ${totalAttempts}`);
  console.log(`Successful checks: ${successfulOrders}`);
  console.log(`\nExpected behavior:`);
  console.log(`- Some orders succeed (stock available)`);
  console.log(`- Some orders fail with "Insufficient stock"`);
  console.log(`- NO race conditions (no negative stock)`);
  console.log(`- NO server errors (500)`);
  
  return {
    'race-test-results.json': JSON.stringify(data, null, 2),
  };
}
