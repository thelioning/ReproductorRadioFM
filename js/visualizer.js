(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const baseBarsGroup = document.getElementById("visualizerBaseBars");
  const barsGroup = document.getElementById("visualizerBars");
  const edgeBarsGroup = document.getElementById("visualizerEdgeBars");

  if (!baseBarsGroup || !barsGroup || !edgeBarsGroup) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const START_X = 72;
  const END_X = 1128;
  const CENTER_Y = 96;
  const BASE_TOP = 28;
  const BASE_HEIGHT = 128;
  const BAR_WIDTH = 8;
  const BAR_STEP = 13;
  const TARGET_FPS = 28;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  const bars = [];
  const edgeBars = [];
  let lastFrameTime = 0;

  function createRect(group, x, y, width, height, radius = 4) {
    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("rx", radius);
    rect.setAttribute("ry", radius);
    group.appendChild(rect);
    return rect;
  }

  function createCircle(group, cx, cy, radius) {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", radius);
    group.appendChild(circle);
    return circle;
  }

  function buildLetterBars() {
    for (let x = START_X, index = 0; x <= END_X; x += BAR_STEP, index += 1) {
      createRect(baseBarsGroup, x, BASE_TOP, BAR_WIDTH, BASE_HEIGHT, BAR_WIDTH / 2);

      const main = createRect(barsGroup, x, CENTER_Y - 38, BAR_WIDTH, 76, BAR_WIDTH / 2);

      bars.push({
        main,
        index,
        phase: Math.random() * Math.PI * 2,
        speed: 0.82 + Math.random() * 0.42,
        bias: 0.82 + Math.random() * 0.22
      });
    }
  }

  function buildEdgeBars() {
    const leftPositions = [23, 36, 49, 62];
    const rightPositions = [1138, 1151, 1164, 1177];

    leftPositions.forEach((x, index) => {
      const rect = createRect(edgeBarsGroup, x, CENTER_Y - 7, 6, 14, 3);
      edgeBars.push({ rect, index, phase: index * 0.65 });
    });

    rightPositions.forEach((x, index) => {
      const rect = createRect(edgeBarsGroup, x, CENTER_Y - 7, 6, 14, 3);
      edgeBars.push({ rect, index: index + 4, phase: index * 0.65 + 1.1 });
    });

    createCircle(edgeBarsGroup, 10, CENTER_Y, 3.2);
    createCircle(edgeBarsGroup, 1190, CENTER_Y, 3.2);
  }

  function waveLevel(index, time, phase, speed) {
    const first = Math.sin(time * 0.0038 * speed + index * 0.29 + phase);
    const second = Math.sin(time * 0.0021 + index * 0.16 + phase * 0.45);
    return (first * 0.62 + second * 0.38 + 1) / 2;
  }

  function drawFrame(time, playing) {
    bars.forEach((bar) => {
      const level = waveLevel(bar.index, time, bar.phase, bar.speed);

      let height;
      if (prefersReducedMotion) {
        height = playing ? 92 : 54;
      } else if (playing) {
        height = 54 + level * 82 * bar.bias;
      } else {
        height = 44;
      }

      height = Math.max(30, Math.min(138, height));
      const y = CENTER_Y - height / 2;

      bar.main.setAttribute("y", y.toFixed(1));
      bar.main.setAttribute("height", height.toFixed(1));
      bar.main.setAttribute("opacity", playing ? "1" : "0.52");
    });

    edgeBars.forEach((bar) => {
      const level = waveLevel(bar.index, time, bar.phase, 0.9);
      const height = playing ? 12 + level * 34 : 11;
      const y = CENTER_Y - height / 2;

      bar.rect.setAttribute("y", y.toFixed(1));
      bar.rect.setAttribute("height", height.toFixed(1));
      bar.rect.setAttribute("opacity", playing ? "0.90" : "0.42");
    });
  }

  function render(time) {
    if (document.hidden) {
      requestAnimationFrame(render);
      return;
    }

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    if (!lastFrameTime || time - lastFrameTime >= FRAME_INTERVAL) {
      drawFrame(time, playing);
      lastFrameTime = time;
    }

    requestAnimationFrame(render);
  }

  buildLetterBars();
  buildEdgeBars();
  drawFrame(0, false);
  requestAnimationFrame(render);
})();
