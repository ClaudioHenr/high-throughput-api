import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 20,
    iterations: 50,
};

export default function () {
    const res = http.get('http://127.0.0.1:3000/db-slow');

    check(res, {
        'status is 504': r => r.status === 504,
    });
}
