import http from 'k6/http'
import { check } from 'k6'

export const options = {
    vus: 100,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<50'],
    },
}

export default function () {
    const res = http.get('http://localhost:3000/items/test/db')

    check(res, {
        'fast failure': r => r.status === 503,
    })
}
