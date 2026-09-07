# Ruta de desarrollo — Reproductor Radio FM White‑Label

Documento de seguimiento operativo. Marcar cada tarea con `[x]` cuando quede validada y aprobada.

## Estado actual

- Rama estable objetivo: `main`
- Rama de trabajo actual: `feature/wordpress-plugin`
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
- [x] Revisar errores de consola en escritorio
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
- [x] Validar manualmente Play/Pause, mute, volumen, visualizador, ecualizador y barra inferior
- [x] Validar Media Session
- [x] Revisar consola sin errores
- [x] Integrar Fase 3 a `main`

### Criterio de cierre

La interfaz, la barra inferior, Media Session, visualizador y ecualizador deben consumir el mismo motor `RadioApp.audio`, sin crear nuevas fuentes de audio.

**Estado: Fase 3 completada e integrada a `main`.**

---

# Fase 4 — Modos de presentación

## Widget compacto

- [x] Crear rama `feature/widget-compact`
- [x] Crear modo `compact`
- [x] Logo
- [x] Nombre
- [x] LIVE
- [x] Play/Pause
- [x] Mute
- [x] Volumen opcional
- [x] Ecualizador cerrado por defecto
- [x] Mantener visualizador en modo compacto
- [x] Mostrar nombre sólido en pausa y retomar animación en reproducción
- [x] Implementar responsive para columnas y sidebars con Container Queries
- [x] Mantener el mismo motor `RadioApp.audio`
- [x] Mantener sincronía con barra inferior y Media Session en modo compacto
- [x] Crear banco de prueba `dev/widget-preview.html`
- [x] Validar ancho 470 px
- [x] Validar ancho 400 px
- [x] Validar ancho 360 px
- [x] Validar ancho 320 px
- [x] Validar ecualizador plegado y desplegado en esos anchos

**Resultado visual:** el widget mantiene logo, nombre, LIVE, visualizador, controles y ecualizador dentro del ancho disponible en 470, 400, 360 y 320 px. En anchos estrechos, las bandas del ecualizador permanecen accesibles mediante desplazamiento horizontal interno sin desbordar el widget.

**Resultado funcional:** Play/Pause y mute permanecen sincronizados entre widget compacto, barra inferior y Media Session. Los controles externos de Chrome/Windows actualizan correctamente el estado del reproductor.

## Reproductor completo

- [x] Formalizar modo `full` en configuración
- [x] Visualizador completo
- [x] Volumen
- [x] Ecualizador
- [x] Presets
- [x] Estado de transmisión
- [x] Revalidar modo `full` después de cerrar los ajustes del widget compacto

**Resultado visual:** el modo `full` fue revalidado directamente en `index.html` a ancho de escritorio. Conserva la composición completa, visualizador, volumen, ecualizador de 10 bandas y barra inferior sin desbordamiento del reproductor.

## Barra inferior

- [x] Barra fija funcional
- [x] Ocultar/restaurar
- [x] Sincronía básica
- [x] Adaptarla a configuración white-label
- [x] Validar en páginas reales
- [x] Control de volumen sincronizado con el reproductor principal

### Criterio de cierre

El mismo núcleo debe funcionar en modo `compact` y `full`, mantener sincronía con barra inferior y Media Session y adaptarse a columnas reales de WordPress sin duplicar el motor de audio.

**Estado: Fase 4 completada, aprobada e integrada a `main`.**

---

# Fase 5 — Plugin WordPress MVP

- [x] Crear `feature/wordpress-plugin`
- [x] Crear archivo principal del plugin `alcatraz-radio-player.php`
- [x] Registrar CSS con `wp_enqueue_style`
- [x] Registrar JS con `wp_enqueue_script`
- [x] Crear shortcode `[radio_player]`
- [x] Crear `[radio_player mode="compact"]`
- [x] Crear `[radio_player mode="full"]`
- [x] Crear plantilla PHP del reproductor
- [x] Evitar cargar scripts varias veces en el MVP
- [x] Reutilizar el mismo núcleo JS/CSS del proyecto sin duplicarlo dentro del plugin
- [x] Evitar que los estilos de página del reproductor alteren el `body` de WordPress
- [x] Evitar que el plugin cambie el título de la página WordPress
- [x] Aislar las variables visuales principales dentro del contenedor del reproductor
- [x] Probar activación del plugin en WordPress local
- [x] Probar shortcode compacto en una página WordPress
- [x] Probar shortcode full en una página WordPress
- [x] Verificar Play/Pause, mute, volumen, visualizador, ecualizador, dock y Media Session dentro de WordPress
- [x] Validar control de volumen sincronizado en la barra inferior de WordPress
- [ ] Revisar consola sin errores en WordPress después de los últimos ajustes
- [ ] Probar con el sitio WordPress de Alcatraz
- [ ] Probar con otro tema WordPress

**Resultado WordPress local:** el plugin fue detectado y activado mediante enlace de desarrollo en `wp-content/plugins`. Los modos `compact` y `full` cargan dentro de una página WordPress real, reproducen el stream y mantienen sincronizados los controles principales, el visualizador, el ecualizador, la barra inferior y Media Session.

**Nota de integración:** la posición vertical del shortcode dentro de la página depende del tema/plantilla de WordPress. El plugin no debe compensar el espaciado del tema con márgenes negativos globales.

**Nota MVP:** por ahora se admite una sola instancia funcional del shortcode por página, para conservar IDs únicos y un único motor de audio.

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

1. Revisar la consola de WordPress local después de los últimos ajustes y confirmar que no quedan errores propios del plugin.
2. Probar el plugin con un segundo tema WordPress para detectar conflictos de CSS/JS.
3. Repetir la prueba en `compact` y `full` con ese segundo tema.
4. Si ambas pruebas son correctas, preparar la prueba controlada en el sitio WordPress de Alcatraz.
5. Solo después de aprobar el sitio real, cerrar Fase 5 e iniciar el panel administrativo de la Fase 6.

---

## Regla Git

- `main` = versión aprobada y estable.
- Una fase importante = una rama propia.
- No mezclar WordPress, white-label y nuevas funciones de audio en la misma rama.
- Antes de integrar a `main`, completar la lista de pruebas correspondiente.
