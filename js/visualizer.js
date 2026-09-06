(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const barsGroup = document.getElementById("equalizerBars");

  if (!barsGroup) {
    return;
  }

  const START_X = 82;
  const END_X = 1118;
  const BAR_STEP = 15;
  const BAR_WIDTH = 10;
  const CENTER_Y = 94;
  const MIN_HEIGHT = 18;
  const MAX_HEIGHT = 154;
  const FRAME_INTERVAL = 1000 / 30;
  const WAVE_SPEED = 0.00042;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = [];
  let lastFrame = 0;

  function createBar(x, index) {
    const rect = document.createElementNS(SVG_NS, "rect");

    rect.setAttribute("x", x);
    rect.setAttribute("y", CENTER_Y - MIN_HEIGHT / 2);
    rect.setAttribute("width", BAR_WIDTH);
    rect.setAttribute("height", MIN_HEIGHT);
    rect.setAttribute("rx", 4);
    rect.setAttribute("ry", 4);
    rect.setAttribute("opacity", "0");

    barsGroup.appendChild(rect);
    bars.push({ rect, index });
  }

  function buildBars() {
    let index = 0;

    for (let x = START_X; x <= END_X; x += BAR_STEP) {
      createBar(x, index);
      index += 1;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function gaussian(distance, width) {
    const ratio = distance / width;
    return Math.exp(-(ratio * ratio));
  }

  function waveCenter(time, offset, direction = 1) {
    const travel = ((time * WAVE_SPEED + offset) % 1 + 1) % 1;
    return direction > 0 ? travel : 1 - travel;
  }

  function getSequenceLevel(position, time) {
    const waveA = gaussian(position - waveCenter(time, 0.00, 1), 0.13);
    const waveB = gaussian(position - waveCenter(time, 0.34, -1), 0.16) * 0.82;
    const waveC = gaussian(position - waveCenter(time, 0.67, 1), 0.11) * 0.68;

    const ripple = 0.5 + 0.5 * Math.sin(time * 0.006 + position * 34);
    const breathing = 0.72 + 0.28 * Math.sin(time * 0.0018 + position * 7);

    const level = Math.max(waveA, waveB, waveC) * (0.72 + ripple * 0.28) * breathing;
    return clamp(level, 0, 1);
  }

  function render(time) {
    requestAnimationFrame(render);

    if (document.hidden || time - lastFrame < FRAME_INTERVAL) {
      return;
    }

    lastFrame = time;

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    bars.forEach((bar, index) => {
      const position = index / Math.max(1, bars.length - 1);

      if (!playing) {
        bar.rect.setAttribute("opacity", "0");
        bar.rect.setAttribute("height", MIN_HEIGHT);
        bar.rect.setAttribute("y", CENTER_Y - MIN_HEIGHT / 2);
        return;
      }

      let level;

      if (prefersReducedMotion) {
        level = 0.42;
      } else {
        level = getSequenceLevel(position, time);
      }

      const height = MIN_HEIGHT + level * (MAX_HEIGHT - MIN_HEIGHT);
      const y = CENTER_Y - height / 2;
      const opacity = 0.76 + level * 0.24;

      bar.rect.setAttribute("y", y.toFixed(2));
      bar.rect.setAttribute("height", height.toFixed(2));
      bar.rect.setAttribute("opacity", opacity.toFixed(2));
    });
  }

  buildBars();
  requestAnimationFrame(render);
})();
