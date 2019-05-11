importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
if (workbox) {
  console.log("Yay! Workbox is loaded \uD83C\uDF89");
} else {
  console.log("Boo! Workbox didn't load \uD83D\uDE2C");
}
// Inject precache-manifest
workbox.precaching.precacheAndRoute([]);
// gstatic CDNs
workbox.routing.registerRoute(
  /.*\.gstatic\.com\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "gstatic"
  })
);
// Cache Google Fonts stylesheets
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets"
  })
);
// Cache jsDelivr
workbox.routing.registerRoute(
  /^https:\/\/cdn\.jsdelivr\.net\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets"
  })
);
// Handle any images
workbox.routing.registerRoute(
  /\.(?:jpg|jpeg|png|gif|webp|ico|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "illvart-images",
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
      })
    ]
  })
);
// CSS & JS
workbox.routing.registerRoute(
  /\.(?:js|mjs|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "illvart-static"
  })
);
// Force service worker to update immediately after installing
self.addEventListener("install", function(e) {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", function(e) {
  self.clients.claim();
});