const CACHE_NAME = 'fiscal-audit-v13.3-master';

/**
 * Lista de todos os ficheiros necessários para o funcionamento 
 * completo do sistema em modo Offline.
 */
const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    './base reduzida.html',
    './Artigos de papelaria.html',
    './auto pecas.html',
    './bebidas alcolicas exceto cerveja e chope.html',
    './Bicicletas.html',
    './Brinquedos e artigos de esporte.html',
    './cerveja chopes refrigerante agua e outras bebidas.html',
    './cimentos.html',
    './Eletronicos e eletrodomesticosl.html',
    './energia eletrica.html',
    './ferramenta.html',
    './Instrumentos Musicais.html',
    './lampadas reatores e starters.html',
    './materiais de contrucao e congeneres vidros e metais.html',
    './materiais de contrucao e congeneres.html',
    './Materiais eletricos.html',
    './Perfumaria e higiene pessoal.html',
    './Pneumáticos e Câmaras de Ar.html',
    './produto de limpezal.html',
    './Produtos alimenticios.html',
    './Ração Animal.html',
    './Sorvete e Preparado para Sorvete.html',
    './Tintas, Vernizes e Produtos Químicos.html',
    './Veículos Automotores Novos.html',
    './pis e cofins.html',
    // Bibliotecas Externas para processamento de arquivos
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

/**
 * Instalação: Cria o cache e guarda os ficheiros.
 * O skipWaiting força a ativação imediata da nova versão.
 */
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache V13.3 MASTER: Armazenando recursos...');
            return cache.addAll(ASSETS);
        })
    );
});

/**
 * Ativação: Limpa caches de versões anteriores para evitar 
 * conflitos de scripts ou interfaces antigas.
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

/**
 * Fetch: Intercepta as requisições. 
 * Tenta buscar na rede primeiro para garantir dados atualizados; 
 * se falhar (sem internet), serve o ficheiro do cache.
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
