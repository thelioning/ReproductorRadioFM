(() => {
  const app = window.RadioApp || {};
  const audio = app.audio;
  const ui = app.ui;
  const config = window.STATION_CONFIG || {};
  const enabled = config.features?.mediaSession !== false;

  if (!audio || !enabled || !("mediaSession" in navigator) || !("MediaMetadata" in window)) {
    return;
  }

  function getArtworkType(src) {
    const cleanSrc = String(src || "").split("?")[0].toLowerCase();

    if (cleanSrc.endsWith(".svg")) return "image/svg+xml";
    if (cleanSrc.endsWith(".jpg") || cleanSrc.endsWith(".jpeg")) return "image/jpeg";
    if (cleanSrc.endsWith(".webp")) return "image/webp";
    return "image/png";
  }

  function syncPlaybackState() {
    navigator.mediaSession.playbackState = audio.isPlaying() ? "playing" : "paused";
  }

  async function startPlayback() {
    try {
      await audio.play();
      ui?.updatePlayUI?.();
      syncPlaybackState();
    } catch (error) {
      console.error("No se pudo iniciar la transmisión desde Media Session:", error);
    }
  }

  function stopPlayback() {
    audio.pause();
    ui?.updatePlayUI?.();
    syncPlaybackState();
  }

  function registerAction(action, handler) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.debug(`Acción Media Session no disponible: ${action}`);
    }
  }

  const artwork = config.logo
    ? [{ src: config.logo, type: getArtworkType(config.logo) }]
    : [];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: config.name || "Radio FM",
    artist: config.tagline || "Transmisión en vivo",
    album: config.slogan || "Radio en vivo",
    artwork
  });

  registerAction("play", startPlayback);
  registerAction("pause", stopPlayback);
  registerAction("stop", stopPlayback);
  registerAction("previoustrack", null);
  registerAction("nexttrack", null);
  registerAction("seekbackward", null);
  registerAction("seekforward", null);

  audio.element.addEventListener("playing", syncPlaybackState);
  audio.element.addEventListener("pause", syncPlaybackState);
  audio.element.addEventListener("ended", syncPlaybackState);

  app.mediaSession = Object.freeze({ syncPlaybackState });
  window.RadioApp = app;

  syncPlaybackState();
})();
