const CACHE_NAME = 'fiscal-audit-v14.2-FINAL'; // Mudei a versão para forçar a atualização

// 1. APENAS O ESSENCIAL PARA O APP ABRIR
// Removemos a lista de leis daqui para evitar que erros de digitação (como "limpezal.html") 
// impeçam o sistema de funcionar. O sistema vai baixar as leis automaticamente quando você clicar nelas.
const ASSETS_ESSENCIAIS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 2. INSTALAÇÃO (Pre-cache do essencial)
self.addEventListener('install', (event) => {
    // Força o SW a assumir o controle imediatamente, sem esperar fechar a aba
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Instalando o essencial...');
            return cache.addAll(ASSETS_ESSENCIAIS);
        })
    );
});

// 3. ATIVAÇÃO (Limpeza de caches velhos)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim(); // Controla todas as abas imediatamente
});

// 4. ESTRATÉGIA DE BUSCA (CACHE DINÂMICO)
// Quando o usuário clica em uma lei, o SW baixa e salva automaticamente.
self.addEventListener('fetch', (event) => {
    // Apenas requisições GET (ignora extensões e outros métodos)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // SUCESSO ONLINE:
                // Se baixou o arquivo corretamente (ex: clicou em Sorvete.html e ele existe),
                // faz uma cópia para o cache do celular.
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // FALHA/OFFLINE:
                // Se não tem internet, tenta entregar o que já está salvo no cache.
                return caches.match(event.request);
            })
    );
});
