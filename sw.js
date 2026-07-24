const CACHE_NAME = 'all-resources-cache-v1';
let password = '';
let cachedKey = null;
let lastSaltHex = '';
let currentVersion = '';
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SET_KEY') {
		password = event.data.password;
		if (event.data.version && currentVersion !== event.data.version) {
			currentVersion = event.data.version;
			caches.delete(CACHE_NAME);
			cachedKey = null;
			lastSaltHex = '';
		}
	}
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
	if (url.pathname.endsWith('index.js')) {
		event.respondWith(handleDecrypt(event.request));
		return;
	}
	if (url.origin === location.origin) {
		const isNavigation = event.request.mode === 'navigate';
		const isManifest = url.pathname.endsWith('manifest.json');
		if (isNavigation || isManifest) {
			event.respondWith(fetch(event.request).then(networkResponse => {
				if (networkResponse && networkResponse.status === 200) {
					const responseToCache = networkResponse.clone();
					caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
				}
				return networkResponse;
			}).catch(() => {
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
	const url = new URL(request.url);
	const cache = await caches.open(CACHE_NAME);
	let response = await cache.match(request);
	if (!response) {
		let fetchRequest = request;
		if (url.pathname.endsWith('index.js') && currentVersion) {
			const bustUrl = `${request.url}?v=${currentVersion}`;
			fetchRequest = new Request(bustUrl, {
				headers: request.headers,
				credentials: request.credentials,
				mode: request.mode
			});
		}
		response = await fetch(fetchRequest);
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
	const saltHex = Array.from(new Uint8Array(salt)).map(b => b.toString(16).padStart(2, '0')).join('');
	let key;
	if (cachedKey && saltHex === lastSaltHex) {
		key = cachedKey;
	} else {
		const encoder = new TextEncoder();
		const pwdBytes = encoder.encode(password);
		const saltBytes = new Uint8Array(salt);
		const combined = new Uint8Array(pwdBytes.length + saltBytes.length);
		combined.set(pwdBytes);
		combined.set(saltBytes, pwdBytes.length);
		const keyHash = await crypto.subtle.digest('SHA-256', combined);
		key = await crypto.subtle.importKey('raw', keyHash, 'AES-GCM', false, ['decrypt']);
		cachedKey = key;
		lastSaltHex = saltHex;
	}
	const decrypted = await crypto.subtle.decrypt({
		name: 'AES-GCM',
		iv: iv
	}, key, data);
	return new Response(decrypted, {
		headers: {'Content-Type': 'application/javascript; charset=utf-8'}
	});
}