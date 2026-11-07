/* Google Analytics 4 — alohida fayl, chunki CSP inline skriptga ruxsat bermaydi.
   Lokal (localhost) ishlab chiqish tashriflari hisobga olinmaydi. */
(function () {
  var host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-RHC67ZQWT5');
})();
