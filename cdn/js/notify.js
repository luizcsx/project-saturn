(function () {

  function setNotification(msg, type) {
    if (window._saturnStore && window._saturnStore.setNotification) {
      window._saturnStore.setNotification(msg, type || 'warning');
    }
  }

  window._saturnNotify = setNotification;

  function waitForStore(cb, tries) {
    tries = tries || 0;
    if (tries > 60) return;
    if (window._saturnStore && window._saturnStore.setNotification) {
      cb();
    } else {
      setTimeout(function () { waitForStore(cb, tries + 1); }, 100);
    }
  }

  waitForStore(function () {

    var params = new URLSearchParams(window.location.search);

    if (params.get('registered') === '1') {
      setNotification('Account created!', 'success');
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    var err = params.get('error');
    if (err) {
      setNotification(decodeURIComponent(err), 'error');
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    fetch('/api/notifications')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.length > 0) {
          setNotification(data[0].message, data[0].type || 'warning');
        }
      })
      .catch(function () {});

  });

})();
