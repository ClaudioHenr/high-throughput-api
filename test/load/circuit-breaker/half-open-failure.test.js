import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    iterations: 3,
}

export default function () {
    sleep(35)

    const res = http.get('http://localhost:3000/items/test/db')

    check(res, {
        'half-open failed and reopened': r =>
        r.status === 503 || r.status === 504,
    })
}
