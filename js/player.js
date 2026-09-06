const playButton = document.getElementById("playButton");
const muteButton = document.getElementById("muteButton");
const volumeControl = document.getElementById("volumeControl");
const volumeValue = document.getElementById("volumeValue");
const status = document.getElementById("status");
const audioDebug = document.getElementById("audioDebug");

let lastObservedTime = 0;
let lastAdvanceAt = Date.now();

function updateVolumeUI() {
  const volume = getVolume();
  const muted = isMuted();

  volumeControl.value = volume;
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
  muteButton.classList.toggle("is-muted", muted);
  muteButton.setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar");
}

function updatePlayUI() {
  const playing = isRadioPlaying();

  playButton.classList.toggle("is-playing", playing);
  playButton.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
  status.textContent = playing ? "Transmitiendo en vivo" : "Radio detenida";
}

function getReadyStateText(value) {
  return ["SIN_DATOS", "METADATOS", "DATOS_ACTUALES", "DATOS_FUTUROS", "LISTO"][value] || String(value);
}

function getNetworkStateText(value) {
  return ["VACIO", "INACTIVO", "CARGANDO", "SIN_FUENTE"][value] || String(value);
}

function updateAudioDebug() {
  if (!audioDebug) return;

  if (radio.currentTime !== lastObservedTime) {
    lastObservedTime = radio.currentTime;
    lastAdvanceAt = Date.now();
  }

  const playing = isRadioPlaying();
  const stalled = playing && Date.now() - lastAdvanceAt > 4000;

  const decodedBytes = typeof radio.webkitAudioDecodedByteCount === "number"
    ? radio.webkitAudioDecodedByteCount
    : null;

  const parts = [
    `estado: ${playing ? "reproduciendo" : "detenido"}`,
    `mute: ${radio.muted ? "sí" : "no"}`,
    `vol: ${Math.round(radio.volume * 100)}%`,
    `ready: ${getReadyStateText(radio.readyState)}`,
    `red: ${getNetworkStateText(radio.networkState)}`,
    `tiempo: ${Number.isFinite(radio.currentTime) ? radio.currentTime.toFixed(1) : "n/a"}`
  ];

  if (decodedBytes !== null) {
    parts.push(`audio decodificado: ${decodedBytes}`);
  }

  if (radio.error) {
    parts.push(`error: ${radio.error.code}`);
  }

  if (stalled) {
    parts.push("flujo sin avance");
  }

  audioDebug.textContent = parts.join(" · ");
}

playButton.addEventListener("click", async () => {
  if (isRadioPlaying()) {
    pauseRadio();
    updatePlayUI();
    updateAudioDebug();
    return;
  }

  try {
    status.textContent = "Conectando...";
    await playRadio();
    updatePlayUI();
    updateAudioDebug();
  } catch (error) {
    console.error("No se pudo iniciar la transmisión:", error);
    status.textContent = "Error al conectar con la emisora";
    updateAudioDebug();
  }
});

muteButton.addEventListener("click", () => {
  toggleMute();
  updateVolumeUI();
  updateAudioDebug();
});

volumeControl.addEventListener("input", (event) => {
  setVolume(event.target.value);
  updateVolumeUI();
  updateAudioDebug();
});

radio.addEventListener("playing", () => {
  updatePlayUI();
  updateAudioDebug();
});
radio.addEventListener("pause", () => {
  updatePlayUI();
  updateAudioDebug();
});
radio.addEventListener("waiting", () => {
  status.textContent = "Cargando transmisión...";
  updateAudioDebug();
});
radio.addEventListener("canplay", updateAudioDebug);
radio.addEventListener("loadedmetadata", updateAudioDebug);
radio.addEventListener("timeupdate", updateAudioDebug);
radio.addEventListener("volumechange", updateAudioDebug);
radio.addEventListener("stalled", updateAudioDebug);
radio.addEventListener("suspend", updateAudioDebug);
radio.addEventListener("error", () => {
  status.textContent = "Error en la transmisión";
  updatePlayUI();
  updateAudioDebug();
});

setInterval(updateAudioDebug, 1000);

updateVolumeUI();
updatePlayUI();
updateAudioDebug();
