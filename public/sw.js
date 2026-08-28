const CACHE_NAME = 'movement-prescription-v8'
const APP_SHELL = [
  '/',
  '/favicon.svg',
  '/assets/app.js',
  '/assets/app.css',
  '/exercises/pendulum.png',
  '/exercises/table-slide.png',
  '/exercises/cane-er.png',
  '/exercises/wall-slide.png',
  '/exercises/cross-body.png',
  '/exercises/towel-ir.png',
  '/exercises/press-up.png',
  '/exercises/standing-extension.png',
  '/exercises/knee-to-chest.png',
  '/exercises/bridge.png',
  '/exercises/walking.png',
  '/exercises/neck-control.png',
  '/exercises/shoulder-isometric.png',
  '/exercises/wrist-loading.png',
  '/exercises/heel-slide.png',
  '/exercises/sit-to-stand.png',
  '/exercises/hip-abduction.png',
  '/exercises/hip-abduction-isometric.png',
  '/exercises/quad-set.png',
  '/exercises/step-up.png',
  '/exercises/ankle-mobility.png',
  '/exercises/single-leg-balance.png',
  '/exercises/plantar-stretch.png',
  '/exercises/calf-stretch.png',
  '/exercises/calf-loading.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/'))),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
      return response
    })),
  )
})
