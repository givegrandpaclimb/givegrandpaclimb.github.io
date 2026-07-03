const CACHE_NAME = 'all-resources-cache-v1';
const HOST_TO_CACHE = 'givegrandpaclimb.github.io';
let password = '';
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SET_KEY') password = event.data.password;
});
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
	if (url.pathname.endsWith('/index.js')) {
		event.respondWith(handleDecrypt(event.request));
		return;
	}
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
async function handleDecrypt(request) {
	const cache = await caches.open(CACHE_NAME);
	let response = await cache.match(request);
	if (!response) {
		response = await fetch(request);
		if (!response.ok) return response;
		await cache.put(request, response.clone());
	}
	const arrayBuffer = await response.arrayBuffer();
	if (arrayBuffer.byteLength < 28) {
		return new Response('console.error("Invalid encrypted file size");', {
			status: 500,
			headers: {'Content-Type': 'application/javascript'}
		});
	}
	const salt = arrayBuffer.slice(0, 16);
	const iv = arrayBuffer.slice(16, 28);
	const data = arrayBuffer.slice(28);
	if (!password) {
		return new Response('console.warn("Waiting for password...");', {
			headers: {'Content-Type': 'application/javascript; charset=utf-8'}
		});
	}
	const encoder = new TextEncoder();
	const pwKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
	const key = await crypto.subtle.deriveKey({
		name: 'PBKDF2',
		salt: salt,
		iterations: 10000,
		hash: 'SHA-256'
	}, pwKey, {
		name: 'AES-GCM',
		length: 256
	}, false, ['decrypt']);
	const decrypted = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: iv
	}, key, data);
	return new Response(decrypted, {
		headers: {'Content-Type': 'application/javascript; charset=utf-8'}
	});
}