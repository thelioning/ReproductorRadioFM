(() => {
  const app = window.RadioApp || {};

  app.config = window.STATION_CONFIG || {};
  app.version = "0.4.0";

  const requiredModules = ["audio", "ui", "dock"];
  const missingModules = requiredModules.filter((name) => !app[name]);

  if (missingModules.length > 0) {
    console.error(`RadioApp incompleto. Faltan módulos: ${missingModules.join(", ")}`);
    return;
  }

  const audioElements = document.querySelectorAll("audio#radio");

  if (audioElements.length !== 1 || app.audio.element !== audioElements[0]) {
    console.error("La aplicación debe utilizar exactamente una fuente de audio principal.");
    return;
  }

  const presentation = app.presentation || { mode: "full" };

  if (presentation.mode === "compact" && presentation.equalizerCollapsedByDefault !== false) {
    const equalizerPanel = document.getElementById("equalizerPanel");
    const collapseButton = document.getElementById("eqCollapse");

    if (equalizerPanel && collapseButton && !equalizerPanel.classList.contains("is-collapsed")) {
      collapseButton.click();
    }
  }

  app.ready = true;
  window.RadioApp = app;

  document.documentElement.dataset.radioAppReady = "true";
  window.dispatchEvent(new CustomEvent("radioapp:ready", {
    detail: {
      stationId: app.config.id || "radio-player",
      version: app.version,
      mode: presentation.mode || "full"
    }
  }));
})();
