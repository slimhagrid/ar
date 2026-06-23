(function () {
  var html = document.documentElement;

  function ready() {
    html.classList.remove('is-loading');
    html.classList.add('fonts-loaded');
  }

  if (!document.fonts) {
    ready();
    return;
  }

  html.classList.add('is-loading');

  Promise.all([
    document.fonts.load("400 1em 'JetBrains Mono'"),
    document.fonts.load("700 1em 'JetBrains Mono'"),
    document.fonts.load("900 1em 'Aileron'"),
    document.fonts.load("200 1em 'Aileron'")
  ]).then(ready).catch(ready);

  // Safety net — never leave the page invisible if loading stalls.
  setTimeout(ready, 100);
})();
