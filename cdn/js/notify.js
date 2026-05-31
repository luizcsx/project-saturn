(function () {

  function createBanner() {
    var existing = document.getElementById('saturn-banner');
    if (existing) return existing;

    var banner = document.createElement('div');
    banner.id = 'saturn-banner';

    var mainHolder = document.querySelector('.main-holder');
    if (mainHolder) {
      mainHolder.insertBefore(banner, mainHolder.firstChild);
    } else {
      var nav = document.querySelector('nav');
      if (nav && nav.nextSibling) {
        nav.parentNode.insertBefore(banner, nav.nextSibling);
      } else {
        document.body.prepend(banner);
      }
    }

    return banner;
  }

  function showBanner(msg, type) {
    var banner = createBanner();
    banner.innerHTML = msg;
    banner.className = type || 'warning';
    banner.style.display = 'block';
  }

  function hideBanner() {
    var banner = document.getElementById('saturn-banner');
    if (banner) banner.style.display = 'none';
  }

  window._saturnNotify = showBanner;
  window._saturnHideNotify = hideBanner;

  function onReady(cb) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cb);
    } else {
      cb();
    }
  }

  onReady(function () {
    var params = new URLSearchParams(window.location.search);

    if (params.get('registered') === '1') {
      showBanner('Account created! Welcome to Project SĀTURN.', 'success');
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    var err = params.get('error');
    if (err) {
      showBanner(decodeURIComponent(err), 'error');
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    fetch('/api/notifications')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.length > 0) {
          showBanner(data[0].message, data[0].type || 'info');
        }
      })
      .catch(function () {});
  });

})();
