(() => {
  const app = window.RadioApp || {};
  const audio = app.audio;
  const radio = audio?.element;

  const panel = document.getElementById("equalizerPanel");
  const toggle = document.getElementById("eqToggle");
  const toggleLabel = document.getElementById("eqToggleLabel");
  const collapseButton = document.getElementById("eqCollapse");
  const collapseIcon = document.getElementById("eqCollapseIcon");
  const content = document.getElementById("equalizerContent");
  const message = document.getElementById("eqMessage");
  const resetButton = document.getElementById("eqReset");
  const masterSelect = document.getElementById("eqMasterGain");
  const presetButtons = Array.from(document.querySelectorAll("[data-eq-preset]"));
  const sliders = Array.from(document.querySelectorAll("[data-eq-band]"));

  if (
    !audio ||
    !radio ||
    !panel ||
    !toggle ||
    !toggleLabel ||
    !collapseButton ||
    !collapseIcon ||
    !content ||
    !message ||
    !resetButton ||
    !masterSelect ||
    sliders.length !== 10
  ) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const config = window.STATION_CONFIG || {};
  const storageNamespace = config.storageNamespace || "radio-player";
  const STORAGE_KEY = `${storageNamespace}-equalizer-settings`;
  const STORAGE_COLLAPSED_KEY = `${storageNamespace}-equalizer-collapsed`;
  const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const PRESETS = {
    Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    Bass: [6, 5, 4, 2, 0, -1, -1, 0, 1, 2],
    Vocal: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1],
    Pop: [2, 3, 4, 2, 0, -1, 1, 3, 2, 1],
    Rock: [4, 3, 2, 0, -1, 1, 3, 4, 3, 2]
  };

  let audioContext = null;
  let sourceNode = null;
  let filters = [];
  let dryGain = null;
  let wetGain = null;
  let masterGain = null;
  let graphReady = false;
  let enabled = false;
  let enabling = false;
  let corsChecked = false;
  let corsAllowed = false;
  let currentPreset = "Flat";
  let collapsed = true;

  function dbToGain(db) {
    return Math.pow(10, Number(db) / 20);
  }

  function formatDb(value) {
    const numeric = Number(value);
    return `${numeric > 0 ? "+" : ""}${numeric} dB`;
  }

  function setMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
  }

  function updateToggleUI() {
    toggle.classList.toggle("is-enabled", enabled);
    toggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggleLabel.textContent = enabled ? "Activado" : "Desactivado";
  }

  function updateCollapsedUI() {
    panel.classList.toggle("is-collapsed", collapsed);
    collapseButton.setAttribute("aria-expanded", collapsed ? "false" : "true");

    const label = collapsed
      ? "Mostrar controles del ecualizador"
      : "Ocultar controles del ecualizador";

    collapseButton.setAttribute("aria-label", label);
    collapseButton.title = label;
    collapseIcon.textContent = collapsed ? "⌄" : "⌃";
  }

  function saveCollapsedState() {
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch (error) {
      console.debug("No se pudo guardar el estado plegado del ecualizador.", error);
    }
  }

  function restoreCollapsedState() {
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      collapsed = saved === null ? true : saved === "1";
    } catch (error) {
      collapsed = true;
    }

    updateCollapsedUI();
  }

  function updatePresetUI(name) {
    currentPreset = name;
    presetButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.eqPreset === name);
    });
  }

  function updateSliderLabel(slider) {
    const output = document.getElementById(`${slider.id}Value`);
    if (output) {
      output.textContent = formatDb(slider.value);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        bands: sliders.map((slider) => Number(slider.value)),
        master: Number(masterSelect.value),
        preset: currentPreset
      }));
    } catch (error) {
      console.debug("No se pudieron guardar los ajustes del ecualizador.", error);
    }
  }

  function restoreSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || !Array.isArray(saved.bands) || saved.bands.length !== sliders.length) {
        return;
      }

      sliders.forEach((slider, index) => {
        slider.value = String(Math.max(-12, Math.min(12, Number(saved.bands[index]) || 0)));
        updateSliderLabel(slider);
      });

      if (["-6", "-3", "0", "3", "6"].includes(String(saved.master))) {
        masterSelect.value = String(saved.master);
      }

      updatePresetUI(saved.preset || "Manual");
    } catch (error) {
      console.debug("No se pudieron restaurar los ajustes del ecualizador.", error);
    }
  }

  function applyBandValues() {
    if (!graphReady) return;

    filters.forEach((filter, index) => {
      filter.gain.setTargetAtTime(Number(sliders[index].value), audioContext.currentTime, 0.015);
    });
  }

  function applyMasterGain() {
    if (!graphReady) return;
    masterGain.gain.setTargetAtTime(dbToGain(masterSelect.value), audioContext.currentTime, 0.015);
  }

  function setPreset(name) {
    if (name === "Manual") {
      updatePresetUI("Manual");
      saveSettings();
      return;
    }

    const values = PRESETS[name];
    if (!values) return;

    sliders.forEach((slider, index) => {
      slider.value = String(values[index]);
      updateSliderLabel(slider);
    });

    updatePresetUI(name);
    applyBandValues();
    saveSettings();
  }

  async function testStreamCors() {
    if (corsChecked) return corsAllowed;

    corsChecked = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4500);

    try {
      await fetch(radio.currentSrc || radio.src, {
        method: "HEAD",
        mode: "cors",
        cache: "no-store",
        signal: controller.signal
      });
      corsAllowed = true;
    } catch (error) {
      corsAllowed = false;
      console.warn("El stream no permite acceso CORS para Web Audio.", error);
    } finally {
      window.clearTimeout(timeoutId);
    }

    return corsAllowed;
  }

  function buildFilterChain() {
    filters = FREQUENCIES.map((frequency, index) => {
      const filter = audioContext.createBiquadFilter();

      if (index === 0) {
        filter.type = "lowshelf";
      } else if (index === FREQUENCIES.length - 1) {
        filter.type = "highshelf";
      } else {
        filter.type = "peaking";
        filter.Q.value = 1.25;
      }

      filter.frequency.value = frequency;
      filter.gain.value = Number(sliders[index].value);
      return filter;
    });
  }

  async function restorePlainPlayback(wasPlaying) {
    try {
      radio.removeAttribute("crossorigin");
      radio.load();
      if (wasPlaying) await audio.play();
    } catch (error) {
      console.error("No se pudo restaurar automáticamente la transmisión:", error);
    }
  }

  async function ensureGraph() {
    if (graphReady) return true;

    if (!AudioContextClass) {
      setMessage("Este navegador no admite Web Audio API.", true);
      return false;
    }

    setMessage("Comprobando compatibilidad del servidor de audio...");
    const canProcess = await testStreamCors();

    if (!canProcess) {
      setMessage("El servidor de la emisora no autoriza el procesamiento de audio en el navegador. La transmisión sigue funcionando normalmente.", true);
      return false;
    }

    const wasPlaying = audio.isPlaying();

    try {
      if (wasPlaying) audio.pause();

      radio.crossOrigin = "anonymous";
      radio.load();

      audioContext = new AudioContextClass();
      buildFilterChain();
      dryGain = audioContext.createGain();
      wetGain = audioContext.createGain();
      masterGain = audioContext.createGain();
      sourceNode = audioContext.createMediaElementSource(radio);

      sourceNode.connect(dryGain);
      dryGain.connect(audioContext.destination);

      sourceNode.connect(filters[0]);
      for (let index = 0; index < filters.length - 1; index += 1) {
        filters[index].connect(filters[index + 1]);
      }
      filters[filters.length - 1].connect(wetGain);
      wetGain.connect(masterGain);
      masterGain.connect(audioContext.destination);

      dryGain.gain.value = 1;
      wetGain.gain.value = 0;
      graphReady = true;
      applyBandValues();
      applyMasterGain();

      if (wasPlaying) await audio.play();

      setMessage("Ecualizador listo. Los cambios se aplican al audio real.");
      return true;
    } catch (error) {
      console.error("No se pudo inicializar el ecualizador real:", error);
      setMessage("No fue posible inicializar el procesamiento de audio. La radio se restaurará sin ecualizador.", true);
      await restorePlainPlayback(wasPlaying);
      return false;
    }
  }

  async function setEnabled(nextEnabled) {
    if (enabling) return;
    enabling = true;

    try {
      if (nextEnabled) {
        const ready = await ensureGraph();
        if (!ready) {
          enabled = false;
          updateToggleUI();
          return;
        }

        if (audioContext.state === "suspended") await audioContext.resume();

        dryGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.02);
        wetGain.gain.setTargetAtTime(1, audioContext.currentTime, 0.02);
        enabled = true;
        setMessage("Ecualizador activo: el sonido está siendo procesado en tiempo real.");
      } else {
        if (graphReady) {
          dryGain.gain.setTargetAtTime(1, audioContext.currentTime, 0.02);
          wetGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.02);
        }

        enabled = false;
        setMessage(graphReady ? "Ecualizador desactivado: audio plano." : "Ecualizador listo para activar.");
      }

      updateToggleUI();
    } finally {
      enabling = false;
    }
  }

  toggle.addEventListener("click", () => setEnabled(!enabled));

  collapseButton.addEventListener("click", () => {
    collapsed = !collapsed;
    updateCollapsedUI();
    saveCollapsedState();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => setPreset(button.dataset.eqPreset));
  });

  sliders.forEach((slider) => {
    updateSliderLabel(slider);

    slider.addEventListener("input", () => {
      updateSliderLabel(slider);
      updatePresetUI("Manual");

      if (graphReady) {
        const index = Number(slider.dataset.eqBand);
        filters[index].gain.setTargetAtTime(Number(slider.value), audioContext.currentTime, 0.012);
      }

      saveSettings();
    });
  });

  masterSelect.addEventListener("change", () => {
    applyMasterGain();
    saveSettings();
  });

  resetButton.addEventListener("click", () => {
    masterSelect.value = "0";
    setPreset("Flat");
    applyMasterGain();
    setMessage(enabled ? "Ecualizador restablecido a Flat." : "Ajustes restablecidos a Flat.");
  });

  radio.addEventListener("playing", async () => {
    if (graphReady && audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch (error) {
        console.debug("AudioContext permanece suspendido.", error);
      }
    }
  });

  app.equalizer = Object.freeze({
    setEnabled,
    isEnabled: () => enabled,
    isReady: () => graphReady
  });
  window.RadioApp = app;

  restoreCollapsedState();

  if (!AudioContextClass) {
    toggle.disabled = true;
    panel.classList.add("is-unavailable");
    setMessage("Este navegador no admite un ecualizador de audio real.", true);
  } else {
    restoreSettings();
    updateToggleUI();
    setMessage("Ecualizador listo para activar.");
  }
})();
