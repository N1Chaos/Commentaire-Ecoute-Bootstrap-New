self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
      const modResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
      return modResponse;
    }).catch(function(e) {
      console.error(e);
    })
  );
});