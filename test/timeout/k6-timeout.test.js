import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  iterations: 50,
};

export default function () {
  const res = http.get('http://localhost:3000/test/slow-items?delay=5000');

  check(res, {
    'status is timeout or 503': r =>
      r.status === 503 || r.status === 504,
  });
}
