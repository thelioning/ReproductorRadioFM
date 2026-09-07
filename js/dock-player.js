(() => {
  const app = window.RadioApp || {};
  const audio = app.audio;
  const ui = app.ui;
  const config = window.STATION_CONFIG || {};

  const dock = document.getElementById("radioDock");
  const launcher = document.getElementById("radioDockLauncher");
  const closeButton = document.getElementById("dockCloseButton");
  const dockPlayButton = document.getElementById("dockPlayButton");
  const dockMuteButton = document.getElementById("dockMuteButton");

  if (!audio || !dock || !launcher || !closeButton || !dockPlayButton || !dockMuteButton) {
    return;
  }

  const storageNamespace = config.storageNamespace || "radio-player";
  const STORAGE_KEY = `${storageNamespace}-dock-hidden`;

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
    const playing = audio.isPlaying();

    dockPlayButton.classList.toggle("is-playing", playing);
    dockPlayButton.setAttribute("aria-label", playing ? "Pausar transmisión" : "Reproducir transmisión");
  }

  function syncMuteUI() {
    const muted = audio.isMuted();

    dockMuteButton.classList.toggle("is-muted", muted);
    dockMuteButton.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
  }

  async function startPlayback() {
    try {
      await audio.play();
      syncPlayUI();
      ui?.updatePlayUI?.();
    } catch (error) {
      console.error("No se pudo iniciar la transmisión desde el reproductor inferior:", error);
    }
  }

  function stopPlayback() {
    audio.pause();
    syncPlayUI();
    ui?.updatePlayUI?.();
  }

  dockPlayButton.addEventListener("click", async () => {
    if (audio.isPlaying()) {
      stopPlayback();
      return;
    }

    await startPlayback();
  });

  dockMuteButton.addEventListener("click", () => {
    audio.toggleMute();
    syncMuteUI();
    ui?.updateVolumeUI?.();
  });

  closeButton.addEventListener("click", () => setDockHidden(true));
  launcher.addEventListener("click", () => setDockHidden(false));

  audio.element.addEventListener("playing", syncPlayUI);
  audio.element.addEventListener("pause", syncPlayUI);
  audio.element.addEventListener("ended", syncPlayUI);
  audio.element.addEventListener("volumechange", syncMuteUI);

  let savedHidden = false;

  try {
    savedHidden = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (error) {
    savedHidden = false;
  }

  app.dock = Object.freeze({
    setHidden: setDockHidden,
    syncPlayUI,
    syncMuteUI
  });
  window.RadioApp = app;

  setDockHidden(savedHidden, false);
  syncPlayUI();
  syncMuteUI();
})();
