const CACHE_NAME = 'all-resources-cache';
const HOST_TO_CACHE = 'givegrandpaclimb.github.io';
// 安装时直接激活
self.addEventListener('install', (event) => {
	self.skipWaiting();
});
// 激活时接管所有页面
self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});
// 拦截请求：实现 Cache-First (缓存优先) 策略
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	// 只缓存指定域名下的请求，或者同源的本地静态资源请求
	if (url.host === HOST_TO_CACHE || url.origin === location.origin) {
		event.respondWith(caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse; // 命中缓存，直接返回
			}
			// 未命中缓存，请求网络并存入缓存
			return fetch(event.request).then((networkResponse) => {
				if (networkResponse && networkResponse.status === 200) {
					const responseToCache = networkResponse.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
				}
				return networkResponse;
			}).catch(() => {
				// 离线且无缓存时的降级处理
			});
		}));
	}
});