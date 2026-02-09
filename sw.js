const CACHE_NAME = 'fiscal-audit-v15.0-legis-final';

// Lista de ativos necessários (INCLUINDO TODOS OS HTMLs DE LEGISLAÇÃO)
const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    // LEGISLAÇÃO ESTADUAL
    './Artigos de papelaria.html',
    './Bicicletas.html',
    './Brinquedos e artigos de esporte.html',
    './Eletrônicos e eletrodomesticosl.html',
    './Instrumentos Musicais.html',
    './Materiais elétricos.html',
    './Perfumaria e higiene pessoal.html',
    './Pneumáticos e Câmaras de Ar.html',
    './Produtos alimentícios.html',
    './Ração Animal.html',
    './Sorvete e Preparado para Sorvete.html',
    './Tintas, Vernizes e Produtos Químicos.html',
    './Veículos Automotores Novos.html',
    './auto pecas.html',
    './base reduzida.html',
    './bebidas alcoólicas exceto cerveja e chope.html',
    './cerveja chopes refrigerante agua e outras bebidas.html',
    './cimentos.html',
    './energia elétrica.html',
    './ferramenta.html',
    './lampadas reatores e starters.html',
    './materiais de construção e congêneres.html',
    './produto de descubral.html',
    // LEGISLAÇÃO FEDERAL
    './pis e cofins.html',
    // BIBLIOTECAS
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Salva a nova lista completa no cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.log(`Aviso: Arquivo opcional ausente: ${url}`));
                })
            );
        })
    );
});

// Ativação: Limpa versões antigas
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

// Estratégia Fetch: Rede primeiro, Cache como fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
