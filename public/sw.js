/*
 * NAVRATRI service worker.
 *
 * Strategy, by resource class:
 *
 *   App shell (this file, the manifest, icons, the home page)
 *     Precached on install so a cold start with no network still renders.
 *
 *   /_next/static/** (content-hashed JS/CSS) and /icons/**
 *     Cache-first. Filenames embed a content hash, so a cached copy is by
 *     definition current. Immutable and safe to serve forever.
 *
 *   Same-origin navigations (the pages you actually read)
 *     Network-first, cached on success, cache fallback on failure. Online you
 *     always get fresh content; offline you get the last copy you fetched.
 *     That is the whole of "offline reading" for pages you have opened.
 *
 *   Everything else (external map tiles, fonts from a CDN, cross-origin)
 *     Never intercepted. Offline they simply fail, and the UI degrades
 *     gracefully — which is the existing low-data behaviour.
 *
 * "Selected offline" — a client component posts a list of URLs to precache
 * (CACHE_URLS) or to drop (CACHE_DROP). That is how a reader pins a chapter for
 * offline use without caching the whole site.
 *
 * The worker caches only same-origin GET requests and never caches the health
 * endpoint, so an offline device cannot be handed a stale "ok".
 */

const VERSION = "navratri-v1";
const PRECACHE = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;

/* Cold-start shell. "/" is the offline fallback for any page we have not seen. */
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![PRECACHE, PAGES, ASSETS].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* Client -> worker control channel for the "selected offline" pinning. */
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "CACHE_URLS" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(PAGES).then((cache) =>
        // addAll would abort the whole batch if one URL 404s; add individually.
        Promise.all(
          data.urls
            .filter((u) => typeof u === "string" && u.startsWith("/"))
            .map((u) => cache.add(u).catch(() => undefined)),
        ),
      ),
    );
    return;
  }

  if (data.type === "CACHE_DROP" && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(PAGES).then((cache) =>
        Promise.all(data.urls.map((u) => cache.delete(u).catch(() => false))),
      ),
    );
    return;
  }

  if (data.type === "CACHED_LIST") {
    event.waitUntil(
      caches
        .open(PAGES)
        .then((cache) => cache.keys())
        .then((keys) => keys.map((r) => new URL(r.url).pathname))
        .then((paths) => event.source?.postMessage({ type: "CACHED_LIST", paths })),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only ever serve same-origin GETs; let everything else hit the network.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the liveness probe.
  if (url.pathname.startsWith("/api/health")) return;

  // Immutable, content-hashed assets: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(req, ASSETS));
    return;
  }

  // Pages: network-first with cache fallback so offline reads work.
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, PAGES));
    return;
  }

  // Other same-origin GETs (images etc.): cache-first.
  event.respondWith(cacheFirst(req, ASSETS));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  // Offline and not cached: fetch throws and the caller sees a network error.
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === "basic") cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    // Fall back to the cached home shell so we never show a blank page.
    const shell = await caches.match("/");
    if (shell) return shell;
    throw err;
  }
}
