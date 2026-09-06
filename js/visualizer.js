(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const barsGroup = document.getElementById("equalizerBars");

  if (!barsGroup) {
    return;
  }

  const START_X = 82;
  const END_X = 1118;
  const BAR_STEP = 14;
  const BAR_WIDTH = 5.5;
  const CENTER_Y = 92;
  const MIN_HEIGHT = 32;
  const MAX_HEIGHT = 118;
  const FRAME_INTERVAL = 1000 / 24;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = [];

  let lastFrame = 0;

  function createBar(x, index) {
    const rect = document.createElementNS(SVG_NS, "rect");

    rect.setAttribute("x", x);
    rect.setAttribute("y", CENTER_Y - 40);
    rect.setAttribute("width", BAR_WIDTH);
    rect.setAttribute("height", 80);
    rect.setAttribute("rx", BAR_WIDTH / 2);
    rect.setAttribute("ry", BAR_WIDTH / 2);

    barsGroup.appendChild(rect);

    bars.push({
      rect,
      index,
      phase: Math.random() * Math.PI * 2,
      speed: 0.72 + Math.random() * 0.55,
      strength: 0.78 + Math.random() * 0.22
    });
  }

  function buildBars() {
    let index = 0;

    for (let x = START_X; x <= END_X; x += BAR_STEP) {
      createBar(x, index);
      index += 1;
    }
  }

  function getVisualLevel(bar, time) {
    const primary = Math.sin(time * 0.0038 * bar.speed + bar.index * 0.31 + bar.phase);
    const secondary = Math.sin(time * 0.0022 + bar.index * 0.17 + bar.phase * 0.55);
    const detail = Math.sin(time * 0.0056 + bar.index * 0.08);

    return (primary * 0.5 + secondary * 0.34 + detail * 0.16 + 1) / 2;
  }

  function render(time) {
    requestAnimationFrame(render);

    if (document.hidden || time - lastFrame < FRAME_INTERVAL) {
      return;
    }

    lastFrame = time;

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    bars.forEach((bar) => {
      let height;

      if (prefersReducedMotion) {
        height = 82;
      } else {
        const level = getVisualLevel(bar, time);
        const activity = playing ? 1 : 0.54;
        height = MIN_HEIGHT + level * (MAX_HEIGHT - MIN_HEIGHT) * bar.strength * activity;
      }

      height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));

      const y = CENTER_Y - height / 2;

      bar.rect.setAttribute("y", y.toFixed(2));
      bar.rect.setAttribute("height", height.toFixed(2));
      bar.rect.setAttribute("opacity", playing ? "0.62" : "0.40");
    });
  }

  buildBars();
  requestAnimationFrame(render);
})();
