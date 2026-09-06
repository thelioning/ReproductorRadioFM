const visualizerSvg = document.getElementById("brandVisualizer");
const barsMain = document.getElementById("barsMain");
const barsGlow = document.getElementById("barsGlow");
const edgeDots = document.getElementById("edgeDots");

const SVG_NS = "http://www.w3.org/2000/svg";

let audioContext = null;
let analyser = null;
let sourceNode = null;
let frequencyData = null;

let bars = [];
let dots = [];
let useFallbackAnimation = true;

function createSvgElement(tag) {
  return document.createElementNS(SVG_NS, tag);
}

function getBarColor(t) {
  const hue = 24 + (250 - 24) * t;
  return `hsl(${hue}, 92%, 70%)`;
}

function buildVisualizerBars() {
  barsMain.innerHTML = "";
  barsGlow.innerHTML = "";
  edgeDots.innerHTML = "";
  bars = [];
  dots = [];

  const startX = 50;
  const endX = 1150;
  const baselineY = 122;

  const barWidth = 7;
  const gap = 6;
  const step = barWidth + gap;

  const count = Math.floor((endX - startX) / step);

  for (let i = 0; i < count; i++) {
    const x = startX + i * step;
    const t = i / Math.max(1, count - 1);
    const color = getBarColor(t);

    const rectGlow = createSvgElement("rect");
    rectGlow.setAttribute("x", x);
    rectGlow.setAttribute("width", barWidth);
    rectGlow.setAttribute("rx", 3.5);
    rectGlow.setAttribute("fill", color);
    rectGlow.setAttribute("opacity", "0.70");

    const rectMain = createSvgElement("rect");
    rectMain.setAttribute("x", x);
    rectMain.setAttribute("width", barWidth);
    rectMain.setAttribute("rx", 3.5);
    rectMain.setAttribute("fill", color);

    barsGlow.appendChild(rectGlow);
    barsMain.appendChild(rectMain);

    const baseHeight = 24 + 45 * Math.abs(Math.sin(i * 0.22));

    bars.push({
      rectGlow,
      rectMain,
      x,
      t,
      baseHeight,
      baselineY,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 1.3
    });
  }

  const leftDotXs = [16, 28, 40];
  const rightDotXs = [1160, 1172, 1184];

  leftDotXs.forEach((cx, index) => {
    const dot = createSvgElement("circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", baselineY);
    dot.setAttribute("r", 3 + index);
    dot.setAttribute("fill", "#ff67d4");
    edgeDots.appendChild(dot);
    dots.push({ element: dot, phase: Math.random() * Math.PI * 2 });
  });

  rightDotXs.forEach((cx, index) => {
    const dot = createSvgElement("circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", baselineY);
    dot.setAttribute("r", 5 - index);
    dot.setAttribute("fill", "#62cbff");
    edgeDots.appendChild(dot);
    dots.push({ element: dot, phase: Math.random() * Math.PI * 2 });
  });
}

async function initAudioAnalyser() {
  if (analyser) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;

    sourceNode = audioContext.createMediaElementSource(radio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    useFallbackAnimation = false;
  } catch (error) {
    console.warn("No se pudo analizar el audio real. Se usará animación de respaldo.", error);
    useFallbackAnimation = true;
  }
}

function getAudioEnergy(index, time) {
  if (useFallbackAnimation || !analyser || !frequencyData) {
    return (
      0.45 +
      0.35 * Math.sin(time * 0.0025 + index * 0.22) +
      0.18 * Math.sin(time * 0.005 + index * 0.11)
    );
  }

  analyser.getByteFrequencyData(frequencyData);

  const bin = Math.floor((index / bars.length) * frequencyData.length);
  const value = frequencyData[Math.max(0, Math.min(bin, frequencyData.length - 1))] / 255;

  return 0.55 + value * 0.65;
}

function drawVisualizer(time = 0) {
  bars.forEach((bar, index) => {
    const energy = Math.max(0.18, getAudioEnergy(index, time));
    const animatedHeight = Math.max(14, bar.baseHeight * energy);
    const y = bar.baselineY - animatedHeight / 2;

    bar.rectMain.setAttribute("y", y);
    bar.rectMain.setAttribute("height", animatedHeight);

    bar.rectGlow.setAttribute("y", y);
    bar.rectGlow.setAttribute("height", animatedHeight);
  });

  dots.forEach((dot, i) => {
    const pulse = 0.85 + 0.25 * Math.sin(time * 0.004 + i + dot.phase);
    dot.element.setAttribute("opacity", pulse.toFixed(2));
  });

  requestAnimationFrame(drawVisualizer);
}

radio.addEventListener("play", async () => {
  await initAudioAnalyser();

  if (audioContext && audioContext.state === "suspended") {
    await audioContext.resume();
  }
});

buildVisualizerBars();
drawVisualizer();