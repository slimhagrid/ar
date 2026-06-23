(function () {
  function initZoetrope(wheelId, viewportImgId, frameSrcs) {
    var wheel = document.getElementById(wheelId);
    var viewportImg = document.getElementById(viewportImgId);
    if (!wheel || !viewportImg) return;

    var thumbs = wheel.querySelectorAll('.zoetrope-thumb');
    var n = thumbs.length;
    var radius = wheel.clientWidth / 2 - 24;

    thumbs.forEach(function (thumb, i) {
      var angle = (i / n) * 360;
      var rad = (angle * Math.PI) / 180;
      var x = radius * Math.sin(rad);
      var y = -radius * Math.cos(rad);
      thumb.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    });

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rotation = 0;
    var dragging = false;
    var lastAngle = 0;
    var velocity = 0;
    var lastTime = 0;
    var currentFrame = 0;
    var rafId = null;

    function center() {
      var r = wheel.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function pointerAngle(e) {
      var c = center();
      return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI;
    }

    function normalizeDelta(d) {
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      return d;
    }

    function applyRotation() {
      wheel.style.transform = 'rotate(' + rotation + 'deg)';
      var step = 360 / n;
      var idx = Math.round(-rotation / step);
      idx = ((idx % n) + n) % n;
      if (idx !== currentFrame) {
        currentFrame = idx;
        viewportImg.src = frameSrcs[currentFrame];
      }
    }

    function stopInertia() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function coast() {
      velocity *= 0.94;
      rotation += velocity;
      applyRotation();
      if (Math.abs(velocity) > 0.05) {
        rafId = requestAnimationFrame(coast);
      } else {
        rafId = null;
      }
    }

    function onPointerDown(e) {
      stopInertia();
      dragging = true;
      wheel.classList.add('is-dragging');
      lastAngle = pointerAngle(e);
      lastTime = performance.now();
      velocity = 0;
      if (wheel.setPointerCapture) wheel.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var angle = pointerAngle(e);
      var delta = normalizeDelta(angle - lastAngle);
      var now = performance.now();
      var dt = Math.max(1, now - lastTime);
      velocity = (delta / dt) * 16;
      rotation += delta;
      lastAngle = angle;
      lastTime = now;
      applyRotation();
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      wheel.classList.remove('is-dragging');
      if (!reducedMotion && Math.abs(velocity) > 0.2) {
        rafId = requestAnimationFrame(coast);
      }
    }

    wheel.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    wheel.addEventListener('keydown', function (e) {
      var step = 360 / n;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        rotation -= step;
        applyRotation();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        rotation += step;
        applyRotation();
        e.preventDefault();
      }
    });

    applyRotation();
  }

  function init() {
    initZoetrope('zoetrope-wheel', 'zoetrope-frame', [
      '/assets/images/bird-1.webp',
      '/assets/images/bird-2.webp',
      '/assets/images/bird-3.webp',
      '/assets/images/bird-4.webp',
      '/assets/images/bird-5.webp',
      '/assets/images/bird-6.webp'
    ]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
