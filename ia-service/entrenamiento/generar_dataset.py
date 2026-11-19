"""Genera el conjunto de datos sintético con el que se entrena la red.

NeuroShield todavía no tiene suficientes usuarios reales para entrenar un
modelo, así que se simulan perfiles de usuario. Cada perfil tiene rasgos
ocultos y, a partir de ellos, se simula su historial de simulaciones y quizzes.
La red debe recuperar esos rasgos viendo solo el historial.

Rasgos ocultos de cada usuario simulado:
  - vulnerabilidad por vector (0 a 1)
  - impulsividad: qué tan rápido decide (0 a 1)
  - proactividad: qué tanto reporta las amenazas que detecta (0 a 1)
  - ritmo de aprendizaje y preferencia por ciertos vectores

Supuestos del simulador (documentados en el README):
  - A mayor vulnerabilidad en un vector, mayor probabilidad de caer o fallar.
  - Los escenarios más difíciles aumentan la probabilidad de fallo.
  - Responder con mucha prisa (menos del 30 % del tiempo) aumenta el fallo.
  - Quien no cae, reporta o solo ignora según su proactividad.
  - Cada práctica reduce un poco la vulnerabilidad en ese vector (aprendizaje),
    por eso el orden de las interacciones importa: lo reciente pesa más.

Salidas que aprende la red:
  1. Vulnerabilidad final por vector (regresión, 4 valores).
  2. Perfil de refuerzo (clasificación multietiqueta, 4 valores), ver REFUERZOS.

Uso:  python -m entrenamiento.generar_dataset
"""
from __future__ import annotations

import numpy as np

from app.config import MAX_PASOS, NUM_CARACTERISTICAS, REFUERZOS, VECTORES

NUM_VECTORES = len(VECTORES)

# Umbrales que definen cada perfil de refuerzo a partir de los rasgos ocultos.
UMBRAL_TEORIA = 0.60       # vulnerabilidad máxima de algún vector
UMBRAL_IMPULSIVO = 0.60    # impulsividad
UMBRAL_PASIVO = 0.45       # proactividad (por debajo: casi no reporta)
UMBRAL_AVANZAR = 0.35      # vulnerabilidad máxima (por debajo: domina lo básico)


def etiquetas_refuerzo(vulnerabilidad: np.ndarray, impulsividad: float, proactividad: float) -> np.ndarray:
    """Perfil de refuerzo verdadero, en el orden de REFUERZOS."""
    maxima = float(vulnerabilidad.max())
    valores = {
        "teoria": maxima >= UMBRAL_TEORIA,
        "presion": impulsividad >= UMBRAL_IMPULSIVO,
        "reportar": proactividad < UMBRAL_PASIVO,
        "avanzar": maxima < UMBRAL_AVANZAR,
    }
    return np.array([valores[r] for r in REFUERZOS], dtype=np.float32)


def simular_usuario(rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Devuelve (matriz de historial, vulnerabilidad final por vector, perfil de refuerzo)."""
    base = rng.beta(2.0, 2.0)
    vulnerabilidad = np.clip(base + rng.normal(0.0, 0.28, NUM_VECTORES), 0.03, 0.97)
    impulsividad = rng.uniform(0.0, 1.0)
    proactividad = rng.beta(2.0, 2.0)
    ritmo_aprendizaje = rng.uniform(0.02, 0.10)
    preferencia = rng.dirichlet(np.full(NUM_VECTORES, 1.2))

    pasos = int(rng.integers(3, MAX_PASOS + 1))
    matriz = np.zeros((MAX_PASOS, NUM_CARACTERISTICAS), dtype=np.float32)
    inicio = MAX_PASOS - pasos

    for i in range(pasos):
        v = int(rng.choice(NUM_VECTORES, p=preferencia))
        dificultad = float(rng.choice([0.0, 0.5, 1.0]))
        es_quiz = rng.random() < 0.45

        if es_quiz:
            tiempo = 0.5
            p_fallo = vulnerabilidad[v] + 0.20 * (dificultad - 0.5)
        else:
            # Los usuarios impulsivos responden más rápido.
            tiempo = float(np.clip(rng.beta(2.0, 2.0 + 3.0 * impulsividad) * 1.15, 0.02, 1.0))
            prisa = max(0.0, 0.30 - tiempo)
            p_fallo = vulnerabilidad[v] + 0.20 * (dificultad - 0.5) + 0.9 * prisa
        p_fallo = float(np.clip(p_fallo, 0.02, 0.98))

        if not es_quiz and tiempo >= 1.0:
            resultado = 0.5  # se agotó el tiempo
        elif rng.random() < p_fallo:
            resultado = 1.0  # cayó en la trampa o respondió mal
        elif es_quiz:
            resultado = 0.0
        else:
            # Quien no cae reporta según su proactividad; si no, solo ignora.
            p_reportar = proactividad * (1.0 - 0.5 * vulnerabilidad[v])
            resultado = 0.0 if rng.random() < p_reportar else 0.5

        fila = matriz[inicio + i]
        fila[v] = 1.0
        fila[4] = dificultad
        fila[5] = resultado
        fila[6] = tiempo
        fila[7] = 1.0 if es_quiz else 0.0
        fila[8] = 1.0

        # Aprendizaje: practicar reduce la vulnerabilidad (más si se acertó).
        factor = 1.0 if resultado < 1.0 else 0.5
        vulnerabilidad[v] = max(0.03, vulnerabilidad[v] - ritmo_aprendizaje * factor * vulnerabilidad[v])

    vulnerabilidad = vulnerabilidad.astype(np.float32)
    return matriz, vulnerabilidad, etiquetas_refuerzo(vulnerabilidad, impulsividad, proactividad)


def generar(n_usuarios: int, semilla: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rng = np.random.default_rng(semilla)
    x = np.zeros((n_usuarios, MAX_PASOS, NUM_CARACTERISTICAS), dtype=np.float32)
    y = np.zeros((n_usuarios, NUM_VECTORES), dtype=np.float32)
    z = np.zeros((n_usuarios, len(REFUERZOS)), dtype=np.float32)
    for i in range(n_usuarios):
        x[i], y[i], z[i] = simular_usuario(rng)
    return x, y, z


if __name__ == "__main__":
    x, y, z = generar(2000, semilla=1)
    np.set_printoptions(precision=2, suppress=True)
    print("Forma de la entrada:", x.shape, "| vulnerabilidad:", y.shape, "| refuerzo:", z.shape)
    print("Ejemplo de historial (últimas 5 interacciones):\n", x[0][-5:])
    print("Vulnerabilidad real por vector:", dict(zip(VECTORES, y[0])))
    print("Perfil de refuerzo real:", dict(zip(REFUERZOS, z[0])))
    print("Proporción de usuarios con cada perfil:", dict(zip(REFUERZOS, z.mean(axis=0).round(2))))
