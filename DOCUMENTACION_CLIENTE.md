# Alcatraz Radio Player — Guía de instalación y prueba en WordPress

Versión de prueba para cliente. Este paquete corresponde al MVP del reproductor de **Alcatraz Radio FM**.

## 1. Antes de instalar

Se recomienda realizar una copia de seguridad del sitio WordPress antes de instalar cualquier plugin nuevo.

Para esta primera prueba no sustituya todavía el reproductor actual del sitio. Cree primero una página privada o de prueba para validar el funcionamiento.

## 2. Instalación del plugin

1. Entre al panel de administración de WordPress.
2. Vaya a **Plugins → Añadir plugin**.
3. Pulse **Subir plugin**.
4. Seleccione el archivo ZIP entregado: `alcatraz-radio-player-v0.1.1-prueba.zip`.
5. Pulse **Instalar ahora**.
6. Cuando WordPress termine la instalación, pulse **Activar plugin**.
7. Verifique que aparezca **Alcatraz Radio Player** dentro de la lista de plugins activos.

## 3. Crear una página de prueba

1. Vaya a **Páginas → Añadir nueva**.
2. Escriba un título, por ejemplo: **Prueba Reproductor Alcatraz**.
3. Inserte un bloque **Shortcode**.
4. Use uno de los modos descritos a continuación.
5. Para la primera validación se recomienda publicar la página como **Privada** o protegerla con contraseña.

## 4. Modo compacto

Use este shortcode:

```text
[radio_player mode="compact"]
```

El modo compacto está pensado para espacios reducidos, columnas, secciones pequeñas o integraciones donde se desea ocupar menos altura.

Incluye:

- logo de la emisora;
- nombre y estado LIVE;
- Play/Pause;
- mute;
- control de volumen;
- visualizador animado;
- ecualizador retráctil;
- barra inferior sincronizada;
- Media Session del navegador/sistema.

El ecualizador aparece cerrado por defecto y puede desplegarse cuando el oyente lo necesite.

## 5. Modo completo

Use este shortcode:

```text
[radio_player mode="full"]
```

El modo completo está pensado para una página dedicada al reproductor o para una sección amplia del sitio.

Incluye todos los controles del modo compacto y una presentación más amplia del reproductor. El ecualizador puede desplegarse para acceder a las 10 bandas, presets y ganancia general.

## 6. Barra inferior

Cuando el reproductor está presente en una página, aparece una barra inferior sincronizada con el mismo audio.

La barra inferior permite:

- Play/Pause;
- mute;
- volumen;
- ocultar la barra con el botón `×`;
- restaurarla mediante el botón flotante con el logo.

Los cambios de volumen, mute y Play/Pause se sincronizan entre el reproductor principal y la barra inferior.

## 7. Ecualizador

El ecualizador es individual para cada oyente. Cambiar un preset, una banda o la ganancia afecta solamente al audio que escucha ese visitante en su dispositivo; no modifica la transmisión original ni el sonido de otros oyentes.

Presets disponibles:

- Flat
- Bass
- Vocal
- Pop
- Rock
- Manual

También se pueden ajustar manualmente las bandas de 32 Hz a 16 kHz.

## 8. Prueba recomendada antes de usarlo públicamente

Compruebe lo siguiente en la página privada de prueba:

- la emisora comienza a sonar al pulsar Play;
- Pause detiene correctamente la reproducción;
- mute y desmute funcionan;
- el volumen principal funciona;
- el volumen de la barra inferior funciona y se sincroniza;
- el visualizador se anima al reproducir;
- al pausar se muestra el nombre sólido de la emisora;
- el ecualizador abre y cierra;
- los presets producen cambios audibles;
- los faders manuales funcionan;
- la barra inferior puede ocultarse y restaurarse;
- no se observan elementos cortados o fuera del diseño;
- el reproductor funciona en computadora y teléfono móvil.

## 9. Importante para esta versión MVP

- Se admite **una sola instancia funcional del shortcode por página**.
- El plugin está configurado actualmente para **Alcatraz Radio FM**.
- No es necesario editar código para realizar esta prueba.
- La posición vertical del reproductor dentro de la página depende del tema y de la plantilla de WordPress.
- El plugin no modifica el stream original de la emisora.

## 10. Si algo falla

No elimine el reproductor actual del sitio durante esta primera prueba.

Si el plugin presenta algún problema:

1. deje la página de prueba sin publicar o vuelva a ponerla como privada;
2. vaya a **Plugins**;
3. desactive **Alcatraz Radio Player**;
4. el resto del sitio debe continuar funcionando normalmente.

## 11. Retroalimentación solicitada

Para cada problema encontrado, envíe:

- captura de pantalla;
- dispositivo utilizado: PC, Android, iPhone, tablet;
- navegador: Chrome, Edge, Firefox, Safari, etc.;
- modo usado: `compact` o `full`;
- qué acción estaba realizando;
- qué esperaba que ocurriera;
- qué ocurrió realmente;
- si el problema se repite siempre o solo algunas veces.

También indique su opinión sobre:

- tamaño del reproductor;
- claridad de los controles;
- ubicación y utilidad de la barra inferior;
- diseño del modo compacto;
- diseño del modo full;
- facilidad de uso del ecualizador;
- comportamiento en móvil;
- cualquier cambio que considere necesario antes de sustituir el reproductor actual.

---

**Producto:** Alcatraz Radio Player  
**Estado:** versión MVP de prueba para validación en el sitio real  
**Autor:** Ermógenes Rodríguez Fernández
