import http from 'k6/http'
import { check } from 'k6'

export const options = {
    vus: 1,
    iterations: 5,
}

export default function () {
    const res = http.get('http://127.0.0.1:3000/items/test/db')

    check(res, {
        'circuit is open': r => r.status === 503,
        'fail fast latency': r => r.timings.duration < 10,
    })
}
