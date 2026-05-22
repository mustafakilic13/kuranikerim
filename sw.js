// sw.js — Service Worker for Kur'an-ı Kerim PWA
// Statik dosyalar: cache-first | Ses dosyaları: cache-first + arka planda kaydet

const APP_VERSION = 'v2';
const STATIC_CACHE = 'kuran-static-' + APP_VERSION;
const AUDIO_CACHE  = 'kuran-audio-' + APP_VERSION;

// İlk yüklemede cache'lenecek dosyalar
const STATIC_FILES = [
  '/kuranikerim/',
  '/kuranikerim/index.html',
  '/kuranikerim/quran-data-full.json',
  '/kuranikerim/meal.json',
  '/kuranikerim/tafsir.json',
  '/kuranikerim/sura_info.json',
  '/kuranikerim/words.json',
  '/kuranikerim/ScheherazadeNew-Regular.woff2',
  '/kuranikerim/ScheherazadeNew-Medium.woff2',
  '/kuranikerim/ScheherazadeNew-Bold.woff2',
];

// ── Install: statik dosyaları cache'e al ─────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      // Her dosyayı ayrı ayrı dene, hata olursa atla
      return Promise.allSettled(
        STATIC_FILES.map(url =>
          cache.add(url).catch(e => console.warn('Cache skip:', url, e.message))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: eski cache'leri temizle ────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== AUDIO_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: istekleri yakala ───────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ses dosyaları (everyayah.com) → cache-first, yoksa fetch + cache'e kaydet
  if (url.hostname === 'everyayah.com') {
    event.respondWith(handleAudio(event.request));
    return;
  }

  // Statik dosyalar → cache-first, yoksa network
  if (event.request.method === 'GET') {
    event.respondWith(handleStatic(event.request));
  }
});

async function handleStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    // Offline ve cache'de yok
    return new Response('Offline - dosya bulunamadı', { status: 503 });
  }
}

async function handleAudio(request) {
  // Önce cache'e bak
  const cached = await caches.match(request);
  if (cached) return cached;

  // Cache'de yoksa indir ve kaydet
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(AUDIO_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) {
    return new Response('Ses dosyası çevrimdışı kullanılamıyor', { status: 503 });
  }
}
