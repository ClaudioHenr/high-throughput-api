import http from 'k6/http';
import { check } from 'k6';

const PORT = __ENV.PORT || 3000;
const HOST = __ENV.HOST || 'localhost';

export const options = {
    vus: 20,
    iterations: 100,
};

export default function () {
    const ip = `192.168.0.${__VU}`;

    const res = http.get(`http://${HOST}:${PORT}/items`, {
        headers: {
        'X-Forwarded-For': ip,
        },
    });

    check(res, {
        'valid response': (r) =>
        r.status === 200 || r.status === 429,
    });
}
