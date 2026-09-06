(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const spectrumGroup = document.getElementById("spectrumWindows");
  const audioElement = document.getElementById("radio");

  if (!spectrumGroup || !audioElement) {
    return;
  }

  /*
   * El espectro funciona como una plantilla invisible sobre el letrero.
   * Cada barra es una abertura independiente que revela únicamente la
   * porción de ALCATRAZ RADIO FM situada detrás de ella.
   */
  const START_X = 72;
  const END_X = 1128;
  const BAR_STEP = 16;
  const BAR_WIDTH = 9;
  const CENTER_Y = 94;
  const MIN_HEIGHT = 6;
  const MAX_HEIGHT = 178;
  const FRAME_INTERVAL = 1000 / 30;

  /* El video de referencia repite prácticamente el patrón cada ~9.8 s. */
  const LOOP_SECONDS = 9.86;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bars = [];

  let lastFrame = 0;
  let lastTimestamp = 0;
  let animationSeconds = 0;

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

  function hash01(value) {
    const x = Math.sin(value * 91.733 + 17.19) * 43758.5453;
    return x - Math.floor(x);
  }

  function createBar(x, index) {
    const rect = document.createElementNS(SVG_NS, "rect");

    rect.setAttribute("x", x);
    rect.setAttribute("y", CENTER_Y);
    rect.setAttribute("width", BAR_WIDTH);
    rect.setAttribute("height", 0);
    rect.setAttribute("rx", BAR_WIDTH / 2);
    rect.setAttribute("ry", BAR_WIDTH / 2);
    rect.setAttribute("fill", "#ffffff");

    spectrumGroup.appendChild(rect);

    const randomA = hash01(index + 1);
    const randomB = hash01(index + 101);
    const randomC = hash01(index + 211);

    bars.push({
      rect,
      index,
      level: 0,
      phase: randomA * Math.PI * 2,
      speed: 2.1 + randomB * 2.2,
      gain: 0.76 + randomC * 0.30
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

  function updateAnimationClock(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
      return;
    }

    const delta = Math.min(50, Math.max(0, timestamp - lastTimestamp));
    lastTimestamp = timestamp;

    const playbackRate = Number.isFinite(audioElement.playbackRate)
      ? audioElement.playbackRate
      : 1;

    animationSeconds += (delta / 1000) * playbackRate;
  }

  function getReferenceEnvelope(position, time) {
    const phase = (time % LOOP_SECONDS) / LOOP_SECONDS;

    /*
     * Dos grupos principales recorren el espectro en sentidos opuestos.
     * Sus posiciones reproducen la secuencia observada en el segundo video:
     * izquierda + centro/derecha -> centro -> derecha -> izquierda + derecha.
     */
    const centerA = (0.10 + phase * 1.20) % 1;
    const centerB = (0.64 - phase + 1) % 1;

    const packetA = gaussian(circularDistance(position, centerA), 0.125);
    const packetB = gaussian(circularDistance(position, centerB), 0.115) * 0.82;

    /* Tercer grupo suave para evitar una repetición demasiado mecánica. */
    const centerC = (0.34 + phase * 0.58) % 1;
    const packetC = gaussian(circularDistance(position, centerC), 0.075) * 0.34;

    return clamp(Math.max(packetA, packetB, packetC), 0, 1);
  }

  function getSpectrumLevel(bar, position, time) {
    const envelope = getReferenceEnvelope(position, time);

    /*
     * Cada barra respira de manera individual. Así las columnas vecinas
     * pertenecen al mismo grupo, pero no crecen ni decrecen como una sola pieza.
     */
    const individualWave = 0.72 + 0.28 * Math.sin(time * bar.speed + bar.phase);
    const fineMotion = 0.86 + 0.14 * Math.sin(time * 5.2 + bar.index * 1.17);

    /* Variación lenta de la energía general para imitar frases musicales. */
    const phrase = 0.88 + 0.12 * Math.sin((time / LOOP_SECONDS) * Math.PI * 4 - 0.7);

    const active = envelope * individualWave * fineMotion * phrase * bar.gain;

    /*
     * En zonas sin un grupo activo permanecen aperturas mínimas, como los
     * pequeños puntos centrales del espectro de referencia.
     */
    const idle = 0.015 + 0.020 * (0.5 + 0.5 * Math.sin(time * 2.4 + bar.phase));

    return clamp(Math.max(idle, active), 0, 1);
  }

  function getReducedMotionLevel(position) {
    const packetA = gaussian(circularDistance(position, 0.18), 0.13);
    const packetB = gaussian(circularDistance(position, 0.70), 0.12) * 0.78;
    return clamp(Math.max(0.02, packetA, packetB), 0, 1);
  }

  function render(timestamp) {
    requestAnimationFrame(render);

    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();
    const muted = typeof isMuted === "function"
      ? isMuted()
      : audioElement.muted || audioElement.volume === 0;

    /*
     * Pausa real: el espectro desaparece.
     * Mute: se conserva exactamente el último fotograma visible y se congela
     * el reloj de la animación, simulando que el espectro se detuvo con el audio.
     */
    if (!playing) {
      lastTimestamp = timestamp;
      hideSpectrum();
      return;
    }

    if (muted) {
      lastTimestamp = timestamp;
      lastFrame = timestamp;
      return;
    }

    if (document.hidden || timestamp - lastFrame < FRAME_INTERVAL) {
      return;
    }

    updateAnimationClock(timestamp);
    lastFrame = timestamp;

    bars.forEach((bar, index) => {
      const position = index / Math.max(1, bars.length - 1);
      const targetLevel = prefersReducedMotion
        ? getReducedMotionLevel(position)
        : getSpectrumLevel(bar, position, animationSeconds);

      /* Ataque algo más rápido y caída más lenta: movimiento más natural. */
      const response = targetLevel > bar.level ? 0.27 : 0.15;
      bar.level += (targetLevel - bar.level) * response;

      const shapedLevel = Math.pow(clamp(bar.level, 0, 1), 0.92);
      const height = MIN_HEIGHT + shapedLevel * (MAX_HEIGHT - MIN_HEIGHT);
      const y = CENTER_Y - height / 2;

      bar.rect.setAttribute("y", y.toFixed(2));
      bar.rect.setAttribute("height", height.toFixed(2));
    });
  }

  buildBars();
  hideSpectrum();
  requestAnimationFrame(render);
})();
