(function () {
  if (!('serviceWorker' in navigator)) return;

  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const isSecureProduction = window.location.protocol === 'https:' && !isLocalhost;

  const clearLocalWorker = () => {
    // This must run immediately. Waiting for `load` is unsafe when an old
    // worker is continuously navigating localhost and preventing load.
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
  };

  if (!isSecureProduction) {
    clearLocalWorker();
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((registrationError) => {
        console.log('SW registration failed:', registrationError);
      });
  }, { once: true });
})();
