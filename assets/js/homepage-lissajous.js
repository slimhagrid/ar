document.addEventListener('DOMContentLoaded', function () {
  lissajous('hero-lissajous', {
    a: 66, b: 48, steps: 9500,
    colors: ['#007aff', '#0056b3'],
    tailAt: 0.55, fade: 0.15, margin: 0, speed: 0.015, px: 32,
    breathing: { rate: 0.02, depth: 0.85 }
  });
});