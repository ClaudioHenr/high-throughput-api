import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    scenarios: {
        baseline: {
        executor: 'constant-vus',
        vus: 100,
        duration: '30s',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],       // <1% erros
        http_req_duration: ['p(95)<300'],     // P95 < 300ms
    },
};

export default function () {
    const res = http.get('http://127.0.0.1:3000/items/test/items-no-pool');

    if (res.status !== 200) {
        console.error(`Request failed with status: ${res.status}`);
    }

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
