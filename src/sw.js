/*eslint-env browser */
/*global importScripts,workbox */
//importScripts('workbox/workbox-sw.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.0/workbox-sw.js');
workbox.setConfig({
  debug: true,
});
const workboxCacheNames = workbox.cacheNames;
const cacheNames = {
  webFonts: 'web-fonts-cache-v1',
  webStatic: 'web-static-cache-v1',
  webPage: 'web-page-cache-v1',
  webAssets: 'web-assets-cache-v1',
  ...workboxCacheNames,
};

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST, {
    cleanURLs: false, // don't allow "foo" for "foo.html"
  });
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

/* workbox.routing.registerNavigationRoute('/'); */

// Aggressively claimed and reloaded on install/activate
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
// Define a list of allowed caches. If a cache does not appear in the list then it will be deleted.
self.addEventListener('activate', (event) => {
  const promises = Promise.resolve().then(async () => {
    const allowedCaches = new Set(Object.values(cacheNames));
    const cacheKeys = await caches.keys();
    for (const cacheKey of cacheKeys) {
      if (!allowedCaches.has(cacheKey)) {
        await caches.delete(cacheKey);
      }
    }
  });
  event.waitUntil(promises);
});
// This deletes the default Workbox runtime cache, which was previously growing unbounded.
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete(cacheNames.runtime));
});
// Claim unclaimed clients (only relevant for new installs).
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

workbox.googleAnalytics.initialize();

const fontExpirationPlugin = new workbox.expiration.Plugin({
  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 yr
});
const staticExpirationPlugin = new workbox.expiration.Plugin({
  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
});
const contentExpirationPlugin = new workbox.expiration.Plugin({
  maxEntries: 50, // store the most recent ~50 articles
});
const assetExpirationPlugin = new workbox.expiration.Plugin({
  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 wk
  maxEntries: 100, // allow a large number of images, but expire quickly
});

// Cache font files
workbox.routing.registerRoute(
  ({request}) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: cacheNames.webFonts,
    plugins: [fontExpirationPlugin],
  }),
);

// Cache css and js files
// https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
workbox.routing.registerRoute(
  ({request}) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.CacheFirst({
    cacheName: cacheNames.webStatic,
    plugins: [staticExpirationPlugin],
  }),
);

// Matches a whole pathname on the Service Worker's host
function matchSameOriginRegExp(pathRegexp) {
  return ({url}) => {
    if (url.host !== self.location.host) {
      return false;
    }
    const m = pathRegexp.exec(url.pathname);
    if (!m) {
      return false;
    }
    return Array.from(m);
  };
}

// Matches a normal routes
// This won't match any URL that contains a "." except for a trailing ".html"
const pagePathRe = new RegExp('^/[\\w-/]*(?:|\\.html)$');

const indexHtmlCacheKeyPlugin = {
  cacheKeyWillBeUsed: async ({request}) => {
    const u = new URL(request.url);
    if (u.pathname.endsWith('/index.html')) {
      const normalized = u.pathname.substr(0, u.pathname.length - 'index.html'.length);
      return normalized + u.search;
    }
    return request;
  },
};

// Cache pages
const pageStrategy = new workbox.strategies.NetworkFirst({
  cacheName: cacheNames.webPage,
  plugins: [indexHtmlCacheKeyPlugin, contentExpirationPlugin],
});
const pageMatch = matchSameOriginRegExp(pagePathRe);
workbox.routing.registerRoute(pageMatch, pageStrategy);

// Cache assets
const assetStrategy = new workbox.strategies.StaleWhileRevalidate({
  cacheName: cacheNames.webAssets,
  plugins: [assetExpirationPlugin],
});
workbox.routing.registerRoute(new RegExp('/images/.*'), assetStrategy);
workbox.routing.registerRoute(({request}) => request.destination === 'image', assetStrategy);

workbox.routing.setCatchHandler(async ({url}) => {
  // If we see an internal error in pageMatch above, assume we're offline and serve the page from the cache.
  if (pageMatch({url})) {
    const response = await workbox.precaching.matchPrecache('/offline/index.html');
    const headers = new Headers(response.headers);
    headers.set('X-Offline', '1');
    const clone = new Response(await response.text(), {
      headers,
    });
    return clone;
  }
});
