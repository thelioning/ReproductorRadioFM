const playButton = document.getElementById("playButton");
const muteButton = document.getElementById("muteButton");
const volumeControl = document.getElementById("volumeControl");
const volumeValue = document.getElementById("volumeValue");
const status = document.getElementById("status");

function updateVolumeUI() {
  const volume = getVolume();
  volumeControl.value = volume;
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
  muteButton.textContent = isMuted() ? "🔇" : "🔊";
  muteButton.setAttribute("aria-label", isMuted() ? "Activar sonido" : "Silenciar");
}

function updatePlayUI() {
  const playing = isRadioPlaying();

  playButton.classList.toggle("is-playing", playing);
  playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");

  if (playing) {
    status.textContent = "Transmitiendo en vivo";
  }
}

playButton.addEventListener("click", async () => {
  if (isRadioPlaying()) {
    pauseRadio();
    status.textContent = "Radio detenida";
    updatePlayUI();
    return;
  }

  try {
    status.textContent = "Conectando...";
    await playRadio();
    updatePlayUI();
  } catch (error) {
    console.error("No se pudo iniciar la transmisión:", error);
    status.textContent = "Error al conectar con la emisora";
    updatePlayUI();
  }
});

muteButton.addEventListener("click", () => {
  toggleMute();
  updateVolumeUI();
});

volumeControl.addEventListener("input", (event) => {
  setVolume(event.target.value);
  updateVolumeUI();
});

radio.addEventListener("playing", updatePlayUI);
radio.addEventListener("pause", updatePlayUI);
radio.addEventListener("waiting", () => {
  status.textContent = "Cargando transmisión...";
});
radio.addEventListener("error", () => {
  status.textContent = "Error en la transmisión";
  updatePlayUI();
});

updateVolumeUI();
updatePlayUI();
