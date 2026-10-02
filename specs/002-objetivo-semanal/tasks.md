# Tareas: Objetivo Semanal (Spec 002)

## [x] Tarea 1: Lógica central de dominio (Funciones puras y Tests)
**Descripción:** Implementar la lógica matemática y de validación libre de dependencias del DOM, asegurando su correcto funcionamiento mediante tests unitarios.
**RF asociados:** RF-3, RF-4, RF-6.
**Hecho cuando:**
- Se ha implementado `validateObjectiveMinutes` en `app.js`.
- Se ha implementado `calculateProgressPercent` en `app.js`.
- Los tests en `app.test.js` para estas funciones están completos y pasan en verde al ejecutar `node --test`.

## [x] Tarea 2: Persistencia y estado
**Descripción:** Conectar la aplicación con `localStorage` para guardar y recuperar el objetivo semanal de manera persistente.
**RF asociados:** RF-3, RF-7.
**Hecho cuando:**
- Existen funciones o lógica integrada en `app.js` para interactuar correctamente con `localStorage` bajo la clave `diario-estudio-objetivo`.
- Si no hay objetivo guardado, el sistema maneja la ausencia devolviendo `null` sin error.
- El objetivo recuperado se aplica al contexto general para poder ser usado en cualquier semana que se muestre.

## [x] Tarea 3: Modificación del DOM (HTML/CSS)
**Descripción:** Actualizar la estructura de la tarjeta "Tiempo esta semana" en el HTML y añadir los estilos necesarios para el botón de objetivo y la barra de progreso.
**RF asociados:** RF-1, RF-5.
**Hecho cuando:**
- `index.html` contiene el botón (texto "Fijar objetivo" o un icono de edición) en la tarjeta "Tiempo esta semana".
- `index.html` incluye la estructura de contenedor y relleno (fill) para la barra de progreso, así como un espacio para el texto de fracción estudiado/objetivo.
- `styles.css` contiene las reglas para que la barra de progreso se renderice y coloree correctamente, y su aspecto sea responsive.
- La UI se visualiza correctamente en su estado por defecto cuando no hay un objetivo configurado.

## [x] Tarea 4: Integración UI y Eventos (JavaScript)
**Descripción:** Conectar el HTML y el CSS con la lógica de estado y de dominio mediante eventos y renderizado de la UI en `app.js`.
**RF asociados:** RF-2, RF-4, RF-5, RF-6.
**Hecho cuando:**
- Un click en el botón de fijar objetivo desencadena un `prompt()` nativo.
- El input es procesado y, de ser válido, se guarda en localStorage y se refresca la vista. Si es inválido, se ignora en silencio.
- Al cargar la UI, si hay objetivo, se calcula el progreso con las funciones puras usando los minutos estudiados de la semana y el objetivo actual.
- La barra de progreso se llena de acuerdo al cálculo y se muestra el texto descriptivo del progreso ("estudiado / meta min").
