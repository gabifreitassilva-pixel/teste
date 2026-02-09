const CACHE_NAME = 'fiscal-audit-v13.8-master-final';

/**
 * Lista de ativos necessários para o funcionamento 
 * do motor de extração V13.8 e Auditoria.
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
    // CDNs de bibliotecas essenciais para extração de PDF e ZIP
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Salva a nova lógica de trava de duplicidade e PGDAS no cache
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache V13.8: Sincronizando motor de extração...');
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.warn('Aviso: Arquivo não encontrado para o cache offline:', url));
                })
            );
        })
    );
});

// Ativação: Limpa caches antigos (V13.7 e anteriores) para evitar conflitos
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

// Estratégia Fetch: Rede primeiro (para garantir dados novos), Cache como backup
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
