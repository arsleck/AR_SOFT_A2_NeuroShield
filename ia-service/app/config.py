"""Constantes compartidas entre el entrenamiento y el servicio de inferencia."""
from pathlib import Path

# Mismos nombres que usa la aplicación (Misiones.vector y Cursos.categoria).
VECTORES = ["Phishing", "Smishing", "Vishing", "Ing. Social"]

# La red recibe las últimas MAX_PASOS interacciones del usuario.
MAX_PASOS = 20

# Características por interacción (una fila de la matriz de entrada):
#   0-3  vector de ataque (one-hot)
#   4    dificultad (0 Básico, 0.5 Intermedio, 1 Avanzado)
#   5    resultado (1 cayó o falló, 0.5 ignoró o se agotó el tiempo, 0 reportó o acertó)
#   6    tiempo de respuesta / tiempo límite (0 a 1; 0.5 en quizzes)
#   7    tipo de interacción (0 simulación, 1 pregunta de quiz)
#   8    fila válida (1) o relleno (0)
NUM_CARACTERISTICAS = 9

DIFICULTADES = {"Básico": 0.0, "Intermedio": 0.5, "Avanzado": 1.0}

RESULTADOS = {
    "caer": 1.0,
    "incorrecta": 1.0,
    "ignorar": 0.5,
    "tiempo": 0.5,
    "reportar": 0.0,
    "correcta": 0.0,
}

# Segunda salida de la red: perfil de refuerzo (clasificación multietiqueta).
# Cada valor es la probabilidad de que el usuario necesite ese tipo de refuerzo.
REFUERZOS = ["teoria", "presion", "reportar", "avanzar"]
UMBRAL_REFUERZO = 0.5

# Umbrales del puntaje global (0-100), iguales a la leyenda del perfil del usuario.
UMBRAL_MEDIO = 40
UMBRAL_ALTO = 60

VERSION_MODELO = "cnn1d-v2"
DIR_MODELOS = Path(__file__).resolve().parent.parent / "modelos"
RUTA_MODELO = DIR_MODELOS / "neuroshield_cnn.keras"
RUTA_METRICAS = DIR_MODELOS / "metricas.json"


def nivel_desde_puntaje(puntaje: float) -> str:
    if puntaje >= UMBRAL_ALTO:
        return "Alto"
    if puntaje >= UMBRAL_MEDIO:
        return "Medio"
    return "Bajo"
