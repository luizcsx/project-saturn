(function () {
  function waitForStore(cb, tries) {
    tries = tries || 0;
    if (tries > 40) return;
    var chunk = self.webpackChunk;
    if (chunk && chunk.push !== Array.prototype.push) {
      try {
        var store = null;
        var orig = chunk.push.bind(chunk);
        chunk.push([[999999], {}, function (require) {
          try { store = require(9933).R; } catch (e) {}
        }]);
        if (store) { cb(store); return; }
      } catch (e) {}
    }
    setTimeout(function () { waitForStore(cb, tries + 1); }, 50);
  }

  waitForStore(function (store) {
    window._saturnNotify = function (msg, type) {
      store.setNotification(msg, type || 'warning');
    };

    var params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
      window._saturnNotify('Account created successfully!', 'success');
      history.replaceState(null, '', window.location.pathname);
    }

    var err = params.get('error');
    if (err) {
      window._saturnNotify(decodeURIComponent(err), 'error');
      history.replaceState(null, '', window.location.pathname);
    }
  });
})();
