import http from 'k6/http';

const PORT = __ENV.PORT || 3000;
const HOST = __ENV.HOST || 'localhost';

export const options = {
    vus: 100,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<300'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    http.get(`http://${HOST}:${PORT}/items`);
}
