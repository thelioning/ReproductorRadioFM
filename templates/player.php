<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="arf-player-host">
  <main class="player" aria-label="<?php echo esc_attr('Reproductor de ' . $config['name']); ?>">
    <header class="player__header">
      <img class="player__logo" data-station-logo src="<?php echo esc_url($config['logo']); ?>" alt="<?php echo esc_attr('Logo de ' . $config['name']); ?>">
      <div>
        <h1 id="stationName"><?php echo esc_html($config['name']); ?></h1>
        <p id="stationTagline"><?php echo esc_html($config['tagline']); ?></p>
      </div>
      <span class="live-badge" data-station-live><?php echo esc_html($config['liveText']); ?></span>
    </header>

    <audio id="radio" preload="none" src="<?php echo esc_url($config['streamUrl']); ?>"></audio>

    <section class="brand-static" aria-label="<?php echo esc_attr('Identidad visual de ' . $config['name']); ?>">
      <svg viewBox="0 0 1200 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="brandStaticGradient" x1="80" y1="0" x2="1120" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ff5ac8"></stop>
            <stop offset="0.14" stop-color="#ff8a4c"></stop>
            <stop offset="0.30" stop-color="#ffd166"></stop>
            <stop offset="0.47" stop-color="#87f05f"></stop>
            <stop offset="0.64" stop-color="#57e6c8"></stop>
            <stop offset="0.81" stop-color="#58b8ff"></stop>
            <stop offset="1" stop-color="#8c6cff"></stop>
          </linearGradient>

          <mask
            id="spectrumMask"
            x="0"
            y="0"
            width="1200"
            height="190"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            style="mask-type: luminance;"
          >
            <rect x="0" y="0" width="1200" height="190" fill="#000000"></rect>
            <g id="spectrumWindows"></g>
          </mask>
        </defs>

        <g class="brand-spectrum" mask="url(#spectrumMask)">
          <text
            id="brandSpectrumText"
            class="brand-spectrum__text"
            x="600"
            y="118"
            text-anchor="middle"
            textLength="1040"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#brandStaticGradient)"
          ><?php echo esc_html($config['visualizerText']); ?></text>
        </g>
      </svg>
    </section>

    <section class="controls" aria-label="Controles de reproducción">
      <button id="playButton" class="play-button" type="button" aria-label="Reproducir">
        <span class="play-button__icon play-button__icon--play" aria-hidden="true"></span>
        <span class="play-button__icon play-button__icon--pause" aria-hidden="true"></span>
      </button>

      <div class="volume-group">
        <button id="muteButton" class="volume-button" type="button" aria-label="Silenciar">
          <svg class="volume-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path class="volume-icon__speaker" d="M10 20h7l9-8v24l-9-8h-7z"></path>
            <path class="volume-icon__wave volume-icon__wave--small" d="M30 19c2 1.4 3 3 3 5s-1 3.6-3 5"></path>
            <path class="volume-icon__wave volume-icon__wave--large" d="M34 14c4 2.6 6 6 6 10s-2 7.4-6 10"></path>
            <path class="volume-icon__mute" d="M31 18l10 12M41 18L31 30"></path>
          </svg>
        </button>

        <div class="volume-control">
          <div class="volume-control__header">
            <label for="volumeControl">Volumen</label>
            <span id="volumeValue">80%</span>
          </div>
          <input id="volumeControl" type="range" min="0" max="1" step="0.01" value="0.80" aria-label="Volumen">
        </div>
      </div>
    </section>

    <p id="status" class="status" aria-live="polite">Radio detenida</p>

    <section id="equalizerPanel" class="equalizer-panel is-collapsed" aria-labelledby="equalizerTitle">
      <div class="equalizer-panel__header">
        <div class="equalizer-panel__title-wrap">
          <div class="equalizer-panel__icon" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div>
            <h2 id="equalizerTitle">Ecualizador</h2>
            <p id="equalizerSubtitle" class="equalizer-panel__subtitle"><?php echo esc_html('Ajusta el sonido de ' . $config['name']); ?></p>
          </div>
        </div>

        <div class="equalizer-panel__actions">
          <div class="eq-switch-wrap">
            <button id="eqToggle" class="eq-switch" type="button" aria-pressed="false" aria-label="Activar o desactivar ecualizador"></button>
            <span id="eqToggleLabel">Desactivado</span>
          </div>

          <button
            id="eqCollapse"
            class="eq-collapse"
            type="button"
            aria-controls="equalizerContent"
            aria-expanded="false"
            aria-label="Mostrar controles del ecualizador"
            title="Mostrar controles del ecualizador"
          >
            <span id="eqCollapseIcon" aria-hidden="true">⌄</span>
          </button>
        </div>
      </div>

      <div id="equalizerContent" class="equalizer-panel__content">
        <div class="equalizer-panel__content-inner">
          <div class="eq-toolbar">
            <div class="eq-presets" aria-label="Preajustes del ecualizador">
              <span class="eq-toolbar__label">Preajuste:</span>
              <button class="eq-preset is-active" type="button" data-eq-preset="Flat">Flat</button>
              <button class="eq-preset" type="button" data-eq-preset="Bass">Bass</button>
              <button class="eq-preset" type="button" data-eq-preset="Vocal">Vocal</button>
              <button class="eq-preset" type="button" data-eq-preset="Pop">Pop</button>
              <button class="eq-preset" type="button" data-eq-preset="Rock">Rock</button>
              <button class="eq-preset" type="button" data-eq-preset="Manual">Manual</button>
            </div>

            <label class="eq-master" for="eqMasterGain">
              <span class="eq-toolbar__label">Ganancia general:</span>
              <select id="eqMasterGain" class="eq-master-gain">
                <option value="-6">-6 dB</option>
                <option value="-3">-3 dB</option>
                <option value="0" selected>0 dB</option>
                <option value="3">+3 dB</option>
                <option value="6">+6 dB</option>
              </select>
            </label>
          </div>

          <div class="eq-bands-wrap" aria-label="Bandas de frecuencia">
            <div class="eq-bands">
              <?php
              $bands = array(
                  array('id' => '32', 'label' => '32'),
                  array('id' => '64', 'label' => '64'),
                  array('id' => '125', 'label' => '125'),
                  array('id' => '250', 'label' => '250'),
                  array('id' => '500', 'label' => '500'),
                  array('id' => '1k', 'label' => '1K'),
                  array('id' => '2k', 'label' => '2K'),
                  array('id' => '4k', 'label' => '4K'),
                  array('id' => '8k', 'label' => '8K'),
                  array('id' => '16k', 'label' => '16K'),
              );

              foreach ($bands as $index => $band) :
                  $input_id = 'eqBand' . $band['id'];
                  $output_id = $input_id . 'Value';
              ?>
                <label class="eq-band" for="<?php echo esc_attr($input_id); ?>">
                  <span class="eq-band__slider-wrap">
                    <input
                      id="<?php echo esc_attr($input_id); ?>"
                      class="eq-band__slider"
                      data-eq-band="<?php echo esc_attr((string) $index); ?>"
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value="0"
                    >
                  </span>
                  <output id="<?php echo esc_attr($output_id); ?>" class="eq-band__value">0 dB</output>
                  <span class="eq-band__frequency"><?php echo esc_html($band['label']); ?></span>
                </label>
              <?php endforeach; ?>
            </div>
          </div>

          <div class="eq-footer">
            <button id="eqReset" class="eq-reset" type="button">↻ Restablecer</button>
            <p id="eqMessage" class="eq-message" aria-live="polite">Ecualizador listo para activar.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer id="radioDock" class="radio-dock" aria-label="<?php echo esc_attr('Reproductor fijo de ' . $config['name']); ?>">
    <div class="radio-dock__brand">
      <img class="radio-dock__logo" data-station-logo src="<?php echo esc_url($config['logo']); ?>" alt="<?php echo esc_attr('Logo de ' . $config['name']); ?>">
      <div class="radio-dock__identity">
        <span class="radio-dock__name" data-station-name><?php echo esc_html($config['name']); ?></span>
        <span class="radio-dock__live" data-station-live><?php echo esc_html($config['liveText']); ?></span>
        <span class="radio-dock__live-dot" aria-hidden="true"></span>
      </div>
    </div>

    <div class="radio-dock__controls" aria-label="Controles del reproductor inferior">
      <button id="dockPlayButton" class="radio-dock__button" type="button" aria-label="Reproducir transmisión">
        <span class="radio-dock__play-icon" aria-hidden="true"></span>
        <span class="radio-dock__pause-icon" aria-hidden="true"></span>
      </button>

      <button id="dockMuteButton" class="radio-dock__button" type="button" aria-label="Silenciar">
        <svg class="radio-dock__volume-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path class="speaker" d="M10 20h7l9-8v24l-9-8h-7z"></path>
          <path class="wave" d="M30 19c2 1.4 3 3 3 5s-1 3.6-3 5"></path>
          <path class="wave" d="M34 14c4 2.6 6 6 6 10s-2 7.4-6 10"></path>
          <path class="mute" d="M31 18l10 12M41 18L31 30"></path>
        </svg>
      </button>
    </div>

    <button id="dockCloseButton" class="radio-dock__close" type="button" aria-label="Ocultar reproductor inferior">×</button>
  </footer>

  <button
    id="radioDockLauncher"
    class="radio-dock-launcher"
    type="button"
    aria-label="<?php echo esc_attr('Mostrar reproductor de ' . $config['name']); ?>"
    aria-hidden="true"
  >
    <img data-station-logo src="<?php echo esc_url($config['logo']); ?>" alt="" aria-hidden="true">
    <span class="radio-dock-launcher__arrow" aria-hidden="true">▲</span>
  </button>
</div>
