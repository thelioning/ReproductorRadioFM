# Ruta de desarrollo — Reproductor Radio FM White‑Label

Documento de seguimiento operativo. Marcar cada tarea con `[x]` cuando quede validada y aprobada.

## Estado actual

- Rama estable objetivo: `main`
- Rama de trabajo actual: `feature/reorganizacion-arquitectura`
- Producto de referencia: Alcatraz Radio FM
- Meta comercial: reproductor white-label reutilizable e integrable en WordPress

---

# Fase 1 — Consolidar reproductor actual

## Núcleo de audio

- [x] Reproducción de stream en vivo
- [x] Play
- [x] Pause
- [x] Mute
- [x] Control de volumen
- [x] Un solo elemento `<audio>` como fuente principal

## Visualizador

- [x] Visualizador animado
- [x] Barras individuales
- [x] Efecto de máscara sobre el letrero
- [x] Letras sólidas visibles a través de las barras
- [x] Animación activa durante reproducción
- [x] Congelación visual al activar mute
- [x] Reanudación desde el fotograma congelado al quitar mute

## Barra inferior

- [x] Barra inferior fija
- [x] Play/Pause sincronizado
- [x] Mute sincronizado
- [x] Logo local
- [x] Botón para ocultar
- [x] Botón flotante para restaurar
- [x] Persistencia del estado con `localStorage`

## Media Session

- [x] Título de emisora
- [x] Estado de transmisión
- [x] Logo local
- [x] Play/Pause desde controles del sistema

## Ecualizador real

- [x] Web Audio API
- [x] 10 bandas: 32, 64, 125, 250, 500, 1K, 2K, 4K, 8K, 16K
- [x] Rango de -12 dB a +12 dB
- [x] Preset Flat
- [x] Preset Bass
- [x] Preset Vocal
- [x] Preset Pop
- [x] Preset Rock
- [x] Modo Manual
- [x] Ganancia general
- [x] Bypass real al desactivar
- [x] Protección CORS
- [x] Persistencia de ajustes
- [x] Ecualizador retráctil
- [x] Plegar sin desactivar el procesamiento
- [x] Estado plegado guardado en `localStorage`
- [x] Diseño compacto

## Validación pendiente antes de cerrar Fase 1

- [ ] Probar todos los presets escuchando cambios reales
- [ ] Probar varios faders manuales
- [ ] Probar ganancia general positiva y negativa
- [ ] Probar mute con ecualizador activado
- [ ] Probar Play/Pause con ecualizador activado
- [ ] Probar ecualizador plegado mientras sigue activo
- [ ] Probar barra inferior con ecualizador activo
- [ ] Recargar página y verificar persistencia
- [ ] Revisar errores de consola
- [x] Validar escritorio
- [ ] Validar tablet
- [ ] Validar Android
- [ ] Validar iPhone

### Criterio de cierre

Cuando todas las pruebas anteriores estén aprobadas, Fase 1 queda cerrada.

---

# Fase 2 — Configuración white-label

## Objetivo

Sacar del código todos los datos específicos de Alcatraz y convertirlos en configuración.

- [x] Crear `feature/config-white-label`
- [x] Crear `config/station-config.js`
- [x] Mover nombre de emisora a configuración
- [x] Mover eslogan/subtítulo a configuración
- [x] Mover URL del stream a configuración
- [x] Mover logo a configuración
- [x] Mover texto LIVE a configuración
- [x] Mover colores principales a configuración
- [x] Mover opciones del visualizador a configuración
- [x] Mover opciones del ecualizador a configuración
- [x] Mover opciones de barra inferior a configuración
- [x] Mover opciones de Media Session a configuración
- [x] Validar que Alcatraz conserva el mismo sonido y apariencia después de la refactorización
- [x] Eliminar textos y rutas de Alcatraz hardcodeados del núcleo
- [x] Probar una segunda emisora ficticia cambiando solo configuración y assets

### Criterio de cierre

Debe ser posible crear una nueva emisora sin modificar el motor de audio ni los módulos funcionales.

**Estado: Fase 2 completada.** La prueba con Radio Horizonte confirmó cambio de nombre, logo, colores y textos manteniendo el mismo núcleo y reproducción.

---

# Fase 3 — Reorganización de arquitectura

- [x] Crear estructura `config/`
- [x] Crear estructura `assets/branding/`
- [x] Separar `player-ui.js`
- [x] Separar `media-session.js`
- [x] Crear `app.js` como coordinador principal de inicialización
- [x] Reducir variables globales usando el namespace `RadioApp`
- [x] Mantener una sola fuente de verdad para reproducción, mute y volumen
- [x] Confirmar que ningún módulo crea un segundo stream
- [x] Confirmar que el ecualizador usa el mismo audio
- [x] Migrar visualizador al motor de audio compartido
- [x] Migrar ecualizador al motor de audio compartido
- [x] Retirar `player.js` heredado

### Criterio de cierre

La interfaz, la barra inferior, Media Session, visualizador y ecualizador deben consumir el mismo motor `RadioApp.audio`, sin crear nuevas fuentes de audio.

**Estado técnico: implementación completada. Pendiente validación manual de reproducción y controles antes de integrar a `main`.**

---

# Fase 4 — Modos de presentación

## Widget compacto

- [ ] Crear modo `compact`
- [ ] Logo
- [ ] Nombre
- [ ] LIVE
- [ ] Play/Pause
- [ ] Mute
- [ ] Volumen opcional
- [ ] Ecualizador cerrado por defecto
- [ ] Responsive para columnas y sidebars

## Reproductor completo

- [ ] Crear modo `full`
- [ ] Visualizador completo
- [ ] Volumen
- [ ] Ecualizador
- [ ] Presets
- [ ] Estado de transmisión

## Barra inferior

- [x] Barra fija funcional
- [x] Ocultar/restaurar
- [x] Sincronía básica
- [x] Adaptarla a configuración white-label
- [ ] Validar en páginas reales

---

# Fase 5 — Plugin WordPress MVP

- [ ] Crear `feature/wordpress-plugin`
- [ ] Crear archivo principal del plugin
- [ ] Registrar CSS con `wp_enqueue_style`
- [ ] Registrar JS con `wp_enqueue_script`
- [ ] Crear shortcode `[radio_player]`
- [ ] Crear `[radio_player mode="compact"]`
- [ ] Crear `[radio_player mode="full"]`
- [ ] Crear plantilla PHP del reproductor
- [ ] Evitar cargar scripts varias veces
- [ ] Probar con el sitio WordPress de Alcatraz
- [ ] Probar con otro tema WordPress

---

# Fase 6 — Panel administrativo WordPress

- [ ] Nombre de emisora
- [ ] Eslogan
- [ ] URL del stream
- [ ] Selección de logo
- [ ] Color principal
- [ ] Color secundario
- [ ] Activar/desactivar visualizador
- [ ] Activar/desactivar ecualizador
- [ ] Activar/desactivar barra inferior
- [ ] Ecualizador abierto/cerrado por defecto
- [ ] Volumen inicial
- [ ] Sanitización de campos
- [ ] Validación de URLs
- [ ] Nonces
- [ ] Verificación de permisos de administrador
- [ ] Escape de salida

---

# Fase 7 — White-label comercial

- [ ] Eliminar referencias obligatorias a Alcatraz del producto base
- [ ] Crear plantilla de cliente
- [ ] Crear procedimiento de personalización de marca
- [ ] Crear paquete Básico
- [ ] Crear paquete Profesional
- [ ] Crear paquete Premium
- [ ] Preparar documentación de instalación
- [ ] Preparar documentación de configuración
- [ ] Preparar checklist de entrega a cliente
- [ ] Definir licencia y condiciones comerciales
- [ ] Definir precios después de validar el producto

---

# Fase 8 — Compatibilidad y calidad

- [ ] Prefijar CSS para WordPress (`arf-` o equivalente)
- [ ] Evitar conflictos con temas
- [ ] Evitar conflictos con plugins
- [ ] Validar Chrome
- [ ] Validar Edge
- [ ] Validar Firefox
- [ ] Validar Safari
- [ ] Validar Android
- [ ] Validar iOS
- [ ] Validar accesibilidad por teclado
- [ ] Validar `aria-label`
- [ ] Validar contraste
- [ ] Revisar consola sin errores

---

# Fase 9 — Funciones avanzadas futuras

No forman parte del MVP.

- [ ] Investigar reproducción continua entre páginas WordPress
- [ ] Evaluar AJAX/PJAX
- [ ] Evaluar SPA o contenedor persistente
- [ ] Metadatos de canción actual si el servidor los expone
- [ ] Historial de canciones
- [ ] Compartir emisora
- [ ] Estadísticas de uso
- [ ] Actualizaciones automáticas del plugin

---

# Próximo paso inmediato

1. Validar manualmente `feature/reorganizacion-arquitectura`.
2. Probar Play/Pause, mute, volumen, visualizador, ecualizador y barra inferior.
3. Confirmar que Media Session sigue respondiendo.
4. Revisar consola sin errores.
5. Si la prueba es correcta, integrar Fase 3 a `main`.
6. Crear la rama de Fase 4 para construir el modo `compact`, base del widget WordPress.

---

## Regla Git

- `main` = versión aprobada y estable.
- Una fase importante = una rama propia.
- No mezclar WordPress, white-label y nuevas funciones de audio en la misma rama.
- Antes de integrar a `main`, completar la lista de pruebas correspondiente.
