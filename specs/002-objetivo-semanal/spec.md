# Spec 002 — Objetivo semanal de estudio

Estado: borrador

## Contexto y objetivo
Añadir la capacidad de fijar un objetivo semanal de estudio (en minutos) y visualizar el progreso de lo estudiado en la semana actual frente a ese objetivo, para motivar al usuario a cumplirlo.

## Usuarios
Estudiantes o personas que usan la aplicación y quieren mantener un mínimo de minutos dedicados por semana.

## Historias de usuario
- HU-1. Como usuario, quiero fijar cuántos minutos deseo estudiar a la semana para tener una meta clara.
- HU-2. Como usuario, quiero ver una barra de progreso que compare mi tiempo acumulado con mi objetivo semanal para motivarme a completarlo.
- HU-3. Como usuario, quiero poder cambiar mi objetivo desde la tarjeta de "Tiempo esta semana" mediante un prompt rápido nativo.

## Definiciones
- **Objetivo semanal**: Cantidad de minutos a estudiar a lo largo de una semana. Se hereda automáticamente entre semanas hasta que se edite.
- **Progreso**: Porcentaje del objetivo cumplido durante la semana actual.
- **Semana local**: Periodo de Lunes a Domingo, según la zona horaria del usuario.

## Requisitos funcionales
- RF-1: CUANDO el usuario visualiza la tarjeta "Tiempo esta semana", EL SISTEMA debe mostrar siempre un botón (icono de lápiz o "Fijar objetivo") para definir/editar el objetivo.
- RF-2: CUANDO el usuario pulsa el botón, EL SISTEMA utilizará un `prompt()` nativo del navegador solicitando la cantidad de minutos deseada.
- RF-3: SI el usuario introduce un número entero positivo válido (entre 1 y 10000), EL SISTEMA guardará este objetivo en una nueva clave en el `localStorage` (ej. `diario-estudio-objetivo`).
- RF-4: SI el usuario introduce un dato inválido, vacío o cancela el prompt, EL SISTEMA lo ignorará en silencio y mantendrá el objetivo anterior si existiera (o seguirá sin objetivo).
- RF-5: CUANDO existe un objetivo configurado, EL SISTEMA debe mostrar una barra de progreso visual en la tarjeta "Tiempo esta semana".
- RF-6: EL SISTEMA calculará el porcentaje de progreso de la semana. La barra visual no desbordará (se limita al 100% visualmente), pero el texto mostrará los minutos reales estudiados aunque superen la meta (ej. "120 / 100 min").
- RF-7: EL SISTEMA aplicará este mismo objetivo numérico a todas las semanas de forma heredada y persistente. El ciclo de tiempo semanal se reinicia los lunes, pero el objetivo configurado sigue siendo el mismo a menos que el usuario lo cambie.

## Requisitos no funcionales
- Interfaz HTML/CSS/JS puro, responsive.
- **Constitución (Regla 3 y 4)**: Toda la lógica matemática de validación de minutos y cálculo del porcentaje de progreso debe aislarse en funciones puras testeables que no dependan del DOM.
- Almacenamiento independiente de la clave principal para evitar corromper los datos del historial de sesiones.

## Casos límite
- **Superar la meta**: El usuario registra 120 minutos para un objetivo de 100. El texto dice "120/100 min", la barra visual está al 100%.
- **Disminución de meta**: El usuario tiene 50 minutos estudiados y baja su objetivo a 30. Al actualizar, el texto dice "50/30 min" y la barra pasa instantáneamente al 100%.
- **Cero minutos**: Semana nueva sin sesiones registradas. La barra debe estar al 0%.

## Fuera de alcance
- Historial de cumplimiento de objetivos pasados (solo importa la semana actual).

## Criterios de finalización
- El objetivo se puede configurar usando un `prompt()` nativo y actualiza la UI inmediatamente.
- La barra de progreso refleja el cálculo correctamente y no rompe la interfaz móvil si se supera el 100%.
- Tests de Node en verde cubriendo las nuevas funciones puras de validación de minutos y cálculo de progreso.
