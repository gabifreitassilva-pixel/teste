const CACHE_NAME = 'fiscal-audit-v16.1-master-final';

const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    // LEGISLAÇÃO ESTADUAL
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    // LEGISLAÇÃO FEDERAL
    './PIS COFINS.HTML',
    // BIBLIOTECAS
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(ASSETS.map(url => cache.add(url).catch(err => console.log('Aviso SW:', url))));
    }));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
