import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    errors: ['rate<0.1'],              // Custom error rate under 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Test 1: Health Check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Menu Loading (Should be cached and fast)
  res = http.get(`${BASE_URL}/api/menu/business/test-business/categories`);
  check(res, {
    'menu load status 200': (r) => r.status === 200,
    'menu load time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Cache Health Check
  res = http.get(`${BASE_URL}/health/cache`);
  check(res, {
    'cache health status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Queue Health Check
  res = http.get(`${BASE_URL}/health/queue`);
  check(res, {
    'queue health status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `
${indent}Test Summary:
${indent}============
${indent}
${indent}Total Requests: ${data.metrics.http_reqs.values.count}
${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes}
${indent}Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}Request Duration (max): ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
${indent}
${indent}Thresholds:
${indent}  ✓ 95% requests < 500ms: ${data.metrics.http_req_duration.values['p(95)'] < 500 ? 'PASS' : 'FAIL'}
${indent}  ✓ Error rate < 1%: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}% - ${data.metrics.http_req_failed.values.rate < 0.01 ? 'PASS' : 'FAIL'}
${indent}
${indent}Virtual Users: ${data.metrics.vus.values.value}
${indent}Iterations: ${data.metrics.iterations.values.count}
${indent}Data Received: ${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB
${indent}Data Sent: ${(data.metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB
  `;
  
  return summary;
}
