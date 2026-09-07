window.STATION_CONFIG = Object.freeze({
  id: "alcatraz-radio-fm",
  name: "Alcatraz Radio FM",
  tagline: "Transmisión en vivo",
  slogan: "Alternative Like You",
  streamUrl: "https://a8.my-control-panel.com:9360/radio.mp3",
  logo: "assets/alcatraz-logo.png",
  liveText: "LIVE",
  visualizerText: "ALCATRAZ RADIO FM",
  storageNamespace: "alcatraz-radio",
  theme: {
    bgPage: "#101820",
    playerStart: "#263747",
    playerEnd: "#18232d",
    textMain: "#ffffff",
    textSecondary: "#bdc9d4",
    accentOrange: "#ff8a4c",
    accentPink: "#ff7f77",
    accentPurple: "#bc74ee",
    live: "#ff0022"
  },
  presentation: {
    mode: "compact",
    compact: {
      showVisualizer: true,
      showVolume: true,
      showStatus: false,
      equalizerCollapsedByDefault: true
    },
    full: {
      showVisualizer: true,
      showVolume: true,
      showStatus: true,
      equalizerCollapsedByDefault: true
    }
  },
  features: {
    visualizer: true,
    equalizer: true,
    dockPlayer: true,
    mediaSession: true
  }
});
