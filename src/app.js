/*eslint-env browser */
(() => {
  if (serviceWorkerIsSupported(window.location.hostname)) {
    ensureServiceWorker();
  } else {
    removeServiceWorkers();
  }

  function serviceWorkerIsSupported(hostname) {
    const allowedHostnames = ['__URL__', 'localhost', '127.0.0.1', '0.0.0.0'];
    return (
      'serviceWorker' in navigator &&
      'updateViaCache' in ServiceWorkerRegistration.prototype &&
      (allowedHostnames.includes(hostname) ||
        hostname.endsWith('.github.io') ||
        hostname.endsWith('.netlify.app') ||
        hostname.endsWith('.vercel.app'))
    );
  }
  async function getHTML(url, signal) {
    if (!(url.endsWith('/') || url.endsWith('.html'))) {
      throw new Error(`can't fetch HTML for unsupported URL: ${url}`);
    }
    try {
      const res = await fetch(url, {signal});
      if (!res.ok) {
        throw res.status;
      }
      const offline = res.headers.has('X-Offline');
      const html = await res.text();
      return {
        offline,
        html,
      };
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return null;
      }
      throw e;
    }
  }
  function ensureServiceWorker() {
    const {pathname} = window.location;
    const isFirstInstall = !navigator.serviceWorker.controller;
    if (isFirstInstall) {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        (event) => {
          getHTML(pathname);
          event.stopImmediatePropagation();
        },
        {once: true},
      );
    } else if (pathname !== '/') {
      getHTML('/');
    }
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
    navigator.serviceWorker
      .register('/sw.js', {updateViaCache: 'all'})
      .then((e) => {
        console.log(`Well done, we supported offline!`);
      })
      .catch((e) => {
        console.warn(`Oh no, we can't offline!`, e);
      });
  }
  function removeServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    return navigator.serviceWorker
      .getRegistrations()
      .then((all) => Promise.all(all.map((reg) => reg.unregister())))
      .then((tasks) => {
        if (tasks.length) window.location.reload();
      });
  }

  const id = document.getElementById('redirect');
  if (!id) return;
  let count = 11;
  function redirect() {
    count--;
    id.innerHTML = `<code>Redirect in ${count} seconds...</code>`;
    if (count != 0) setTimeout(redirect, 1000);
  }
  setTimeout(redirect, 1000);
  const disallowHostnames = ['localhost', '127.0.0.1', '0.0.0.0'];
  if (disallowHostnames.includes(window.location.hostname)) return;
  window.setTimeout(() => {
    window.location.replace(window.location.href.replace('__URL__', '__REDIRECT__'));
  }, 12000);
})();
