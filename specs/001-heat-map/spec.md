# Spec 001: Mapa de Calor (Heatmap)

## Contexto y objetivo
Para mantener la motivación a medio plazo y visualizar la constancia, el Diario de Estudio requiere un componente visual inspirado en el mapa de calor de contribuciones de GitHub. El objetivo es que el usuario reconozca rápidamente qué días ha estudiado y con qué intensidad en los últimos meses.

## Usuarios
- **Estudiante**: Quiere ver de un vistazo qué tan constante ha sido en las últimas 12 semanas para mantenerse motivado y no romper la racha.

## Historias de usuario
- Como estudiante, quiero ver un mapa de calor de mis sesiones recientes para identificar patrones de estudio.
- Como estudiante, quiero ver diferentes intensidades de color en los días para saber en cuáles me esforcé más.
- Como estudiante, quiero poder ver los detalles de un día concreto en el mapa para recordar cuánto estudié.

## Requisitos funcionales

### RF-1: Representación de semanas (Estructura)
- **Criterio de aceptación (EARS):** Cuando la página cargue, entonces el sistema mostrará una cuadrícula de columnas de 7 filas (Lunes a Domingo fluyendo de arriba a abajo). La cuadrícula fluirá de izquierda a derecha mostrando las últimas 12 semanas, terminando exactamente en la fecha local "hoy". Se añadirán celdas de relleno (padding transparente) al inicio si la primera semana no empieza en lunes, manteniendo la alineación del calendario.

### RF-2: Intensidad de color
- **Criterio de aceptación (EARS):** Si un día específico tiene sesiones registradas, cuando se renderice su celda, entonces el sistema aplicará un nivel de intensidad usando el color esmeralda (`color-emerald`) del tema: Nivel 1 (1-29 min), Nivel 2 (30-59 min), Nivel 3 (60-119 min), Nivel 4 (120+ min). Si tiene 0 minutos, entonces mostrará el Nivel 0 (celda vacía/fondo base).

### RF-3: Información por día (Tooltip)
- **Criterio de aceptación (EARS):** Cuando el usuario interactúe (hover/long-press) con una celda válida del mapa, entonces el sistema revelará un tooltip nativo (atributo `title`) con formato local y humano: "DD de mes de AAAA: X min [ (Yh Zm) ]" (ej. "14 de octubre de 2026: 125 min (2h 5m)").

### RF-4: Ubicación en la interfaz
- **Criterio de aceptación (EARS):** Cuando el usuario visualice la aplicación, entonces el mapa de calor se ubicará entre el panel de métricas superiores y la tarjeta del formulario de registro.

## Requisitos no funcionales
- **Separación arquitectónica**: El cálculo del estado del calendario debe realizarse a través de una función pura independiente del DOM y de `localStorage`, recibiendo "hoy" como argumento (cumpliendo `docs/constitution.md`).
- **Simplicidad de UI**: Implementación solo mediante flexbox/grid nativo de CSS, sin librerías de gráficos.

## Casos límite
- **Múltiples sesiones diarias**: La lógica debe sumar todos los minutos del mismo día antes de determinar el nivel de intensidad.
- **Saltos de mes/año**: La generación de días no debe desfasarse en años bisiestos ni meses asimétricos; se apoyará en la mutación segura usando fechas locales (`setDate()`).
- **Responsividad móvil (375px)**: Si el ancho del mapa de calor de 12 semanas supera el tamaño de la pantalla, la cuadrícula no debe encoger las celdas, sino habilitar un desplazamiento horizontal (`overflow-x: auto`).
- **Fechas futuras**: Las sesiones que por error consten con fecha en el futuro no afectan al mapa, pues este termina estrictamente en la fecha actual "hoy".

## Fuera de alcance
- Creación de tooltips HTML flotantes personalizados (solo se usarán atributos nativos).
- Interfaz o botones para navegar a meses o años anteriores al límite de las 12 semanas.
- Leyenda visual explicativa de los niveles de color en esta versión.

## Criterios de finalización
- La interfaz del mapa de calor está integrada visualmente en la vista móvil (con scroll horizontal) y escritorio.
- La función pura que provee la matriz de datos del mapa tiene tests en verde con `node --test`.
- La funcionalidad no introduce ninguna dependencia externa.
- Toda la UI cumple estrictamente con el idioma y el formato dictado en la constitución.
