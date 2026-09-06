(() => {
  const dock = document.getElementById("radioDock");
  const launcher = document.getElementById("radioDockLauncher");
  const closeButton = document.getElementById("dockCloseButton");
  const dockPlayButton = document.getElementById("dockPlayButton");
  const dockMuteButton = document.getElementById("dockMuteButton");

  if (!dock || !launcher || !closeButton || !dockPlayButton || !dockMuteButton) {
    return;
  }

  const STORAGE_KEY = "alcatraz-radio-dock-hidden";
  const LOGO_SVG = "https://www.alcatrazradiofm.net/wp-content/uploads/2021/02/site-logo-black.svg";
  const LOGO_PNG = "https://www.alcatrazradiofm.net/wp-content/uploads/2026/08/ALCATRAZ-LOGO-VECT-MARRON-1024x583.png";

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

    if ("mediaSession" in navigator) {
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
    if (!("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.debug(`Acción Media Session no disponible: ${action}`);
    }
  }

  if ("mediaSession" in navigator && "MediaMetadata" in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Alcatraz Radio FM",
      artist: "Transmisión en vivo",
      album: "Alternative Like You",
      artwork: [
        { src: LOGO_SVG, type: "image/svg+xml" },
        { src: LOGO_PNG, sizes: "1024x583", type: "image/png" }
      ]
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
