import http from 'k6/http';
import { check } from 'k6';

const SEARCH_URL =
  'https://api-with-bugs.practicesoftwaretesting.com/products/search?q=hammer';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const response = http.get(SEARCH_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response body contains hammer': (r) =>
      typeof r.body === 'string' && r.body.toLowerCase().includes('hammer'),
  });
}
