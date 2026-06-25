const CACHE_NAME = 'all-resources-cache-v1';
const HOST_TO_CACHE = 'givegrandpaclimb.github.io';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
	event.waitUntil(caches.keys().then(cacheNames => {
		return Promise.all(cacheNames.map(cacheName => {
			if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
		}));
	}).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
	const url = new URL(event.request.url);
	if (event.request.method !== 'GET') return;
	if (url.host === HOST_TO_CACHE || url.origin === location.origin) {
		const isNavigation = event.request.mode === 'navigate';
		const isManifest = url.pathname.endsWith('manifest.json');
		if (isNavigation || isManifest) {
			event.respondWith(fetch(event.request)
			.then(networkResponse => {
				if (networkResponse && networkResponse.status === 200) {
					const responseToCache = networkResponse.clone();
					caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
				}
				return networkResponse;
			})
			.catch(() => {
				return caches.match(event.request);
			}));
		} else {
			event.respondWith(caches.match(event.request).then(cachedResponse => {
				if (cachedResponse) return cachedResponse;
				return fetch(event.request).then(networkResponse => {
					if (networkResponse && networkResponse.status === 200) {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then(cache => {
							cache.put(event.request, responseToCache);
						});
					}
					return networkResponse;
				});
			}));
		}
	}
});