// =========================================================================
// CLIENTE DEL SERVICIO DE INTELIGENCIA ARTIFICIAL
// Único punto del backend que habla con el microservicio de IA (FastAPI).
// Si el servicio no responde, devuelve null y la aplicación sigue funcionando
// con el motor de reglas.
// =========================================================================
const IA_SERVICE_URL = (process.env.IA_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
const IA_TIMEOUT_MS = parseInt(process.env.IA_TIMEOUT_MS, 10) || 5000;

async function llamar(ruta, { metodo = 'GET', cuerpo } = {}) {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), IA_TIMEOUT_MS);
  try {
    const respuesta = await fetch(`${IA_SERVICE_URL}${ruta}`, {
      method: metodo,
      headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error(`[IA] ${metodo} ${ruta} respondió ${respuesta.status}: ${detalle.slice(0, 200)}`);
      return null;
    }
    return await respuesta.json();
  } catch (error) {
    const motivo = error.name === 'AbortError' ? `sin respuesta en ${IA_TIMEOUT_MS} ms` : error.message;
    console.error(`[IA] Servicio no disponible en ${IA_SERVICE_URL} (${motivo})`);
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

module.exports = {
  IA_SERVICE_URL,
  // Estado del servicio y métricas del modelo
  estado: () => llamar('/health'),
  // Historial de un usuario -> vulnerabilidad estimada y recomendaciones
  predecir: (idUsuario, interacciones) =>
    llamar('/predict', { metodo: 'POST', cuerpo: { id_usuario: idUsuario, interacciones } }),
  // Historiales de un grupo -> borrador de curso y examen
  // `opciones` son las respuestas del asistente del administrador (nivel, num_preguntas, incluir_refuerzo)
  sugerirCurso: (usuarios, vector, opciones = {}) =>
    llamar('/sugerir-curso', { metodo: 'POST', cuerpo: { usuarios, vector: vector || null, ...opciones } }),
  // Historiales de un grupo -> borrador de misión del simulador
  // `opciones`: dificultad y presion ('auto' | 'normal' | 'alta')
  sugerirMision: (usuarios, vector, titulosExistentes, opciones = {}) =>
    llamar('/sugerir-mision', {
      metodo: 'POST',
      cuerpo: { usuarios, vector: vector || null, titulos_existentes: titulosExistentes || [], ...opciones }
    })
};
