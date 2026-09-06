(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const spectrumGroup = document.getElementById("spectrumWindows");
  const audioElement = document.getElementById("radio");

  if (!spectrumGroup || !audioElement) {
    return;
  }

  const START_X = 86;
  const END_X = 1114;
  const BAR_STEP = 17;
  const BAR_WIDTH = 12;
  const CENTER_Y = 94;
  const MIN_HEIGHT = 10;
  const MAX_HEIGHT = 176;
  const FRAME_INTERVAL = 1000 / 30;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = [];

  let lastFrame = 0;
  let lastTimestamp = 0;
  let fallbackPlaybackTime = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function gaussian(distance, width) {
    const ratio = distance / width;
    return Math.exp(-(ratio * ratio));
  }

  function circularDistance(a, b) {
    const direct = Math.abs(a - b);
    return Math.min(direct, 1 - direct);
  }

  function createBar(x, index) {
    const rect = document.createElementNS(SVG_NS, "rect");

    rect.setAttribute("x", x);
    rect.setAttribute("y", CENTER_Y);
    rect.setAttribute("width", BAR_WIDTH);
    rect.setAttribute("height", 0);
    rect.setAttribute("rx", BAR_WIDTH / 2);
    rect.setAttribute("ry", BAR_WIDTH / 2);

    spectrumGroup.appendChild(rect);

    bars.push({
      rect,
      index,
      level: 0
    });
  }

  function buildBars() {
    let index = 0;

    for (let x = START_X; x <= END_X; x += BAR_STEP) {
      createBar(x, index);
      index += 1;
    }
  }

  function hideSpectrum() {
    bars.forEach((bar) => {
      bar.level = 0;
      bar.rect.setAttribute("y", CENTER_Y);
      bar.rect.setAttribute("height", 0);
    });
  }

  function getPlaybackSeconds(timestamp) {
    const mediaTime = Number(audioElement.currentTime);

    if (Number.isFinite(mediaTime) && mediaTime > 0) {
      return mediaTime;
    }

    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      return fallbackPlaybackTime;
    }

    const delta = Math.min(50, Math.max(0, timestamp - lastTimestamp));
    const playbackRate = Number.isFinite(audioElement.playbackRate)
      ? audioElement.playbackRate
      : 1;

    fallbackPlaybackTime += (delta / 1000) * playbackRate;
    return fallbackPlaybackTime;
  }

  function getSpectrumLevel(position, index, playbackSeconds) {
    const centerA = (playbackSeconds * 0.095) % 1;
    const centerB = (1 - ((playbackSeconds * 0.071 + 0.29) % 1) + 1) % 1;
    const centerC = (playbackSeconds * 0.126 + 0.58) % 1;

    const packetA = gaussian(circularDistance(position, centerA), 0.115);
    const packetB = gaussian(circularDistance(position, centerB), 0.145) * 0.88;
    const packetC = gaussian(circularDistance(position, centerC), 0.095) * 0.76;
    const travellingEnvelope = Math.max(packetA, packetB, packetC);

    const detailA = 0.5 + 0.5 * Math.sin(index * 0.61 + playbackSeconds * 4.15);
    const detailB = 0.5 + 0.5 * Math.sin(index * 0.27 - playbackSeconds * 2.65);
    const detailC = 0.5 + 0.5 * Math.sin(index * 0.13 + playbackSeconds * 1.35);

    const localTexture = detailA * 0.48 + detailB * 0.32 + detailC * 0.20;
    const pulse = 0.80 + 0.20 * Math.sin(playbackSeconds * 2.05 + position * 8.2);

    const mixed = 0.06 + (travellingEnvelope * 0.68 + localTexture * 0.32) * pulse;
    return clamp(Math.pow(mixed, 1.35), 0, 1);
  }

  function getReducedMotionLevel(position) {
    const packetA = gaussian(circularDistance(position, 0.27), 0.13);
    const packetB = gaussian(circularDistance(position, 0.68), 0.15) * 0.82;
    return clamp(0.08 + Math.max(packetA, packetB) * 0.92, 0, 1);
  }

  function render(timestamp) {
    requestAnimationFrame(render);

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    if (!playing) {
      lastTimestamp = timestamp;
      hideSpectrum();
      return;
    }

    if (document.hidden || timestamp - lastFrame < FRAME_INTERVAL) {
      return;
    }

    const playbackSeconds = getPlaybackSeconds(timestamp);
    lastTimestamp = timestamp;
    lastFrame = timestamp;

    bars.forEach((bar, index) => {
      const position = index / Math.max(1, bars.length - 1);
      const targetLevel = prefersReducedMotion
        ? getReducedMotionLevel(position)
        : getSpectrumLevel(position, index, playbackSeconds);

      bar.level += (targetLevel - bar.level) * 0.24;

      const height = MIN_HEIGHT + bar.level * (MAX_HEIGHT - MIN_HEIGHT);
      const y = CENTER_Y - height / 2;

      bar.rect.setAttribute("y", y.toFixed(2));
      bar.rect.setAttribute("height", height.toFixed(2));
    });
  }

  buildBars();
  hideSpectrum();
  requestAnimationFrame(render);
})();
