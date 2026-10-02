# Plan de Implementación: Objetivo Semanal (Spec 002)

## Archivos modificados
1. `index.html`: Modificar la tarjeta "Tiempo esta semana" para incluir el botón de configuración de objetivo y la estructura DOM de la barra de progreso.
2. `styles.css`: Añadir estilos visuales para la barra de progreso (asegurando límite visual al 100%), el botón de edición y el texto de progreso (ej. "120/100 min").
3. `app.js`: 
    - Integrar funciones de lectura/escritura en `localStorage` (clave `diario-estudio-objetivo`).
    - Añadir lógica de evento para el botón de configurar objetivo (usando `prompt()`).
    - Modificar la función de renderizado de la UI para calcular y mostrar el progreso usando las nuevas funciones puras.
    - Añadir las funciones puras requeridas.
4. `app.test.js`: Añadir tests unitarios para las nuevas funciones puras utilizando el runner nativo de node (`node --test`).

## Funciones puras necesarias (`app.js`)
- `validateObjectiveMinutes(input)`: Recibe un string (el input del prompt). Devuelve un número entero válido si está entre 1 y 10000. Devuelve `null` si es inválido, vacío, no numérico, o cancelado.
- `calculateProgressPercent(studiedMinutes, objectiveMinutes)`: Recibe dos números. Devuelve el porcentaje de progreso limitado a 100 (`Math.min(100, Math.floor((studiedMinutes / objectiveMinutes) * 100))`). Maneja el caso en que `objectiveMinutes` no sea válido o sea cero, devolviendo 0 de forma segura.

## Estrategia `node --test`
Se añadirán bloques de tests en `app.test.js`:
1. **Tests para `validateObjectiveMinutes`**:
   - Casos válidos: "100", " 50 ", "1", "10000" -> 100, 50, 1, 10000.
   - Casos inválidos (retornan `null`): "", "abc", "0", "-10", "10001", `null` (cancelación de prompt).
2. **Tests para `calculateProgressPercent`**:
   - Progreso normal: 50 estudiados, 100 objetivo -> 50.
   - Superar meta: 120 estudiados, 100 objetivo -> 100 (límite visual para barra).
   - Sin progreso: 0 estudiados, 100 objetivo -> 0.
   - Falsy / Sin objetivo: manejos seguros cuando el objetivo es 0 o indefinido (retorna 0).
