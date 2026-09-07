(() => {
  const audioElement = document.getElementById("radio");

  if (!audioElement) {
    console.error("No se encontró el elemento de audio principal.");
    return;
  }

  const DEFAULT_VOLUME = 0.8;
  let lastVolumeBeforeMute = DEFAULT_VOLUME;

  audioElement.volume = DEFAULT_VOLUME;

  async function play() {
    await audioElement.play();
  }

  function pause() {
    audioElement.pause();
  }

  function setVolume(value) {
    const numericValue = Math.min(1, Math.max(0, Number(value)));

    audioElement.volume = numericValue;

    if (numericValue > 0) {
      lastVolumeBeforeMute = numericValue;
      audioElement.muted = false;
    }

    return audioElement.volume;
  }

  function toggleMute() {
    if (audioElement.muted || audioElement.volume === 0) {
      audioElement.muted = false;

      if (audioElement.volume === 0) {
        audioElement.volume = lastVolumeBeforeMute || DEFAULT_VOLUME;
      }
    } else {
      lastVolumeBeforeMute = audioElement.volume || DEFAULT_VOLUME;
      audioElement.muted = true;
    }

    return audioElement.muted;
  }

  function isMuted() {
    return audioElement.muted || audioElement.volume === 0;
  }

  function isPlaying() {
    return !audioElement.paused && !audioElement.ended;
  }

  function getVolume() {
    return audioElement.volume;
  }

  window.RadioApp = window.RadioApp || {};
  window.RadioApp.audio = Object.freeze({
    element: audioElement,
    defaultVolume: DEFAULT_VOLUME,
    play,
    pause,
    setVolume,
    toggleMute,
    isMuted,
    isPlaying,
    getVolume
  });

  // Compatibilidad temporal mientras el ecualizador termina su migración al namespace RadioApp.
  window.radio = audioElement;
  window.isRadioPlaying = isPlaying;
})();
