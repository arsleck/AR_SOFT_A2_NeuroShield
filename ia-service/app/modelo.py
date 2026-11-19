"""Arquitectura de la red neuronal convolucional (1D) de NeuroShield."""
import keras
from keras import layers

from .config import MAX_PASOS, NUM_CARACTERISTICAS, REFUERZOS, VECTORES

SALIDA_VULNERABILIDAD = "vulnerabilidad_por_vector"
SALIDA_REFUERZO = "perfil_refuerzo"


def construir_modelo() -> keras.Model:
    """CNN 1D sobre la secuencia de interacciones del usuario, con dos salidas.

    Entrada:  (20 interacciones, 9 características)
    Salida 1: 4 valores entre 0 y 1, la vulnerabilidad estimada por vector
              (Phishing, Smishing, Vishing, Ing. Social). Regresión.
    Salida 2: 4 probabilidades, el tipo de refuerzo que necesita el usuario
              (teoría, entrenar bajo presión, reportar, subir de dificultad).
              Clasificación multietiqueta: puede necesitar varios a la vez.

    Las dos salidas comparten las capas convolucionales: los mismos filtros
    que detectan patrones en la secuencia sirven para ambos diagnósticos.
    """
    entrada = keras.Input(shape=(MAX_PASOS, NUM_CARACTERISTICAS), name="historial")

    x = layers.Conv1D(32, kernel_size=3, padding="same", activation="relu", name="conv_3")(entrada)
    x = layers.Conv1D(64, kernel_size=5, padding="same", activation="relu", name="conv_5")(x)
    x = layers.Conv1D(64, kernel_size=3, padding="same", activation="relu", name="conv_3b")(x)

    resumen = layers.Concatenate(name="resumen")([
        layers.GlobalAveragePooling1D(name="promedio")(x),
        layers.GlobalMaxPooling1D(name="maximo")(x),
    ])

    x = layers.Dense(64, activation="relu", name="densa")(resumen)
    x = layers.Dropout(0.2, name="dropout")(x)

    vulnerabilidad = layers.Dense(len(VECTORES), activation="sigmoid", name=SALIDA_VULNERABILIDAD)(x)
    refuerzo = layers.Dense(len(REFUERZOS), activation="sigmoid", name=SALIDA_REFUERZO)(x)

    modelo = keras.Model(entrada, {SALIDA_VULNERABILIDAD: vulnerabilidad, SALIDA_REFUERZO: refuerzo},
                         name="neuroshield_cnn1d")
    modelo.compile(
        optimizer=keras.optimizers.Adam(1e-3),
        loss={SALIDA_VULNERABILIDAD: "mse", SALIDA_REFUERZO: "binary_crossentropy"},
        loss_weights={SALIDA_VULNERABILIDAD: 1.0, SALIDA_REFUERZO: 0.5},
        metrics={SALIDA_VULNERABILIDAD: ["mae"], SALIDA_REFUERZO: [keras.metrics.BinaryAccuracy(name="exactitud")]},
    )
    return modelo
