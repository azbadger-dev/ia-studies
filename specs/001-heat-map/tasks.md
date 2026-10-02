# Tareas: Mapa de Calor (001-heat-map)

- [x] **Tarea 1: Estructura base de lógica y tests (RF-1, RF-2, RF-3)**
  - Crear el archivo `app.test.js` (si no existe) e importar dependencias (`node:assert`, `node:test`).
  - Crear el cascarón de la función pura `generarDatosMapaCalor` (aislada de localStorage y DOM).
  - *Hecho cuando:* El comando `node --test` ejecuta correctamente sin errores de sintaxis y la función es accesible.

- [x] **Tarea 2: Lógica de padding y rango de los 84 días (RF-1)**
  - Implementar en la función pura el cálculo para encontrar el día inicial (83 días atrás).
  - Implementar la inyección de celdas vacías (`esRelleno: true`) para alinear ese día inicial al Lunes.
  - Generar el bucle que construye los objetos por día.
  - *Hecho cuando:* Un test unitario pase en verde comprobando que para un miércoles "hoy", el array generado inicia con 2 días de relleno y contiene en total las celdas necesarias para formar 12 semanas exactas.

- [x] **Tarea 3: Agrupación de minutos y niveles de intensidad (RF-2)**
  - Añadir la lógica para agrupar y sumar los minutos de múltiples sesiones pertenecientes a una misma fecha local.
  - Implementar los rangos de nivel (0 a 4) según los minutos agrupados (0, 1-29, 30-59, 60-119, >=120).
  - *Hecho cuando:* Un test en verde verifica que inputs de 0, 1, 30, 60 y 120 minutos en distintas fechas (incluyendo sesiones duplicadas en un día) devuelvan los niveles `0, 1, 2, 3, 4` respectivos.

- [x] **Tarea 4: Lógica de tooltips localizados (RF-3)**
  - Implementar la generación del string del tooltip dentro del objeto devuelto por la función pura.
  - Aplicar formato de fecha local en español y la conversión condicional a formato "horas y minutos" si es >= 60 min.
  - *Hecho cuando:* Un test unitario valide que una celda devuelva exactamente un string con formato `14 de octubre de 2026: 125 min (2h 5m)`.

- [x] **Tarea 5: Estructura HTML y CSS Grid (RF-1, RF-2, RF-4)**
  - Añadir en `index.html` el contenedor semántico entre las tarjetas de métricas y el formulario.
  - Añadir en `styles.css` la configuración base del mapa (`display: grid`, `grid-template-rows: repeat(7, 1fr)`, `grid-auto-flow: column`).
  - Añadir en `styles.css` las clases de color basadas en variables CSS para los atributos `data-level="0"` a `data-level="4"` y gestionar el `overflow-x` para móviles.
  - *Hecho cuando:* La sección exista visualmente en la aplicación y se vea estéticamente en su lugar al recargar en Chrome (aunque esté estática o vacía), sin romper el layout en tamaño móvil.

- [x] **Tarea 6: Integración y renderizado dinámico (RF-1, RF-2, RF-3, RF-4)**
  - Llamar a `generarDatosMapaCalor(sesiones, nuevaFechaLocal)` dentro del ciclo de vida `renderizar()` en `app.js`.
  - Iterar la respuesta y construir los divs `.heat-cell` en el DOM inyectando el `data-level` y `title`.
  - *Hecho cuando:* Añadir una nueva sesión usando el formulario de la app actualice instantáneamente el mapa de calor con el nivel y tooltip correctos, comprobado de forma manual en el navegador.
