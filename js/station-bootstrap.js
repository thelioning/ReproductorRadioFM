(() => {
  const config = window.STATION_CONFIG;

  if (!config) {
    console.error("No se encontró STATION_CONFIG. El reproductor no puede inicializar la marca de la emisora.");
    return;
  }

  const root = document.documentElement;
  const host = document.querySelector(".arf-player-host");
  const theme = config.theme || {};
  const presentation = config.presentation || {};
  const mode = presentation.mode === "compact" ? "compact" : "full";
  const modeOptions = presentation[mode] || {};

  if (config.standalonePage !== false) {
    document.body.classList.add("radio-player-page");
  }

  if (config.presentationStylesheetManaged !== true && !document.querySelector('link[data-radio-presentation]')) {
    const presentationStylesheet = document.createElement("link");
    presentationStylesheet.rel = "stylesheet";
    presentationStylesheet.href = config.presentationStylesheetUrl || "css/presentation.css";
    presentationStylesheet.dataset.radioPresentation = "true";
    document.head.appendChild(presentationStylesheet);
  }

  const cssVariables = {
    "--bg-page": theme.bgPage,
    "--player-start": theme.playerStart,
    "--player-end": theme.playerEnd,
    "--text-main": theme.textMain,
    "--text-secondary": theme.textSecondary,
    "--accent-orange": theme.accentOrange,
    "--accent-pink": theme.accentPink,
    "--accent-purple": theme.accentPurple,
    "--live": theme.live
  };

  const themeTarget = config.standalonePage === false && host ? host : root;

  Object.entries(cssVariables).forEach(([name, value]) => {
    if (value) {
      themeTarget.style.setProperty(name, value);
    }
  });

  if (config.manageDocumentTitle !== false) {
    document.title = config.name;
  }

  const stationName = document.getElementById("stationName");
  const stationTagline = document.getElementById("stationTagline");
  const equalizerSubtitle = document.getElementById("equalizerSubtitle");
  const brandSpectrumText = document.getElementById("brandSpectrumText");
  const radio = document.getElementById("radio");
  const mainPlayer = document.querySelector(".player");
  const brandSection = document.querySelector(".brand-static");
  const volumeGroup = document.querySelector(".volume-group");
  const status = document.getElementById("status");
  const dock = document.getElementById("radioDock");
  const launcher = document.getElementById("radioDockLauncher");

  if (stationName) stationName.textContent = config.name;
  if (stationTagline) stationTagline.textContent = config.tagline;
  if (equalizerSubtitle) equalizerSubtitle.textContent = `Ajusta el sonido de ${config.name}`;
  if (brandSpectrumText) brandSpectrumText.textContent = config.visualizerText || config.name.toUpperCase();

  if (radio && config.streamUrl) {
    radio.src = config.streamUrl;
  }

  document.querySelectorAll("[data-station-live]").forEach((element) => {
    element.textContent = config.liveText || "LIVE";
  });

  document.querySelectorAll("[data-station-name]").forEach((element) => {
    element.textContent = config.name;
  });

  document.querySelectorAll("[data-station-logo]").forEach((image) => {
    image.src = config.logo;
    image.alt = `Logo de ${config.name}`;
  });

  if (mainPlayer) {
    mainPlayer.setAttribute("aria-label", `Reproductor de ${config.name}`);
    mainPlayer.dataset.playerMode = mode;
  }

  document.body.dataset.playerMode = mode;

  if (brandSection) brandSection.setAttribute("aria-label", `Identidad visual de ${config.name}`);
  if (dock) dock.setAttribute("aria-label", `Reproductor fijo de ${config.name}`);
  if (launcher) launcher.setAttribute("aria-label", `Mostrar reproductor de ${config.name}`);

  const features = config.features || {};
  const showVisualizer = features.visualizer !== false && modeOptions.showVisualizer !== false;
  const showVolume = modeOptions.showVolume !== false;
  const showStatus = modeOptions.showStatus !== false;

  if (brandSection) brandSection.hidden = !showVisualizer;
  if (volumeGroup) volumeGroup.hidden = !showVolume;
  if (status) status.hidden = !showStatus;

  const equalizerPanel = document.getElementById("equalizerPanel");
  if (features.equalizer === false && equalizerPanel) equalizerPanel.hidden = true;

  if (features.dockPlayer === false) {
    if (dock) dock.hidden = true;
    if (launcher) launcher.hidden = true;
  }

  window.RadioApp = window.RadioApp || {};
  window.RadioApp.presentation = Object.freeze({
    mode,
    ...modeOptions
  });
})();
