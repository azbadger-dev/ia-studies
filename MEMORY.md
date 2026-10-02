# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v4 funcionando: registro de sesiones, rachas (🔥 actual, 🏆 mejor), tiempo semanal (⏱️), días del mes estudiados (📅) e historial ordenado.
- Datos almacenados en `localStorage` con clave `diario-estudio-sesiones` (con fallback de compatibilidad).
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Cálculo dinámico de la mejor racha: se analiza todo el historial sin modificar la estructura de datos almacenados en localStorage.
- Semana de Lunes a Domingo: se calcula el acumulado semanal filtrando la fecha local desde el Lunes en curso hasta la fecha de hoy, desglosando horas a partir de 60 min (ej. `125 min (2h 5m)`).
- Días del mes (skill local-dates): se obtienen días únicos mediante `Set` usando el prefijo `"YYYY-MM"` local del usuario, excluyendo fechas futuras y evitando toISOString().
- Diseño UI (skill frontend-design): dashboard responsivo en cuadrícula 2x2 con distintivos visuales por métrica, campos de formulario con enfoque suave y botón de acción táctil en tono pizarra.
- Objetivo Semanal: Se implementó un objetivo semanal configurable que muestra una barra de progreso calculada sobre el total de minutos estudiados en la semana actual. Los datos persisten de manera segura en `localStorage`.
## Aprendizajes y errores a evitar
- Testing UI móvil: Se verificó la UI a 375px y el funcionamiento del cálculo de racha con éxito (sin errores en DevTools).
## Próximos pasos
- (vacío por ahora)
