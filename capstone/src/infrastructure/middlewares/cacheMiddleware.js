export default function cacheMiddleware(configuration) {
    const cache = new Map();
    return (request, response, next) => {
        console.log(`${request.method} ${request.originalUrl}`);
        const bodyKey = JSON.stringify(request.body || {});
        const key = request.method + ':' + request.originalUrl + ':' + bodyKey;
        const nowDate = Date.now();
        const intercepted = response.json.bind(response);
        if (request.method === 'GET') {
            const value = cache.get(key);
            if (value != null && nowDate < value.expiryDate) {
                console.log('using cache', value.data);
                value.lastAccess = nowDate;
                return intercepted(value.data);
            }
            console.log('no cache stored yet for that request', Object.fromEntries(cache));
            response.json = (data) => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    console.log('saving cache');
                    const nowDate = Date.now();
                    cache.set(key, {
                        data: data,
                        expiryDate: nowDate + configuration.maxAge,
                        lastAccess: nowDate
                    });
                    if (cache.size > configuration.max) {
                        console.log(`there is no available space for the cache ${cache.size}/${configuration.max}`);
                        console.log('deleting oldest cache', Object.fromEntries(cache));
                        const oldestCache = [...cache.entries()].reduce((accumulator, [key, value]) => {
                            if (value.lastAccess < accumulator[1].lastAccess) {
                                return [key, value];
                            } else {
                                return accumulator;
                            }
                        }, [...cache.entries()][0]);

                        cache.delete(oldestCache[0]);
                        console.log('oldest cache deleted', Object.fromEntries(cache));
                    }

                    console.log(`actual space ${cache.size}/${configuration.max}`);
                }

                return intercepted(data);
            }
        } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            response.json = (data) => {
                const prefix = request.originalUrl.split('/').slice(0, request.originalUrl.lastIndexOf('/')).join('/');
                console.log('data was modified deleting cache from related routes:', Object.fromEntries(cache));
                cache.delete(`GET:${request.originalUrl}:${bodyKey}`);
                [...cache.keys()].forEach(key => {
                    if (key.startsWith(`GET:${prefix}`)) {
                        cache.delete(key);
                    }
                });
                console.log('cache successfully deleted:', Object.fromEntries(cache));
                return intercepted(data);
            }
        }
        next();
    }
}