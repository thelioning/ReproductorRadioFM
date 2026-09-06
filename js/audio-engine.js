const radio = document.getElementById("radio");

const DEFAULT_VOLUME = 0.8;
let lastVolumeBeforeMute = DEFAULT_VOLUME;

radio.volume = DEFAULT_VOLUME;

async function playRadio() {
  await radio.play();
}

function pauseRadio() {
  radio.pause();
}

function setVolume(value) {
  const numericValue = Math.min(1, Math.max(0, Number(value)));

  radio.volume = numericValue;

  if (numericValue > 0) {
    lastVolumeBeforeMute = numericValue;
    radio.muted = false;
  }

  return radio.volume;
}

function toggleMute() {
  if (radio.muted || radio.volume === 0) {
    radio.muted = false;

    if (radio.volume === 0) {
      radio.volume = lastVolumeBeforeMute || DEFAULT_VOLUME;
    }
  } else {
    lastVolumeBeforeMute = radio.volume || DEFAULT_VOLUME;
    radio.muted = true;
  }

  return radio.muted;
}

function isMuted() {
  return radio.muted || radio.volume === 0;
}

function isRadioPlaying() {
  return !radio.paused && !radio.ended;
}

function getVolume() {
  return radio.volume;
}
