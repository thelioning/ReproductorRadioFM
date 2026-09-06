(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const maskHaloGroup = document.getElementById("lightMaskHalos");
  const maskCoreGroup = document.getElementById("lightMaskCores");

  if (!maskHaloGroup || !maskCoreGroup) {
    return;
  }

  const START_X = 82;
  const END_X = 1118;
  const BAR_STEP = 18;
  const CORE_WIDTH = 24;
  const HALO_WIDTH = 66;
  const CENTER_Y = 94;
  const MIN_HEIGHT = 30;
  const MAX_HEIGHT = 180;
  const FRAME_INTERVAL = 1000 / 30;
  const WAVE_SPEED = 0.00038;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = [];

  let lastFrame = 0;
  let lastTimestamp = 0;
  let animationTime = 0;

  function createRect(group, x, width, radius) {
    const rect = document.createElementNS(SVG_NS, "rect");

    rect.setAttribute("x", x);
    rect.setAttribute("y", CENTER_Y - MIN_HEIGHT / 2);
    rect.setAttribute("width", width);
    rect.setAttribute("height", MIN_HEIGHT);
    rect.setAttribute("rx", radius);
    rect.setAttribute("ry", radius);
    rect.setAttribute("opacity", "0");

    group.appendChild(rect);
    return rect;
  }

  function createBar(x, index) {
    const halo = createRect(
      maskHaloGroup,
      x - (HALO_WIDTH - CORE_WIDTH) / 2,
      HALO_WIDTH,
      HALO_WIDTH / 2
    );

    const core = createRect(
      maskCoreGroup,
      x,
      CORE_WIDTH,
      CORE_WIDTH / 2
    );

    bars.push({ halo, core, index });
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
    const waveA = gaussian(position - waveCenter(time, 0.00, 1), 0.115);
    const waveB = gaussian(position - waveCenter(time, 0.33, -1), 0.145) * 0.88;
    const waveC = gaussian(position - waveCenter(time, 0.66, 1), 0.105) * 0.74;

    const ripple = 0.5 + 0.5 * Math.sin(time * 0.0062 + position * 31);
    const pulse = 0.78 + 0.22 * Math.sin(time * 0.002 + position * 8.5);

    const level = Math.max(waveA, waveB, waveC) * (0.76 + ripple * 0.24) * pulse;
    return clamp(level, 0, 1);
  }

  function setBarGeometry(rect, y, height, opacity) {
    rect.setAttribute("y", y.toFixed(2));
    rect.setAttribute("height", height.toFixed(2));
    rect.setAttribute("opacity", opacity.toFixed(3));
  }

  function hideBars() {
    const y = CENTER_Y - MIN_HEIGHT / 2;

    bars.forEach((bar) => {
      setBarGeometry(bar.halo, y, MIN_HEIGHT, 0);
      setBarGeometry(bar.core, y, MIN_HEIGHT, 0);
    });
  }

  function getReducedMotionLevel(position) {
    const fixedWaveA = gaussian(position - 0.28, 0.15);
    const fixedWaveB = gaussian(position - 0.70, 0.13) * 0.78;
    return Math.max(fixedWaveA, fixedWaveB);
  }

  function render(time) {
    requestAnimationFrame(render);

    if (!lastTimestamp) {
      lastTimestamp = time;
    }

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    if (!playing) {
      lastTimestamp = time;
      hideBars();
      return;
    }

    if (document.hidden) {
      lastTimestamp = time;
      return;
    }

    if (time - lastFrame < FRAME_INTERVAL) {
      return;
    }

    const delta = Math.min(50, Math.max(0, time - lastTimestamp));
    lastTimestamp = time;
    lastFrame = time;

    if (!prefersReducedMotion) {
      animationTime += delta;
    }

    bars.forEach((bar, index) => {
      const position = index / Math.max(1, bars.length - 1);
      const rawLevel = prefersReducedMotion
        ? getReducedMotionLevel(position)
        : getSequenceLevel(position, animationTime);

      const level = rawLevel < 0.04 ? 0 : Math.pow(rawLevel, 1.2);

      if (level === 0) {
        const y = CENTER_Y - MIN_HEIGHT / 2;
        setBarGeometry(bar.halo, y, MIN_HEIGHT, 0);
        setBarGeometry(bar.core, y, MIN_HEIGHT, 0);
        return;
      }

      const height = MIN_HEIGHT + level * (MAX_HEIGHT - MIN_HEIGHT);
      const y = CENTER_Y - height / 2;

      /*
       * Los rectángulos ya no se dibujan sobre el letrero.
       * Solo controlan la máscara: el núcleo revela letras sólidas y
       * el halo suaviza la transición hacia la oscuridad.
       */
      const coreOpacity = clamp(0.62 + level * 0.38, 0, 1);
      const haloOpacity = clamp(0.12 + level * 0.42, 0, 0.54);

      setBarGeometry(bar.halo, y, height, haloOpacity);
      setBarGeometry(bar.core, y, height, coreOpacity);
    });
  }

  buildBars();
  hideBars();
  requestAnimationFrame(render);
})();
