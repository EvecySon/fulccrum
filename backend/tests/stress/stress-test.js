import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },    // Warm up
    { duration: '5m', target: 500 },    // Normal load
    { duration: '5m', target: 1000 },   // High load
    { duration: '5m', target: 2000 },   // Stress
    { duration: '5m', target: 5000 },   // Heavy stress
    { duration: '10m', target: 10000 }, // Find breaking point
    { duration: '3m', target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s (relaxed for stress)
    http_req_failed: ['rate<0.05'],     // Error rate under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n=== STRESS TEST RESULTS ===');
  console.log(`Max VUs reached: ${data.metrics.vus_max.values.max}`);
  console.log(`Total requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed requests: ${data.metrics.http_req_failed.values.passes}`);
  console.log(`Error rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);
  console.log(`Avg response time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`P95 response time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`Max response time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms`);
  
  if (data.metrics.http_req_failed.values.rate > 0.05) {
    console.log('\n⚠️  WARNING: Error rate exceeded 5% - system under stress!');
  }
  
  if (data.metrics.http_req_duration.values['p(95)'] > 2000) {
    console.log('\n⚠️  WARNING: Response time exceeded 2s - performance degraded!');
  }
  
  return {
    'stress-test-results.json': JSON.stringify(data, null, 2),
  };
}
