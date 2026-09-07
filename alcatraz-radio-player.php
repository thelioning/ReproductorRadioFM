<?php
/**
 * Plugin Name: Alcatraz Radio Player
 * Description: Reproductor de radio online white-label con modos compacto y completo, barra inferior, Media Session y ecualizador.
 * Version: 0.1.1
 * Author: Ermógenes Rodríguez Fernández
 * Text Domain: alcatraz-radio-player
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ARF_VERSION', '0.1.1');
define('ARF_PLUGIN_FILE', __FILE__);
define('ARF_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ARF_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Durante desarrollo usa la fecha real del archivo como versión para impedir
 * que WordPress o el navegador conserven CSS/JS antiguos después de un cambio.
 */
function arf_asset_version($relative_path) {
    $file = ARF_PLUGIN_DIR . ltrim($relative_path, '/');
    return file_exists($file) ? (string) filemtime($file) : ARF_VERSION;
}

/**
 * Registra los recursos del reproductor sin cargarlos hasta que exista shortcode.
 */
function arf_register_assets() {
    wp_register_style('arf-styles', ARF_PLUGIN_URL . 'css/styles.css', array(), arf_asset_version('css/styles.css'));
    wp_register_style('arf-visualizer', ARF_PLUGIN_URL . 'css/visualizer.css', array('arf-styles'), arf_asset_version('css/visualizer.css'));
    wp_register_style('arf-equalizer', ARF_PLUGIN_URL . 'css/equalizer.css', array('arf-styles'), arf_asset_version('css/equalizer.css'));
    wp_register_style('arf-dock', ARF_PLUGIN_URL . 'css/dock-player.css', array('arf-styles'), arf_asset_version('css/dock-player.css'));
    wp_register_style('arf-presentation', ARF_PLUGIN_URL . 'css/presentation.css', array('arf-styles'), arf_asset_version('css/presentation.css'));
    wp_register_style('arf-wordpress', ARF_PLUGIN_URL . 'css/wordpress.css', array('arf-styles'), arf_asset_version('css/wordpress.css'));

    wp_register_script('arf-station-bootstrap', ARF_PLUGIN_URL . 'js/station-bootstrap.js', array(), arf_asset_version('js/station-bootstrap.js'), true);
    wp_register_script('arf-audio-engine', ARF_PLUGIN_URL . 'js/audio-engine.js', array('arf-station-bootstrap'), arf_asset_version('js/audio-engine.js'), true);
    wp_register_script('arf-player-ui', ARF_PLUGIN_URL . 'js/player-ui.js', array('arf-audio-engine'), arf_asset_version('js/player-ui.js'), true);
    wp_register_script('arf-visualizer', ARF_PLUGIN_URL . 'js/visualizer.js', array('arf-audio-engine'), arf_asset_version('js/visualizer.js'), true);
    wp_register_script('arf-equalizer', ARF_PLUGIN_URL . 'js/equalizer.js', array('arf-audio-engine'), arf_asset_version('js/equalizer.js'), true);
    wp_register_script('arf-dock-player', ARF_PLUGIN_URL . 'js/dock-player.js', array('arf-audio-engine'), arf_asset_version('js/dock-player.js'), true);
    wp_register_script('arf-media-session', ARF_PLUGIN_URL . 'js/media-session.js', array('arf-audio-engine'), arf_asset_version('js/media-session.js'), true);
    wp_register_script(
        'arf-app',
        ARF_PLUGIN_URL . 'js/app.js',
        array('arf-player-ui', 'arf-visualizer', 'arf-equalizer', 'arf-dock-player', 'arf-media-session'),
        arf_asset_version('js/app.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'arf_register_assets');

/**
 * Configuración inicial del producto. En la Fase 6 estos valores pasarán al panel administrativo.
 */
function arf_get_station_config($mode, $atts = array()) {
    $config = array(
        'id' => 'alcatraz-radio-fm',
        'name' => 'Alcatraz Radio FM',
        'tagline' => 'Transmisión en vivo',
        'slogan' => 'Alternative Like You',
        'streamUrl' => 'https://a8.my-control-panel.com:9360/radio.mp3',
        'logo' => ARF_PLUGIN_URL . 'assets/alcatraz-logo.png',
        'liveText' => 'LIVE',
        'visualizerText' => 'ALCATRAZ RADIO FM',
        'storageNamespace' => 'alcatraz-radio',
        'standalonePage' => false,
        'manageDocumentTitle' => false,
        'presentationStylesheetManaged' => true,
        'theme' => array(
            'bgPage' => '#101820',
            'playerStart' => '#263747',
            'playerEnd' => '#18232d',
            'textMain' => '#ffffff',
            'textSecondary' => '#bdc9d4',
            'accentOrange' => '#ff8a4c',
            'accentPink' => '#ff7f77',
            'accentPurple' => '#bc74ee',
            'live' => '#ff0022',
        ),
        'presentation' => array(
            'mode' => $mode,
            'compact' => array(
                'showVisualizer' => true,
                'showVolume' => true,
                'showStatus' => false,
                'equalizerCollapsedByDefault' => true,
            ),
            'full' => array(
                'showVisualizer' => true,
                'showVolume' => true,
                'showStatus' => true,
                'equalizerCollapsedByDefault' => true,
            ),
        ),
        'features' => array(
            'visualizer' => true,
            'equalizer' => true,
            'dockPlayer' => true,
            'mediaSession' => true,
        ),
    );

    return apply_filters('arf_station_config', $config, $atts);
}

/**
 * Carga CSS/JS y coloca STATION_CONFIG antes del bootstrap.
 */
function arf_enqueue_player_assets($config) {
    wp_enqueue_style('arf-styles');
    wp_enqueue_style('arf-visualizer');
    wp_enqueue_style('arf-equalizer');
    wp_enqueue_style('arf-dock');
    wp_enqueue_style('arf-presentation');
    wp_enqueue_style('arf-wordpress');

    wp_enqueue_script('arf-station-bootstrap');
    wp_add_inline_script(
        'arf-station-bootstrap',
        'window.STATION_CONFIG = Object.freeze(' . wp_json_encode($config) . ');',
        'before'
    );

    wp_enqueue_script('arf-audio-engine');
    wp_enqueue_script('arf-player-ui');
    wp_enqueue_script('arf-visualizer');
    wp_enqueue_script('arf-equalizer');
    wp_enqueue_script('arf-dock-player');
    wp_enqueue_script('arf-media-session');
    wp_enqueue_script('arf-app');
}

/**
 * Shortcode principal.
 *
 * Uso:
 * [radio_player]
 * [radio_player mode="compact"]
 * [radio_player mode="full"]
 *
 * MVP: se permite una sola instancia funcional por página para mantener IDs únicos.
 */
function arf_radio_player_shortcode($atts = array()) {
    static $rendered = false;

    if ($rendered) {
        return '<!-- Alcatraz Radio Player: el MVP admite una instancia por página. -->';
    }

    $atts = shortcode_atts(
        array(
            'mode' => 'compact',
        ),
        $atts,
        'radio_player'
    );

    $mode = strtolower(sanitize_key($atts['mode']));
    if (!in_array($mode, array('compact', 'full'), true)) {
        $mode = 'compact';
    }

    $config = arf_get_station_config($mode, $atts);
    arf_enqueue_player_assets($config);

    $template = ARF_PLUGIN_DIR . 'templates/player.php';
    if (!file_exists($template)) {
        return '<p>Alcatraz Radio Player: plantilla no encontrada.</p>';
    }

    $rendered = true;

    ob_start();
    include $template;
    return ob_get_clean();
}
add_shortcode('radio_player', 'arf_radio_player_shortcode');
