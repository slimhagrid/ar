function lissajous(id, cfg) {
  var canvas = document.getElementById(id);
  if (!canvas) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PX = cfg.px || 72;
  var buf = Object.assign(document.createElement('canvas'), { width: PX, height: PX });
  var bx = buf.getContext('2d');
  var ctx = canvas.getContext('2d');
  var INTERVAL = 1000 / (cfg.fps || 30);

  var delta = 0;
  var pulse = 0;
  var visible = true;
  var last = 0;

  function resize() {
    var r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (canvas.width === Math.floor(r.width) && canvas.height === Math.floor(r.height)) return;
    canvas.width = Math.floor(r.width);
    canvas.height = Math.floor(r.height);
    ctx.imageSmoothingEnabled = false;
  }

  function drawStatic() {
    resize();
    if (!canvas.width || !canvas.height) return;
    bx.fillStyle = '#000';
    bx.fillRect(0, 0, PX, PX);

    var range = PX - (cfg.margin || 4) * 2;
    var c = PX / 2;
    var phase = cfg.phase != null ? cfg.phase : Math.PI / 2;
    for (var i = 0; i < cfg.steps; i++) {
      var t = (i / cfg.steps) * Math.PI * 2;
      var bpx = Math.round(c + Math.sin(cfg.a * t) * (range / 2));
      var bpy = Math.round(c + Math.sin(cfg.b * t + phase) * (range / 2));
      bx.fillStyle = i / cfg.steps > cfg.tailAt ? cfg.colors[1] : cfg.colors[0];
      bx.fillRect(bpx, bpy, 1, 1);
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, PX, PX, 0, 0, canvas.width, canvas.height);
  }

  function draw(ts) {
    requestAnimationFrame(draw);
    if (!visible || document.hidden || ts - last < INTERVAL) return;
    last = ts;
    resize();
    if (!canvas.width || !canvas.height) return;

    bx.fillStyle = 'rgba(0,0,0,' + cfg.fade + ')';
    bx.fillRect(0, 0, PX, PX);

    var range = PX - (cfg.margin || 4) * 2;
    var c = PX / 2;
    var br = cfg.breathing;
    if (br) pulse += br.rate;
    var scale = br ? 1 + Math.sin(pulse) * br.depth : 1;

    var phase = cfg.phase != null ? cfg.phase : Math.PI / 2;
    for (var i = 0; i < cfg.steps; i++) {
      var t = (i / cfg.steps) * Math.PI * 2;
      var bpx = Math.round(c + Math.sin(cfg.a * t + delta) * (range) * scale);
      var bpy = Math.round(c + Math.sin(cfg.b * t + delta + phase) * (range) * scale);
      bx.fillStyle = i / cfg.steps > cfg.tailAt ? cfg.colors[1] : cfg.colors[0];
      bx.fillRect(bpx, bpy, 1, 1);
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, PX, PX, 0, 0, canvas.width, canvas.height);
    delta = (delta + cfg.speed) % (Math.PI * 2);
  }

  if (reducedMotion) {
    window.addEventListener('resize', drawStatic, { passive: true });
    drawStatic();
    return;
  }

  new IntersectionObserver(
    function (entries) {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.1 }
  ).observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  bx.fillStyle = '#000';
  bx.fillRect(0, 0, PX, PX);
  requestAnimationFrame(draw);
}
