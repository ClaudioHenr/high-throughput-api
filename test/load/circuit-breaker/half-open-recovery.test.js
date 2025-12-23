import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    iterations: 3,
}

export default function () {
    sleep(35) // maior que openTimeout

    const res = http.get('http://localhost:3000/items/test/redis')

    check(res, {
        'half-open success': r => r.status === 200,
    })
}
