(() => {
  const dock = document.getElementById("radioDock");
  const launcher = document.getElementById("radioDockLauncher");
  const closeButton = document.getElementById("dockCloseButton");
  const dockPlayButton = document.getElementById("dockPlayButton");
  const dockMuteButton = document.getElementById("dockMuteButton");

  if (!dock || !launcher || !closeButton || !dockPlayButton || !dockMuteButton) {
    return;
  }

  const config = window.STATION_CONFIG || {};
  const storageNamespace = config.storageNamespace || "radio-player";
  const STORAGE_KEY = `${storageNamespace}-dock-hidden`;
  const mediaSessionEnabled = config.features?.mediaSession !== false;

  function setDockHidden(hidden, persist = true) {
    dock.classList.toggle("is-hidden", hidden);
    launcher.classList.toggle("is-visible", hidden);
    launcher.setAttribute("aria-hidden", hidden ? "false" : "true");

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
      } catch (error) {
        console.warn("No se pudo guardar el estado del reproductor inferior.", error);
      }
    }
  }

  function syncPlayUI() {
    const playing = typeof isRadioPlaying === "function" && isRadioPlaying();

    dockPlayButton.classList.toggle("is-playing", playing);
    dockPlayButton.setAttribute("aria-label", playing ? "Pausar transmisión" : "Reproducir transmisión");

    if (mediaSessionEnabled && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    }
  }

  function syncMuteUI() {
    const muted = typeof isMuted === "function" && isMuted();

    dockMuteButton.classList.toggle("is-muted", muted);
    dockMuteButton.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
  }

  async function startPlayback() {
    try {
      await playRadio();
      syncPlayUI();

      if (typeof updatePlayUI === "function") {
        updatePlayUI();
      }
    } catch (error) {
      console.error("No se pudo iniciar la transmisión desde el reproductor inferior:", error);
    }
  }

  function stopPlayback() {
    pauseRadio();
    syncPlayUI();

    if (typeof updatePlayUI === "function") {
      updatePlayUI();
    }
  }

  dockPlayButton.addEventListener("click", async () => {
    if (isRadioPlaying()) {
      stopPlayback();
      return;
    }

    await startPlayback();
  });

  dockMuteButton.addEventListener("click", () => {
    toggleMute();
    syncMuteUI();

    if (typeof updateVolumeUI === "function") {
      updateVolumeUI();
    }
  });

  closeButton.addEventListener("click", () => {
    setDockHidden(true);
  });

  launcher.addEventListener("click", () => {
    setDockHidden(false);
  });

  radio.addEventListener("playing", syncPlayUI);
  radio.addEventListener("pause", syncPlayUI);
  radio.addEventListener("ended", syncPlayUI);
  radio.addEventListener("volumechange", syncMuteUI);

  function registerMediaAction(action, handler) {
    if (!mediaSessionEnabled || !("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.debug(`Acción Media Session no disponible: ${action}`);
    }
  }

  if (mediaSessionEnabled && "mediaSession" in navigator && "MediaMetadata" in window) {
    const artwork = config.logo
      ? [{ src: config.logo, type: "image/png" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: config.name || "Radio FM",
      artist: config.tagline || "Transmisión en vivo",
      album: config.slogan || "Radio en vivo",
      artwork
    });

    registerMediaAction("play", startPlayback);
    registerMediaAction("pause", stopPlayback);
    registerMediaAction("stop", stopPlayback);
    registerMediaAction("previoustrack", null);
    registerMediaAction("nexttrack", null);
    registerMediaAction("seekbackward", null);
    registerMediaAction("seekforward", null);
  }

  let savedHidden = false;

  try {
    savedHidden = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (error) {
    savedHidden = false;
  }

  setDockHidden(savedHidden, false);
  syncPlayUI();
  syncMuteUI();
})();
