// Keep local design reviews and form tests out of production analytics.
(function () {
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.protocol === 'file:') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-Z5FJ16B7HM');
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Z5FJ16B7HM';
  document.head.appendChild(script);
}());
