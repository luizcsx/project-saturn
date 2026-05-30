(function () {

  function notify(msg, type) {
    if (window._saturnStore && window._saturnStore.setNotification) {
      window._saturnStore.setNotification(msg, type || 'warning');
    }
  }

  window._saturnNotify = notify;

  function onReady(cb) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(cb, 100);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(cb, 100);
      });
    }
  }

  onReady(function () {
    var params = new URLSearchParams(window.location.search);

    if (params.get('registered') === '1') {
      notify('Account created!', 'success');
      history.replaceState(null, '', window.location.pathname);
    }

    var err = params.get('error');
    if (err) {
      notify(decodeURIComponent(err), 'error');
      history.replaceState(null, '', window.location.pathname);
    }

    setTimeout(function () {
      fetch('/api/notifications')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.length > 0) {
            notify(data[0].message, data[0].type || 'warning');
          }
        })
        .catch(function () {});
    }, 1000);
  });

})();
