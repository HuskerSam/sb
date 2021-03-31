(function() {
  let s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=UA-148094829-1';
  var p = document.getElementsByTagName('script')[0];
  p.parentNode.insertBefore(s, p);
})();

(function() {
  var cx = '4a6d22c42e0496e39';
  if (window.customCSEID)
    cx = window.customCSEID;
  var gcse = document.createElement('script');
  gcse.type = 'text/javascript';
  gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(gcse, s);
})();

function searchBoxReady() {
  document.querySelectorAll('.gsc-webResult.gsc-result a').forEach(i => i.setAttribute('target', ''));
  return false;
}

window.__gcse || (window.__gcse = {});
window.__gcse.searchCallbacks = {
    web: {
        rendered: searchBoxReady
    }
};

window.addEventListener('load', e => {
  let pH = ' Search...';
  if (window.customPH)
    pH = window.customPH;
  document.getElementById('gsc-i-id1').placeholder = pH;
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());

  gtag('config', 'UA-148094829-1');
});
