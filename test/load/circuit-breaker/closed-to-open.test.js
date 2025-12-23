import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    iterations: 10,
}

export default function () {
    const res = http.get('http://127.0.0.1:3000/items/test/db')

    check(res, {
        'status is timeout or circuit open': r =>
        r.status === 504 || r.status === 503,
    })

    sleep(0.2)
}
