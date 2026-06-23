function asciiField(id, cfg) {
  var canvas = document.getElementById(id);
  if (!canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');

  var cols = cfg.cols || 8;
  var rows = cfg.rows || 8;
  var charset = cfg.charset || ['.', ':', '-', '=', '+', '*', '%', '#'];
  var fontFamily = cfg.fontFamily || "'JetBrains Mono', monospace";
  var INTERVAL = 1000 / (cfg.fps || 12);
  var glitchChance = cfg.glitchChance != null ? cfg.glitchChance : 0.03;

  var t = 0;
  var visible = true;
  var last = 0;
  var cellW = 0;
  var cellH = 0;
  var fontSize = 0;

  function resize() {
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (canvas.width === Math.floor(r.width) && canvas.height === Math.floor(r.height)) return;
    canvas.width = Math.floor(r.width);
    canvas.height = Math.floor(r.height);
    cellW = canvas.width / cols;
    cellH = canvas.height / rows;
    fontSize = Math.floor(Math.min(cellW, cellH) * 0.85);
  }

  // Cheap multi-wave noise — smooth enough for a small ambient field, no lib needed.
  function noise(x, y, time) {
    return (
      Math.sin(x * 1.3 + time * 0.7) +
      Math.sin(y * 1.7 - time * 0.5) +
      Math.sin((x + y) * 0.9 + time * 1.1)
    ) / 3;
  }

  function render(time) {
    if (!canvas.width || !canvas.height) return;
    ctx.fillStyle = cfg.bg || '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px ' + fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var n = (noise(i, j, time) + 1) / 2;
        var glitch = !reducedMotion && Math.random() < glitchChance;
        var charIndex = glitch
          ? Math.floor(Math.random() * charset.length)
          : Math.floor(n * (charset.length - 1));
        var cx = cellW * (i + 0.5);
        var cy = cellH * (j + 0.5);

        ctx.globalAlpha = glitch ? 1 : 0.25 + n * 0.65;
        ctx.fillStyle = glitch ? cfg.colors[1] : cfg.colors[0];
        ctx.fillText(charset[charIndex], cx, cy);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(ts) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden || ts - last < INTERVAL) return;
    last = ts;
    resize();
    t += cfg.speed || 0.04;
    render(t);
  }

  if (reducedMotion) {
    window.addEventListener('resize', function () { resize(); render(0); }, { passive: true });
    resize();
    render(0);
    return;
  }

  new IntersectionObserver(
    function (entries) {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.1 }
  ).observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(loop);
}
