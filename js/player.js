const playButton = document.getElementById("playButton");
const muteButton = document.getElementById("muteButton");
const muteButtonImage = document.getElementById("muteButtonImage");
const volumeControl = document.getElementById("volumeControl");
const volumeValue = document.getElementById("volumeValue");
const status = document.getElementById("status");

const SOUND_ICON = "assets/icon-volume.svg";
const MUTE_ICON = "assets/icon-mute.svg";

function updateVolumeUI() {
  const volume = getVolume();
  const muted = isMuted();

  volumeControl.value = volume;
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
  muteButton.classList.toggle("is-muted", muted);
  muteButton.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");

  if (muteButtonImage) {
    muteButtonImage.src = muted ? MUTE_ICON : SOUND_ICON;
  }
}

function updatePlayUI() {
  const playing = isRadioPlaying();

  playButton.classList.toggle("is-playing", playing);
  playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");

  if (playing) {
    status.textContent = "Transmitiendo en vivo";
  } else if (radio.paused) {
    status.textContent = "Radio detenida";
  }
}

playButton.addEventListener("click", async () => {
  if (isRadioPlaying()) {
    pauseRadio();
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
