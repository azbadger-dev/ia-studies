# Plan Técnico 001: Mapa de Calor (Heatmap)

## 1. Archivos afectados y responsabilidades

*   **`index.html` (Modificación):** Añadir la estructura contenedora del mapa de calor (`<section class="heatmap-section">`) exactamente entre el panel de métricas y el formulario. (Cubre **RF-4**)
*   **`styles.css` (Modificación):** Implementar las reglas para el layout del mapa (CSS Grid), el scroll horizontal (`overflow-x`), y definir los colores en base a atributos `data-level` usando opacidades de `color-emerald`. (Cubre **RF-1, RF-2**)
*   **`app.js` (Modificación):** Añadir la función pura de cálculo de matriz de días y extender la función principal de renderizado (`renderizar`) para inyectar las celdas generadas en el DOM. (Cubre **RF-1, RF-2, RF-3**)
*   **`app.test.js` (Creación/Modificación):** Archivo de pruebas nativo que ejecutará las aserciones en la función pura usando el módulo `node:assert` y `node:test`. (Asegura la constitución y **RF-1, RF-2, RF-3**)

---

## 2. Funciones puras de lógica

Se creará una función pura en `app.js` (o en un módulo testeable separado según la arquitectura actual, exportado para test).

**Firma de la función:**
`function generarDatosMapaCalor(sesionesGuardadas, fechaHoy)`

**Responsabilidad:** No toca DOM ni `localStorage`. Devuelve un array plano de objetos estructurados listos para iterar en la UI.
**Estructura de retorno:**
```javascript
[
  { esRelleno: true }, // Días invisibles para alinear al Lunes
  { esRelleno: false, nivel: 2, tooltip: "14 de octubre de 2026: 45 min" },
  // ...
]
```

---

## 3. Algoritmo del mapa en pseudocódigo

```text
Función generarDatosMapaCalor(sesiones, fechaHoy):
  1. Agrupar 'sesiones' por fecha local sumando los minutos (ej: { "2026-10-01": 45 }). (Caso Límite)
  
  2. Determinar fecha límite inicial: 
     - Clonar fechaHoy y restar 83 días (para tener exactamente 84 días contando hoy). (RF-1)
     
  3. Calcular padding (Lunes a Domingo = 1 a 7, Domingo=0 en JS, requiere ajuste):
     - Días a rellenar = los necesarios para retroceder desde el día de la semana de la fecha inicial calculada hasta el Lunes.
     - Añadir al array de resultado tantos objetos { esRelleno: true } como días de padding.
     
  4. Bucle desde fecha inicial hasta fechaHoy inclusive:
     a. Formatear la fecha actual a "YYYY-MM-DD" local.
     b. Obtener minutos estudiados ese día del diccionario del paso 1 (0 si no existe).
     c. Calcular intensidad (RF-2):
        - 0 min -> Nivel 0
        - 1-29 min -> Nivel 1
        - 30-59 min -> Nivel 2
        - 60-119 min -> Nivel 3
        - >=120 min -> Nivel 4
     d. Generar texto de tooltip (RF-3):
        - Convertir minutos a horas/minutos si >= 60.
        - Formatear fecha a formato español local (ej. Intl.DateTimeFormat o manual).
     e. Añadir { esRelleno: false, nivel, tooltip } al array de resultado.
     f. Avanzar fecha de iteración en 1 día (+1 al getDate()).
     
  5. Devolver array de resultado.
```

---

## 4. Cómo se pinta en la interfaz (Renderizado)

1.  En la función `renderizar()` (o su equivalente), se llama a `generarDatosMapaCalor(sesiones, nuevaFechaLocalHoy)`.
2.  Se limpia el contenedor del DOM (`#heatmapGrid.innerHTML = ''`).
3.  Se itera sobre el array devuelto:
    *   Si `esRelleno`: Insertar `<div class="heat-cell empty"></div>`.
    *   Si no: Insertar `<div class="heat-cell" data-level="${nivel}" title="${tooltip}"></div>`.
4.  **CSS:** El contenedor usa `display: grid; grid-template-rows: repeat(7, 1fr); grid-auto-flow: column; gap: 4px; overflow-x: auto;`.

---

## 5. Decisiones técnicas justificadas

*   **Decisión:** Usar `CSS Grid` con `grid-auto-flow: column` en lugar de contenedores de columnas separados en HTML.
    *   **Alternativa descartada:** Agrupar en HTML por `<div class="week">` usando un array de arrays bidimensional.
    *   **Justificación:** Mantiene la lógica de JS muchísimo más simple (devuelve un array plano en lugar de anidado) y el HTML más limpio. CSS Grid se encarga automáticamente del salto a la siguiente columna cada 7 celdas.
*   **Decisión:** El cálculo de padding invisible (celdas vacías) se hace en la función pura de JS.
    *   **Alternativa descartada:** Dejar que CSS posicione la primera celda en la fila correcta usando `grid-row-start`.
    *   **Justificación:** El uso explícito de celdas "falsas" en los datos mantiene el componente de UI tonto y fácil de predecir, garantizando una cuadrícula perfecta independientemente del navegador, y es trivial de comprobar en tests automáticos.

---

## 6. Estrategia de tests con `node --test`

Siguiendo el mandato de "Tests como puerta" (Constitución):

1.  **Test de Padding (RF-1):** Proveer un `fechaHoy` que caiga en Miércoles. Afirmar que el array resultante comienza con 2 celdas de `esRelleno: true` (Lunes y Martes) seguido del total exacto de 84 celdas con datos.
2.  **Test de Límites de Nivel (RF-2):** Pasar mock de sesiones con días que sumen exactamente `0, 1, 29, 30, 59, 60, 119, y 120` minutos. Afirmar que el `nivel` devuelto en cada fecha correspondiente encaja con los saltos (0, 1, 1, 2, 2, 3, 3, 4).
3.  **Test de Formato Humano (RF-3):** Pasar un mock con una sesión de "2026-10-14" con 130 minutos. Afirmar que el `tooltip` devuelto contiene la cadena exacta en español (ej. `"14 de octubre de 2026: 130 min (2h 10m)"`).
4.  **Test de Multi-Sucesos Límite:** Pasar dos sesiones en la misma fecha (ej. 30m y 30m) y afirmar que el nivel asignado corresponde al Nivel 3 (60m) en lugar de crear dos celdas o evaluarse por separado.
