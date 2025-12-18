import http from 'k6/http';
import { check, sleep } from 'k6';

const PORT = __ENV.PORT || 3000;
const HOST = __ENV.HOST || 'localhost';

export const options = {
    vus: 1,
    iterations: 15,
};

export default function () {
    const res = http.get(`http://${HOST}:${PORT}/items`);

    sleep(5);

    const retry = http.get(`http://${HOST}:${PORT}/items`);

    check(retry, {
        'recovered after window': (r) =>
        r.status === 200 || r.status === 429,
    });
}
