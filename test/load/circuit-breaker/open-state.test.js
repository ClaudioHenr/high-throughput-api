import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    iterations: 10,
}

export default function () {
    const res = http.get('http://localhost:3000/items/test/redis')

    check(res, {
        'circuit open returns 503': r => r.status === 503,
        'fail-fast latency': r => r.timings.duration < 10,
    })

    sleep(0.2)
}
