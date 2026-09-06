# Plan de desarrollo — Reproductor Radio FM White‑Label

## 1. Objetivo del proyecto

Convertir el reproductor actual de **Alcatraz Radio FM** en un producto reutilizable, configurable y comercializable para otras emisoras, sin reescribir el núcleo cada vez.

La meta final es disponer de un reproductor **white-label** que pueda integrarse fácilmente en sitios web, especialmente en **WordPress**, mediante un widget, shortcode o bloque, permitiendo personalizar marca, stream, colores, logo y funciones desde una configuración central.

Alcatraz Radio FM será la primera implementación de referencia.

---

## 2. Estado actual

Actualmente el proyecto ya dispone de:

- Reproducción de stream en vivo.
- Play/Pause.
- Mute y control de volumen.
- Visualizador animado.
- Barra inferior fija y retráctil.
- Integración con Media Session API.
- Logo local en el repositorio.
- Ecualizador real de 10 bandas mediante Web Audio API.
- Presets de ecualización.
- Ganancia general.
- Ecualizador retráctil.
- Persistencia de preferencias con `localStorage`.
- Protección para evitar romper el audio cuando el servidor del stream no permite procesamiento CORS.

### Rama actual de trabajo

`feature/ecualizador-real`

### Rama estable

`main`

---

## 3. Visión del producto

El producto no debe depender internamente de una emisora concreta.

Todos los elementos particulares de Alcatraz deben pasar a ser configuración:

- Nombre de la emisora.
- Eslogan o subtítulo.
- URL del stream.
- Logo.
- Colores principales.
- Texto del estado en vivo.
- Presets visibles.
- Comportamiento de la barra inferior.
- Ecualizador habilitado o deshabilitado.
- Visualizador habilitado o deshabilitado.

El mismo código debe servir para múltiples clientes cambiando solo la configuración.

---

# 4. Secuencia de desarrollo

## Fase 1 — Consolidar la versión actual

### Objetivo

Cerrar correctamente la fase del ecualizador antes de iniciar la refactorización comercial.

### Tareas

- [ ] Validar visualmente el ecualizador compacto.
- [ ] Confirmar funcionamiento del modo retráctil.
- [ ] Confirmar que plegar el ecualizador no desactiva el procesamiento de audio.
- [ ] Probar presets: Flat, Bass, Vocal, Pop y Rock.
- [ ] Probar los 10 faders manuales.
- [ ] Probar la ganancia general.
- [ ] Confirmar funcionamiento con mute.
- [ ] Confirmar funcionamiento con Play/Pause.
- [ ] Confirmar que la barra inferior sigue sincronizada.
- [ ] Probar escritorio y móvil.
- [ ] Integrar `feature/ecualizador-real` a `main` cuando sea aprobada.

### Criterio de cierre

La versión actual debe quedar estable antes de modificar la arquitectura.

---

## Fase 2 — Separar marca y configuración del núcleo

### Objetivo

Eliminar valores de Alcatraz escritos directamente en HTML, CSS y JavaScript.

### Nueva configuración propuesta

Crear un archivo central, por ejemplo:

```text
config/station-config.js
```

Ejemplo conceptual:

```js
const STATION_CONFIG = {
  name: "Alcatraz Radio FM",
  tagline: "Transmisión en vivo",
  streamUrl: "https://a8.my-control-panel.com:9360/radio.mp3",
  logo: "assets/alcatraz-logo.png",
  liveText: "LIVE",
  theme: {
    accentOrange: "#ff8a4c",
    accentPink: "#ff7f77",
    accentPurple: "#bc74ee"
  },
  features: {
    visualizer: true,
    equalizer: true,
    dockPlayer: true,
    mediaSession: true
  }
};
```

### Tareas

- [ ] Crear configuración central.
- [ ] Mover nombre de emisora a configuración.
- [ ] Mover stream URL a configuración.
- [ ] Mover logo a configuración.
- [ ] Mover textos del reproductor a configuración.
- [ ] Mover colores principales a configuración.
- [ ] Mover opciones de funciones a configuración.
- [ ] Evitar valores de cliente hardcodeados en el núcleo.

### Criterio de cierre

Debe ser posible crear otra emisora cambiando configuración y assets, sin editar el motor de audio.

---

## Fase 3 — Reorganizar la arquitectura del reproductor

### Objetivo

Separar claramente responsabilidades para facilitar mantenimiento y venta del producto.

### Arquitectura objetivo

```text
radio-player/
│
├── assets/
│   └── branding/
│
├── config/
│   └── station-config.js
│
├── css/
│   ├── player.css
│   ├── visualizer.css
│   ├── equalizer.css
│   └── dock-player.css
│
├── js/
│   ├── audio-engine.js
│   ├── player-ui.js
│   ├── visualizer.js
│   ├── equalizer.js
│   ├── dock-player.js
│   ├── media-session.js
│   └── app.js
│
└── index.html
```

### Reglas

- El motor de audio no debe conocer detalles visuales.
- La interfaz no debe crear un segundo `<audio>`.
- Todos los controles deben usar el mismo motor de reproducción.
- El ecualizador debe funcionar sobre el mismo stream.
- Evitar variables globales que puedan colisionar.
- Mantener una sola fuente de verdad para estado de reproducción, mute y volumen.

---

## Fase 4 — Crear modos de presentación

### Objetivo

Hacer que el mismo producto pueda adaptarse a diferentes zonas de una web.

### Modos previstos

#### 4.1 Widget compacto

Pensado para columnas, sidebars o bloques de WordPress.

Debe incluir como mínimo:

- Logo.
- Nombre de emisora.
- LIVE.
- Play/Pause.
- Mute.
- Volumen opcional.
- Ecualizador cerrado por defecto.

#### 4.2 Reproductor completo

Versión principal con:

- Visualizador.
- Volumen.
- Ecualizador.
- Presets.
- Estado de transmisión.

#### 4.3 Barra inferior fija

Debe permitir:

- Play/Pause.
- Mute.
- Ocultar.
- Volver a desplegar.
- Mostrar logo y nombre.
- Mantener sincronía con el widget principal.

### Regla importante

Ocultar o plegar componentes visuales no debe detener el stream.

---

## Fase 5 — Preparar integración WordPress

### Objetivo

Convertir el reproductor en un plugin instalable.

### Estructura propuesta

```text
alcatraz-radio-player/
│
├── alcatraz-radio-player.php
├── includes/
│   ├── class-radio-player.php
│   ├── class-admin-settings.php
│   └── class-shortcode.php
│
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
│
└── templates/
    └── player.php
```

### Primera integración

Crear shortcode:

```text
[radio_player]
```

Posteriormente se puede agregar:

```text
[radio_player mode="compact"]
[radio_player mode="full"]
```

### Tareas

- [ ] Crear plugin WordPress base.
- [ ] Registrar scripts y estilos con `wp_enqueue_script` y `wp_enqueue_style`.
- [ ] Crear shortcode.
- [ ] Renderizar reproductor desde plantilla PHP.
- [ ] Evitar cargar scripts varias veces.
- [ ] Probar compatibilidad con temas diferentes.

---

## Fase 6 — Panel de administración WordPress

### Objetivo

Permitir que el propietario configure su emisora sin modificar código.

### Campos mínimos

- Nombre de emisora.
- Eslogan.
- URL del stream.
- Logo.
- Color principal.
- Color secundario.
- Mostrar visualizador: Sí/No.
- Mostrar ecualizador: Sí/No.
- Mostrar barra inferior: Sí/No.
- Ecualizador abierto por defecto: Sí/No.
- Volumen inicial.

### Seguridad WordPress

- Sanitizar todos los campos.
- Validar URLs.
- Comprobar capacidades de administrador.
- Usar nonces en formularios.
- Escapar contenido al imprimirlo.

---

## Fase 7 — Convertirlo en producto white-label

### Objetivo

Eliminar cualquier dependencia del nombre Alcatraz en el producto base.

### Resultado esperado

Un cliente nuevo debería requerir solamente:

1. Nombre.
2. Logo.
3. URL del stream.
4. Colores.
5. Preferencias de funciones.

### Ejemplo

```text
Cliente A
Nombre: Radio Horizonte
Logo: horizonte.png
Stream: https://...
Color: azul

Cliente B
Nombre: Urbana FM
Logo: urbana.png
Stream: https://...
Color: violeta
```

El motor del reproductor debe ser exactamente el mismo para ambos.

---

## Fase 8 — Paquetes comerciales

El producto puede dividirse por funciones.

### Básico

- Play/Pause.
- Volumen.
- Mute.
- Logo y branding.
- Widget responsive.

### Profesional

Incluye Básico más:

- Visualizador.
- Barra inferior fija.
- Media Session.
- Personalización avanzada.

### Premium

Incluye Profesional más:

- Ecualizador real de 10 bandas.
- Presets.
- Ganancia general.
- Panel administrativo WordPress.
- White-label completo.

No se deben fijar precios hasta terminar y validar técnicamente el producto.

---

# 5. Compatibilidad técnica del ecualizador

El ecualizador utiliza **Web Audio API**.

Para procesar un stream externo, el servidor debe permitir acceso CORS adecuado.

### Comportamiento obligatorio

Si el stream permite procesamiento:

- Activar ecualizador real.

Si el stream no lo permite:

- No romper la transmisión.
- Mantener reproducción normal.
- Informar al usuario que el ecualizador no está disponible para ese servidor.

Esto debe conservarse en la versión comercial.

---

# 6. Persistencia de audio entre páginas WordPress

## Situación

En una navegación WordPress tradicional, cambiar de página provoca una carga completa del documento y el elemento `<audio>` se destruye.

Por tanto, una barra fija puede permanecer visible en cada página, pero eso no garantiza por sí solo reproducción continua entre páginas.

## Opciones futuras

### Opción A — Versión estándar

La reproducción pertenece a la página actual.

Es la implementación inicial recomendada por simplicidad y compatibilidad.

### Opción B — Reproducción continua avanzada

Investigar posteriormente:

- navegación AJAX/PJAX;
- arquitectura SPA;
- contenedor persistente;
- integración específica con temas compatibles.

Esta función debe tratarse como característica avanzada y no mezclarse con el MVP del plugin.

---

# 7. Compatibilidad y aislamiento CSS

Para la versión WordPress se deben evitar nombres CSS demasiado genéricos.

Ejemplo recomendado:

```css
.arf-player {}
.arf-controls {}
.arf-equalizer {}
.arf-dock {}
```

`ARF` puede significar inicialmente **Advanced Radio Framework** o utilizarse solo como prefijo técnico interno.

Objetivo:

- Evitar conflictos con CSS del tema WordPress.
- Evitar conflictos con otros plugins.

---

# 8. Responsive

El producto debe validarse en:

- Escritorio.
- Laptop.
- Tablet.
- Android.
- iPhone.

### Reglas

- El widget no debe provocar scroll horizontal.
- Los controles deben ser táctiles.
- El ecualizador puede usar desplazamiento horizontal interno si el ancho no permite mostrar las 10 bandas.
- En móvil el ecualizador debe iniciar plegado por defecto.
- La barra inferior no debe cubrir controles críticos del sitio.

---

# 9. Accesibilidad

Mantener:

- `aria-label` en botones.
- Estados `aria-pressed`.
- Navegación por teclado.
- `focus-visible` claro.
- Contraste suficiente.
- Texto alternativo en logos.
- Estados comprensibles sin depender únicamente del color.

---

# 10. Estrategia Git

## Regla

`main` representa siempre la versión aprobada y estable.

Cada función importante debe desarrollarse en su propia rama.

Ejemplos:

```text
feature/ecualizador-real
feature/config-white-label
feature/widget-compacto
feature/wordpress-plugin
feature/admin-wordpress
```

### Flujo

1. Crear rama desde `main`.
2. Implementar una función específica.
3. Probar.
4. Corregir.
5. Aprobar visual y funcionalmente.
6. Integrar a `main`.

No mezclar varias fases grandes en una sola rama.

---

# 11. Regla de protección del motor de audio

Antes de modificar `audio-engine.js` se debe comprobar:

- Que el cambio sea realmente necesario.
- Que no se cree más de una instancia del stream.
- Que no se rompa Play/Pause.
- Que no se rompa Media Session.
- Que no se rompa la barra inferior.
- Que no se rompa el ecualizador.

El motor de audio es una pieza crítica y debe cambiarse con especial cuidado.

---

# 12. Pruebas mínimas antes de cada integración a main

- [ ] La radio inicia correctamente.
- [ ] Play funciona.
- [ ] Pause funciona.
- [ ] Mute funciona.
- [ ] El volumen responde.
- [ ] El visualizador responde al estado de reproducción.
- [ ] El visualizador se congela correctamente con mute si esa sigue siendo la regla aprobada.
- [ ] La barra inferior está sincronizada.
- [ ] El botón para ocultar la barra funciona.
- [ ] El botón para restaurarla funciona.
- [ ] Media Session no rompe el audio.
- [ ] El ecualizador se activa.
- [ ] El ecualizador se desactiva con bypass real.
- [ ] Los presets modifican el audio.
- [ ] Los faders manuales modifican el audio.
- [ ] El ecualizador se pliega sin desactivarse.
- [ ] La interfaz es usable en móvil.
- [ ] No aparecen errores nuevos en consola.

---

# 13. Prioridad inmediata

La secuencia de trabajo a partir del estado actual será:

1. Terminar y aprobar `feature/ecualizador-real`.
2. Integrarla a `main`.
3. Crear `feature/config-white-label`.
4. Extraer marca, stream y colores a configuración.
5. Crear modo widget compacto.
6. Validar el widget dentro de una página WordPress real.
7. Crear plugin WordPress MVP con shortcode.
8. Crear panel administrativo.
9. Preparar versión white-label comercial.
10. Evaluar funciones avanzadas como reproducción continua entre páginas.

---

# 14. Principio de desarrollo

Cada nueva función debe cumplir tres condiciones:

1. **No romper lo que ya funciona.**
2. **Ser reutilizable para otras emisoras.**
3. **Aportar valor real al producto comercial.**

El objetivo ya no es únicamente construir un reproductor para Alcatraz Radio FM, sino desarrollar una base sólida para un **reproductor profesional de radio online configurable, embebible y comercializable**.
