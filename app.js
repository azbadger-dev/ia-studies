// ==========================================
// DIARIO DE ESTUDIO - LÓGICA PRINCIPAL (JAVASCRIPT)
// ==========================================

// Clave para guardar las sesiones en localStorage (definida en AGENTS.md)
const LOCAL_STORAGE_KEY = 'diario-estudio-sesiones';
const LEGACY_STORAGE_KEY = 'diario_estudio_sesiones';
const OBJECTIVE_STORAGE_KEY = 'diario-estudio-objetivo';

// Estado de la aplicación: arreglo donde guardaremos las sesiones
let sesiones = [];
let objetivoSemanal = null;

// Elementos del DOM que vamos a utilizar
const sessionForm = document.getElementById('sessionForm');
const dateInput = document.getElementById('dateInput');
const topicInput = document.getElementById('topicInput');
const minutesInput = document.getElementById('minutesInput');
const streakCountEl = document.getElementById('streakCount');
const bestStreakCountEl = document.getElementById('bestStreakCount');
const weeklyMinutesEl = document.getElementById('weeklyMinutes');
const monthlyDaysEl = document.getElementById('monthlyDays');
const sessionsListEl = document.getElementById('sessionsList');
const heatmapGridEl = document.getElementById('heatmapGrid');
const setObjectiveBtn = document.getElementById('setObjectiveBtn');
const objectiveText = document.getElementById('objectiveText');
const progressContainer = document.getElementById('progressContainer');
const weeklyProgressBar = document.getElementById('weeklyProgressBar');

// ==========================================
// FUNCIONES DE FECHA (FECHA LOCAL DEL USUARIO)
// ==========================================

/**
 * Obtiene una fecha en formato YYYY-MM-DD usando siempre la hora local del usuario.
 * @param {Date} dateObj - Objeto Date (por defecto la fecha y hora actuales)
 * @returns {string} Fecha en formato "YYYY-MM-DD"
 */
function obtenerFechaLocal(dateObj = new Date()) {
  const anio = dateObj.getFullYear();
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Formatea una fecha "YYYY-MM-DD" a un formato legible en español.
 * @param {string} fechaStr - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada (ej. "1 de oct. de 2026")
 */
function formatearFechaLegible(fechaStr) {
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;

  const anio = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const fechaObj = new Date(anio, mes, dia);
  return fechaObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// ==========================================
// LÓGICA DE ALMACENAMIENTO (LOCALSTORAGE)
// ==========================================

/**
 * Carga las sesiones guardadas desde localStorage (con fallback para compatibilidad).
 */
function cargarSesiones() {
  const datosGuardados = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (datosGuardados) {
    try {
      sesiones = JSON.parse(datosGuardados);
    } catch (error) {
      console.error('Error al leer datos de localStorage:', error);
      sesiones = [];
    }
  } else {
    sesiones = [];
  }
}

/**
 * Guarda las sesiones en localStorage para no perder los datos al recargar.
 */
function guardarSesiones() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sesiones));
}

/**
 * Carga el objetivo semanal desde localStorage.
 * @returns {number|null} El objetivo en minutos o null si no hay objetivo válido
 */
function cargarObjetivo() {
  const guardado = localStorage.getItem(OBJECTIVE_STORAGE_KEY);
  if (guardado !== null) {
    const val = parseInt(guardado, 10);
    objetivoSemanal = isNaN(val) ? null : val;
  } else {
    objetivoSemanal = null;
  }
  return objetivoSemanal;
}

/**
 * Guarda el objetivo semanal en localStorage.
 * @param {number|null} minutos - El objetivo en minutos o null para borrarlo
 */
function guardarObjetivo(minutos) {
  if (minutos === null) {
    localStorage.removeItem(OBJECTIVE_STORAGE_KEY);
  } else {
    localStorage.setItem(OBJECTIVE_STORAGE_KEY, minutos);
  }
  objetivoSemanal = minutos;
}

// ==========================================
// CÁLCULO DE LA RACHA ACTUAL Y MEJOR RACHA
// ==========================================

/**
 * Calcula la racha actual de días seguidos estudiando.
 * Reglas:
 * 1. Un día cuenta si tiene al menos una sesión.
 * 2. La racha son días consecutivos finalizando hoy.
 * 3. Si hoy no has estudiado pero ayer sí, la racha sigue viva (no se rompe hasta que termina el día).
 * 4. Usa siempre la fecha local.
 * @returns {number} Número de días seguidos en racha actual
 */
function calcularRacha() {
  if (sesiones.length === 0) return 0;

  // Creamos un conjunto (Set) con todas las fechas únicas que tienen al menos una sesión
  const fechasConEstudio = new Set(sesiones.map(s => s.date));

  const hoy = new Date();
  const fechaHoyStr = obtenerFechaLocal(hoy);

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyerStr = obtenerFechaLocal(ayer);

  let fechaIteracion;

  // Si hoy se registró sesión, empezamos a contar desde hoy hacia atrás
  if (fechasConEstudio.has(fechaHoyStr)) {
    fechaIteracion = new Date(hoy);
  } 
  // Si hoy no hay sesión aún, pero ayer sí la hubo, la racha sigue viva desde ayer
  else if (fechasConEstudio.has(fechaAyerStr)) {
    fechaIteracion = new Date(ayer);
  } 
  // Si ni hoy ni ayer hubo estudio, la racha se ha roto (0 días)
  else {
    return 0;
  }

  let racha = 0;

  // Contamos días consecutivos hacia atrás mientras existan en nuestro conjunto
  while (true) {
    const fechaStr = obtenerFechaLocal(fechaIteracion);
    if (fechasConEstudio.has(fechaStr)) {
      racha++;
      // Retrocedemos un día
      fechaIteracion.setDate(fechaIteracion.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
}

/**
 * Calcula la mejor racha histórica alcanzada en todo el registro.
 * Reglas:
 * 1. Excluye fechas futuras.
 * 2. Determina la secuencia más larga de días consecutivos con sesión.
 * @returns {number} Número máximo de días consecutivos históricos
 */
function calcularMejorRacha() {
  if (sesiones.length === 0) return 0;

  const hoyStr = obtenerFechaLocal();

  // Obtener fechas únicas filtradas (ignorando fechas futuras) y ordenadas ascendentemente
  const fechasUnicas = [...new Set(sesiones.map(s => s.date))]
    .filter(fecha => fecha <= hoyStr)
    .sort();

  if (fechasUnicas.length === 0) return 0;

  let maxRacha = 1;
  let rachaActualBloque = 1;

  for (let i = 1; i < fechasUnicas.length; i++) {
    const prevPartes = fechasUnicas[i - 1].split('-');
    const prevDate = new Date(parseInt(prevPartes[0], 10), parseInt(prevPartes[1], 10) - 1, parseInt(prevPartes[2], 10));

    // Sumar 1 día a prevDate usando setDate (regla local-dates: no usar milisegundos)
    const siguienteDiaObj = new Date(prevDate);
    siguienteDiaObj.setDate(siguienteDiaObj.getDate() + 1);
    const siguienteDiaStr = obtenerFechaLocal(siguienteDiaObj);

    if (fechasUnicas[i] === siguienteDiaStr) {
      rachaActualBloque++;
    } else {
      rachaActualBloque = 1;
    }

    if (rachaActualBloque > maxRacha) {
      maxRacha = rachaActualBloque;
    }
  }

  return maxRacha;
}

// ==========================================
// CÁLCULO DE MINUTOS ESTUDIADOS ESTA SEMANA
// ==========================================

/**
 * Obtiene las fechas de inicio (lunes) y fin/hoy de la semana actual en hora local.
 * @returns {Object} { lunesStr, domingoStr, hoyStr }
 */
function obtenerRangoSemanaActual() {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0: Domingo, 1: Lunes, 2: Martes...
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;

  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diasHastaLunes);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  return {
    lunesStr: obtenerFechaLocal(lunes),
    domingoStr: obtenerFechaLocal(domingo),
    hoyStr: obtenerFechaLocal(hoy)
  };
}

/**
 * Calcula la suma de minutos estudiados durante la semana actual (de lunes a hoy).
 * @returns {number} Minutos totales de la semana
 */
function calcularMinutosSemana() {
  if (sesiones.length === 0) return 0;

  const { lunesStr, hoyStr } = obtenerRangoSemanaActual();

  return sesiones
    .filter(s => s.date >= lunesStr && s.date <= hoyStr)
    .reduce((total, s) => total + (parseInt(s.minutes, 10) || 0), 0);
}

/**
 * Formatea los minutos para mostrarlos en la interfaz. Si supera los 60 min, desglosa horas.
 * @param {number} minutos - Total de minutos
 * @returns {string} Texto formateado (ej. "45 min" o "125 min (2h 5m)")
 */
function formatearMinutos(minutos) {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;
  return minsRestantes > 0 ? `${minutos} min (${horas}h ${minsRestantes}m)` : `${minutos} min (${horas}h)`;
}

// ==========================================
// CÁLCULO DE DÍAS ESTUDIADOS ESTE MES
// ==========================================

/**
 * Calcula la cantidad de días únicos estudiados durante el mes local actual.
 * Reglas (local-dates):
 * - Utiliza getFullYear() y getMonth() + 1 en hora local.
 * - Sin toISOString() ni new Date("AAAA-MM-DD").
 * - Varias sesiones el mismo día cuentan como 1 solo día (vía Set).
 * - Excluye fechas futuras.
 * @returns {number} Número de días únicos estudiados este mes
 */
function calcularDiasMes() {
  if (sesiones.length === 0) return 0;

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const prefijoMesStr = `${anio}-${mes}`;
  const hoyStr = obtenerFechaLocal(hoy);

  // Filtrar fechas que pertenezcan al mes actual y no sean futuras
  const fechasMes = sesiones
    .map(s => s.date)
    .filter(fechaStr => fechaStr.startsWith(prefijoMesStr) && fechaStr <= hoyStr);

  return new Set(fechasMes).size;
}

// ==========================================
// RENDERIZADO EN PANTALLA
// ==========================================

/**
 * Actualiza las rachas, minutos semanales, días del mes y vuelve a dibujar el historial de sesiones en el DOM.
 */
function renderizar() {
  // 1. Mostrar las métricas principales
  const rachaActual = calcularRacha();
  const mejorRacha = calcularMejorRacha();
  const minutosSemana = calcularMinutosSemana();
  const diasMes = calcularDiasMes();

  streakCountEl.textContent = rachaActual;
  bestStreakCountEl.textContent = mejorRacha;
  weeklyMinutesEl.textContent = formatearMinutos(minutosSemana);
  monthlyDaysEl.textContent = `${diasMes} ${diasMes === 1 ? 'día' : 'días'}`;

  // Objetivo Semanal y Progreso
  if (objetivoSemanal !== null) {
    const percent = calculateProgressPercent(minutosSemana, objetivoSemanal);
    objectiveText.textContent = `/ ${objetivoSemanal} min`;
    progressContainer.style.display = '';
    weeklyProgressBar.style.width = `${percent}%`;
  } else {
    objectiveText.textContent = '';
    progressContainer.style.display = 'none';
  }

  // 1.5 Renderizar el Mapa de Calor
  const datosMapa = generarDatosMapaCalor(sesiones, new Date());
  heatmapGridEl.innerHTML = datosMapa.map(celda => {
    if (celda.esRelleno) {
      return '<div class="heat-cell empty"></div>';
    }
    return `<div class="heat-cell" data-level="${celda.nivel}" title="${celda.tooltip}"></div>`;
  }).join('');

  // 2. Ordenar de la sesión más reciente a la más antigua (por fecha descendente y luego ID)
  const sesionesOrdenadas = [...sesiones].sort((a, b) => {
    if (b.date !== a.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id - a.id;
  });

  // 3. Renderizar la lista
  sessionsListEl.innerHTML = '';

  if (sesionesOrdenadas.length === 0) {
    sessionsListEl.innerHTML = '<li class="empty-message">No hay sesiones registradas. ¡Empieza añadiendo una arriba!</li>';
    return;
  }

  sesionesOrdenadas.forEach(sesion => {
    const li = document.createElement('li');
    li.className = 'session-item';

    const fechaFormateada = formatearFechaLegible(sesion.date);

    li.innerHTML = `
      <div class="session-info">
        <span class="session-topic">${escapeHtml(sesion.topic)}</span>
        <span class="session-date">${fechaFormateada}</span>
      </div>
      <div class="session-time">${sesion.minutes} min</div>
    `;

    sessionsListEl.appendChild(li);
  });
}

/**
 * Escapa caracteres HTML para evitar fallos de seguridad o formateo al mostrar el texto introducido por el usuario.
 */
function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ==========================================
// EVENTOS E INICIALIZACIÓN
// ==========================================

// Evento para fijar objetivo semanal
setObjectiveBtn.addEventListener('click', () => {
  const input = prompt('Ingresa tu objetivo semanal en minutos (ej. 300)');
  const val = validateObjectiveMinutes(input);
  if (val !== null) {
    guardarObjetivo(val);
    renderizar();
  }
});

// Guardar nueva sesión al enviar el formulario
sessionForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const fecha = dateInput.value;
  const tema = topicInput.value.trim();
  const minutos = parseInt(minutesInput.value, 10);

  // Validación de campos obligatorios
  if (!fecha || !tema || isNaN(minutos) || minutos <= 0) {
    return;
  }

  // Crear la nueva sesión
  const nuevaSesion = {
    id: Date.now(),
    date: fecha,
    topic: tema,
    minutes: minutos
  };

  // Agregar al estado y guardar en localStorage
  sesiones.push(nuevaSesion);
  guardarSesiones();

  // Limpiar campos de texto/número y restablecer la fecha a hoy
  sessionForm.reset();
  dateInput.value = obtenerFechaLocal();

  // Actualizar la vista
  renderizar();
});

// Inicializar la aplicación al abrir la página
function iniciarApp() {
  // Establecer la fecha predeterminada en el formulario (hoy local)
  dateInput.value = obtenerFechaLocal();

  // Cargar datos y renderizar
  cargarSesiones();
  cargarObjetivo();
  renderizar();
}

if (typeof window !== 'undefined') {
  iniciarApp();
}

// ==========================================
// FUNCIONES PURAS Y EXPORTS PARA TESTS
// ==========================================

function generarDatosMapaCalor(sesiones, fechaHoy) {
  // 1. Agrupar sesiones por fecha local sumando minutos
  const minutosPorFecha = {};
  for (const s of sesiones) {
    if (!minutosPorFecha[s.date]) minutosPorFecha[s.date] = 0;
    minutosPorFecha[s.date] += parseInt(s.minutes, 10);
  }

  // 2. Determinar fecha de inicio (hace 83 días para un total de 84 días)
  const inicio = new Date(fechaHoy);
  inicio.setDate(fechaHoy.getDate() - 83);

  // 3. Calcular el padding para alinear al Lunes
  // getDay(): 0 es Domingo, 1 es Lunes, etc.
  const diaSemanaInicio = inicio.getDay();
  const paddingDias = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

  const resultado = [];
  
  // Insertar padding
  for (let i = 0; i < paddingDias; i++) {
    resultado.push({ esRelleno: true });
  }

  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // 4. Bucle para los 84 días
  const iterador = new Date(inicio);
  for (let i = 0; i < 84; i++) {
    const year = iterador.getFullYear();
    const month = String(iterador.getMonth() + 1).padStart(2, '0');
    const day = String(iterador.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const minutos = minutosPorFecha[dateStr] || 0;
    
    // RF-2: Intensidad de color
    let nivel = 0;
    if (minutos > 0 && minutos <= 29) nivel = 1;
    else if (minutos >= 30 && minutos <= 59) nivel = 2;
    else if (minutos >= 60 && minutos <= 119) nivel = 3;
    else if (minutos >= 120) nivel = 4;

    // RF-3: Tooltip
    const fechaHumana = `${iterador.getDate()} de ${meses[iterador.getMonth()]} de ${year}`;
    let tooltip = `${fechaHumana}: ${minutos} min`;
    if (minutos >= 60) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      if (m > 0) tooltip += ` (${h}h ${m}m)`;
      else tooltip += ` (${h}h)`;
    }

    resultado.push({
      esRelleno: false,
      nivel,
      tooltip
    });

    // Avanzar un día
    iterador.setDate(iterador.getDate() + 1);
  }

  return resultado;
}

function validateObjectiveMinutes(input) {
  if (input === null || input === undefined || String(input).trim() === "") return null;
  const num = Number(input);
  if (isNaN(num) || num < 1 || num > 10000 || !Number.isInteger(num)) {
    return null;
  }
  return num;
}

function calculateProgressPercent(studiedMinutes, objectiveMinutes) {
  if (!objectiveMinutes || objectiveMinutes <= 0) return 0;
  return Math.min(100, Math.floor((studiedMinutes / objectiveMinutes) * 100));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generarDatosMapaCalor,
    validateObjectiveMinutes,
    calculateProgressPercent
  };
}
