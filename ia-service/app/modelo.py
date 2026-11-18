"""Arquitectura de la red neuronal convolucional (1D) de NeuroShield."""
import keras
from keras import layers

from .config import MAX_PASOS, NUM_CARACTERISTICAS, VECTORES


def construir_modelo() -> keras.Model:
    """CNN 1D sobre la secuencia de interacciones del usuario.

    Entrada:  (20 interacciones, 9 características)
    Salida:   4 valores entre 0 y 1, la vulnerabilidad estimada por vector
              (Phishing, Smishing, Vishing, Ing. Social).

    Los filtros convolucionales recorren la secuencia en ventanas de 3 y 5
    interacciones, por lo que detectan patrones locales como "varios fallos
    seguidos en el mismo vector" o "respuestas muy rápidas que terminan en caída".
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
    salida = layers.Dense(len(VECTORES), activation="sigmoid", name="vulnerabilidad_por_vector")(x)

    modelo = keras.Model(entrada, salida, name="neuroshield_cnn1d")
    modelo.compile(optimizer=keras.optimizers.Adam(1e-3), loss="mse", metrics=["mae"])
    return modelo
