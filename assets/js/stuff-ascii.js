document.addEventListener('DOMContentLoaded', function () {
  asciiField('stuff-ascii', {
    cols: 8, rows: 8,
    charset: ['.', ':', '-', '=', '+', '*', '%', '#', '!'],
    colors: ['#9a9898', '#007aff'],
    glitchChance: 0.03, speed: 0.0004, fps: 12
  });
});