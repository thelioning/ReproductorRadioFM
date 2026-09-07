(() => {
  const app = window.RadioApp || {};
  const audio = app.audio;

  const playButton = document.getElementById("playButton");
  const muteButton = document.getElementById("muteButton");
  const volumeControl = document.getElementById("volumeControl");
  const volumeValue = document.getElementById("volumeValue");
  const status = document.getElementById("status");

  if (!audio || !playButton || !muteButton || !volumeControl || !volumeValue || !status) {
    console.error("No fue posible inicializar la interfaz principal del reproductor.");
    return;
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function updateVolumeUI() {
    const volume = audio.getVolume();
    const muted = audio.isMuted();

    volumeControl.value = volume;
    volumeValue.textContent = `${Math.round(volume * 100)}%`;
    muteButton.classList.toggle("is-muted", muted);
    muteButton.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
  }

  function updatePlayUI() {
    const playing = audio.isPlaying();

    playButton.classList.toggle("is-playing", playing);
    playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
    setStatus(playing ? "Transmitiendo en vivo" : "Radio detenida");
  }

  playButton.addEventListener("click", async () => {
    if (audio.isPlaying()) {
      audio.pause();
      updatePlayUI();
      return;
    }

    try {
      setStatus("Conectando...");
      await audio.play();
      updatePlayUI();
    } catch (error) {
      console.error("No se pudo iniciar la transmisión:", error);
      setStatus("Error al conectar con la emisora");
    }
  });

  muteButton.addEventListener("click", () => {
    audio.toggleMute();
    updateVolumeUI();
  });

  volumeControl.addEventListener("input", (event) => {
    audio.setVolume(event.target.value);
    updateVolumeUI();
  });

  audio.element.addEventListener("playing", updatePlayUI);
  audio.element.addEventListener("pause", updatePlayUI);
  audio.element.addEventListener("volumechange", updateVolumeUI);
  audio.element.addEventListener("waiting", () => setStatus("Cargando transmisión..."));
  audio.element.addEventListener("error", () => {
    setStatus("Error en la transmisión");
    updatePlayUI();
  });

  app.ui = Object.freeze({
    setStatus,
    updateVolumeUI,
    updatePlayUI
  });

  window.RadioApp = app;

  updateVolumeUI();
  updatePlayUI();
})();
