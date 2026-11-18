"""Genera el conjunto de datos sintético con el que se entrena la red.

NeuroShield todavía no tiene suficientes usuarios reales para entrenar un
modelo, así que se simulan perfiles de usuario. Cada perfil tiene una
vulnerabilidad "real" oculta por vector (entre 0 y 1) y, a partir de ella, se
simula su historial de simulaciones y quizzes. La red debe aprender a
recuperar esa vulnerabilidad oculta viendo solo el historial.

Supuestos del simulador (documentados en el README):
  - A mayor vulnerabilidad en un vector, mayor probabilidad de caer o fallar.
  - Los escenarios más difíciles aumentan la probabilidad de fallo.
  - Responder con mucha prisa (menos del 30 % del tiempo) aumenta el fallo.
  - Cada práctica reduce un poco la vulnerabilidad en ese vector (aprendizaje),
    por eso el orden de las interacciones importa: lo reciente pesa más.

Uso:  python -m entrenamiento.generar_dataset
"""
from __future__ import annotations

import numpy as np

from app.config import MAX_PASOS, NUM_CARACTERISTICAS, VECTORES

NUM_VECTORES = len(VECTORES)


def simular_usuario(rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    """Devuelve (matriz de historial, vulnerabilidad final por vector)."""
    base = rng.beta(2.0, 2.0)
    vulnerabilidad = np.clip(base + rng.normal(0.0, 0.28, NUM_VECTORES), 0.03, 0.97)
    impulsividad = rng.uniform(0.0, 1.0)
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
            # Quien domina el vector suele reportar; el resto solo ignora.
            resultado = 0.0 if rng.random() < 0.9 - 0.6 * vulnerabilidad[v] else 0.5

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

    return matriz, vulnerabilidad.astype(np.float32)


def generar(n_usuarios: int, semilla: int) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(semilla)
    x = np.zeros((n_usuarios, MAX_PASOS, NUM_CARACTERISTICAS), dtype=np.float32)
    y = np.zeros((n_usuarios, NUM_VECTORES), dtype=np.float32)
    for i in range(n_usuarios):
        x[i], y[i] = simular_usuario(rng)
    return x, y


if __name__ == "__main__":
    x, y = generar(5, semilla=1)
    np.set_printoptions(precision=2, suppress=True)
    print("Forma de la entrada:", x.shape, "| forma de la salida:", y.shape)
    print("Ejemplo de historial (últimas 5 interacciones):\n", x[0][-5:])
    print("Vulnerabilidad real por vector:", dict(zip(VECTORES, y[0])))
