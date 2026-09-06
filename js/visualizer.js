(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const baseBarsGroup = document.getElementById("visualizerBaseBars");
  const glowBarsGroup = document.getElementById("visualizerGlowBars");
  const barsGroup = document.getElementById("visualizerBars");
  const edgeBarsGroup = document.getElementById("visualizerEdgeBars");

  if (!baseBarsGroup || !glowBarsGroup || !barsGroup || !edgeBarsGroup) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const START_X = 64;
  const END_X = 1136;
  const CENTER_Y = 96;
  const BASE_TOP = 22;
  const BASE_HEIGHT = 136;
  const BAR_WIDTH = 6;
  const BAR_STEP = 9;

  const bars = [];
  const edgeBars = [];

  function createRect(group, x, y, width, height, radius = 3) {
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

      const glow = createRect(glowBarsGroup, x, CENTER_Y - 40, BAR_WIDTH, 80, BAR_WIDTH / 2);
      const main = createRect(barsGroup, x, CENTER_Y - 40, BAR_WIDTH, 80, BAR_WIDTH / 2);

      bars.push({
        main,
        glow,
        index,
        phase: Math.random() * Math.PI * 2,
        speed: 0.78 + Math.random() * 0.55,
        bias: 0.76 + Math.random() * 0.34
      });
    }
  }

  function buildEdgeBars() {
    const leftPositions = [18, 29, 40, 51];
    const rightPositions = [1149, 1160, 1171, 1182];

    leftPositions.forEach((x, index) => {
      const rect = createRect(edgeBarsGroup, x, CENTER_Y - 8, 5, 16, 2.5);
      edgeBars.push({ rect, index, phase: index * 0.7 });
    });

    rightPositions.forEach((x, index) => {
      const rect = createRect(edgeBarsGroup, x, CENTER_Y - 8, 5, 16, 2.5);
      edgeBars.push({ rect, index: index + 4, phase: index * 0.7 + 1.1 });
    });

    createCircle(edgeBarsGroup, 8, CENTER_Y, 3.4);
    createCircle(edgeBarsGroup, 1192, CENTER_Y, 3.4);
  }

  function waveLevel(index, time, phase, speed) {
    const first = Math.sin(time * 0.0042 * speed + index * 0.31 + phase);
    const second = Math.sin(time * 0.0025 + index * 0.17 + phase * 0.5);
    const third = Math.sin(time * 0.0061 + index * 0.075);

    return (first * 0.48 + second * 0.34 + third * 0.18 + 1) / 2;
  }

  function render(time) {
    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    bars.forEach((bar) => {
      const level = waveLevel(bar.index, time, bar.phase, bar.speed);

      let height;

      if (prefersReducedMotion) {
        height = playing ? 96 : 62;
      } else if (playing) {
        height = 46 + level * 98 * bar.bias;
      } else {
        height = 30 + level * 34;
      }

      height = Math.max(24, Math.min(148, height));

      const y = CENTER_Y - height / 2;

      bar.main.setAttribute("y", y.toFixed(2));
      bar.main.setAttribute("height", height.toFixed(2));
      bar.main.setAttribute("opacity", playing ? "1" : "0.58");

      bar.glow.setAttribute("y", y.toFixed(2));
      bar.glow.setAttribute("height", height.toFixed(2));
      bar.glow.setAttribute("opacity", playing ? "0.48" : "0.20");
    });

    edgeBars.forEach((bar) => {
      const level = waveLevel(bar.index, time, bar.phase, 0.9);
      const height = playing ? 10 + level * 42 : 7 + level * 16;
      const y = CENTER_Y - height / 2;

      bar.rect.setAttribute("y", y.toFixed(2));
      bar.rect.setAttribute("height", height.toFixed(2));
      bar.rect.setAttribute("opacity", playing ? "0.90" : "0.42");
    });

    requestAnimationFrame(render);
  }

  buildLetterBars();
  buildEdgeBars();
  requestAnimationFrame(render);
})();
