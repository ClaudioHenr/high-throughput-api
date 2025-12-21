import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {
    const res = http.get('http://127.0.0.1:3000/redis-slow');

    check(res, {
        'redis timeout': r => r.status === 504,
    });
}
