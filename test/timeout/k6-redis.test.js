export default function () {
    const res = http.get('http://127.0.0.1:3000/redis-slow');

    check(res, {
        'redis timeout': r => r.status === 504,
    });
}
