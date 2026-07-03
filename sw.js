
let password = '';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(clients.claim());
});

self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SET_KEY') {
        password = e.data.password;
    }
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    
    if (url.pathname.endsWith('/index.js')) {
        e.respondWith(handleDecrypt(e.request));
    }
});

async function handleDecrypt(request) {
    try {
        if (!password) throw new Error('No password');
        const response = await fetch(request);
        if (!response.ok) return response;

        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength < 28) {
            return new Response("Invalid file", { status: 500 });
        }

        
        const salt = arrayBuffer.slice(0, 16);
        const iv = arrayBuffer.slice(16, 28);
        const data = arrayBuffer.slice(28);

        const encoder = new TextEncoder();
        const pwKey = await crypto.subtle.importKey(
            'raw', 
            encoder.encode(password), 
            'PBKDF2', 
            false, 
            ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 10000, hash: 'SHA-256' },
            pwKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        
        return new Response(decrypted, {
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
        });
    } catch (err) {
        console.error('解密失败:', err);
        
        const errorScript = "alert('密钥错误或解密失败！'); localStorage.removeItem('site_key'); location.reload();";
        return new Response(errorScript, {
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
        });
    }
}
				