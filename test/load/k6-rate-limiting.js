import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    iterations: 50,
};

export default function () {
    const res = http.get('http://127.0.0.1:3000/items');

    check(res, {
        'status 200 or 429': (r) =>
        r.status === 200 || r.status === 429,
    });
}
