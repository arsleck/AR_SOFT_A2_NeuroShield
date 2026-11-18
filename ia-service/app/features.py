"""Convierte el historial de un usuario en la matriz que recibe la red."""
from __future__ import annotations

import numpy as np

from .config import DIFICULTADES, MAX_PASOS, NUM_CARACTERISTICAS, RESULTADOS, VECTORES


def fila_desde_interaccion(interaccion: dict) -> np.ndarray:
    """Una interacción (simulación o pregunta de quiz) -> vector de 9 características."""
    fila = np.zeros(NUM_CARACTERISTICAS, dtype=np.float32)

    vector = interaccion.get("vector")
    if vector in VECTORES:
        fila[VECTORES.index(vector)] = 1.0

    fila[4] = DIFICULTADES.get(interaccion.get("dificultad"), 0.0)
    fila[5] = RESULTADOS.get(interaccion.get("resultado"), 0.5)

    es_quiz = interaccion.get("tipo") == "quiz"
    tiempo = interaccion.get("tiempo_respuesta")
    limite = interaccion.get("tiempo_limite")
    if es_quiz or tiempo is None or not limite:
        fila[6] = 0.5  # sin medición de tiempo: valor neutro
    else:
        fila[6] = float(np.clip(tiempo / limite, 0.0, 1.0))

    fila[7] = 1.0 if es_quiz else 0.0
    fila[8] = 1.0
    return fila


def matriz_desde_interacciones(interacciones: list[dict]) -> np.ndarray:
    """Historial en orden cronológico -> matriz (MAX_PASOS, 9).

    Se conservan las interacciones más recientes y se alinean al final;
    las filas iniciales sobrantes quedan en cero (relleno).
    """
    matriz = np.zeros((MAX_PASOS, NUM_CARACTERISTICAS), dtype=np.float32)
    recientes = interacciones[-MAX_PASOS:]
    inicio = MAX_PASOS - len(recientes)
    for i, interaccion in enumerate(recientes):
        matriz[inicio + i] = fila_desde_interaccion(interaccion)
    return matriz
