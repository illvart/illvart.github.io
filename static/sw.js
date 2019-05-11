importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
if (workbox) {
  console.log("Yay! Workbox is loaded \uD83C\uDF89");
} else {
  console.log("Boo! Workbox didn't load \uD83D\uDE2C");
}
// Inject precache-manifest
workbox.precaching.precacheAndRoute([
  {
    "url": "404.html",
    "revision": "4b00dbdf42ccce80717a8f3f90d4be45"
  },
  {
    "url": "assets/css/style.css",
    "revision": "0c0944dfeab167d1fc825f7d47249f16"
  },
  {
    "url": "assets/css/style.min.css",
    "revision": "ee8a674e0f3b2b76c38eb080fee2c16e"
  },
  {
    "url": "assets/img/avatar-180.png",
    "revision": "d129dc07152ca49162f1849d4a7134d2"
  },
  {
    "url": "assets/img/avatar.png",
    "revision": "14b464c990c20558c3ede543c8642953"
  },
  {
    "url": "assets/img/banner.png",
    "revision": "d09844e2d6617c37361778d72304e815"
  },
  {
    "url": "assets/img/logo/favicon32.png",
    "revision": "9a40b4711351956db775584ce9a13965"
  },
  {
    "url": "assets/img/logo/icon-114x114.png",
    "revision": "76cf3ab595c864065a1c879a238ee716"
  },
  {
    "url": "assets/img/logo/icon-128x128.png",
    "revision": "92e937aabb096c4db1e65df007630a03"
  },
  {
    "url": "assets/img/logo/icon-144x144.png",
    "revision": "b7dbf83f545fe5d8a1de677bf9fca471"
  },
  {
    "url": "assets/img/logo/icon-152x152.png",
    "revision": "906e71102b98d6edd7b35eb645dccef8"
  },
  {
    "url": "assets/img/logo/icon-192x192.png",
    "revision": "740c343c9227832b1ce2e7823512d496"
  },
  {
    "url": "assets/img/logo/icon-256x256.png",
    "revision": "98d3759e9ca122c7d25a7cbe3aee5313"
  },
  {
    "url": "assets/img/logo/icon-512x512.png",
    "revision": "54ddbbb8286b7647f018dfc1426cb885"
  },
  {
    "url": "assets/img/logo/icon-57x57.png",
    "revision": "48f2b9678036e253eb75aad882d051ce"
  },
  {
    "url": "assets/img/logo/icon-72x72.png",
    "revision": "06c4a8251193202c878ec6c6a4a9059c"
  },
  {
    "url": "assets/img/me.png",
    "revision": "9d7b65150b8fc8039ace3ffcb0e6a4c9"
  },
  {
    "url": "index.html",
    "revision": "dd69a0da80787a6c638c0bd88fbfa748"
  },
  {
    "url": "index.js",
    "revision": "4cb8ff47a2ed75a95233b85e904f92f3"
  },
  {
    "url": "manifest.json",
    "revision": "0c33b62c05e79117d4dafd1c64776450"
  }
]);
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
    cacheName: "jsdelivr"
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