"""Entrena la red convolucional y guarda el modelo y sus métricas.

Uso (desde la carpeta ia-service):  python -m entrenamiento.entrenar
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

import keras
import numpy as np

from app.config import (DIR_MODELOS, RUTA_METRICAS, RUTA_MODELO, UMBRAL_ALTO,
                        UMBRAL_MEDIO, VECTORES, VERSION_MODELO)
from app.modelo import construir_modelo
from entrenamiento.generar_dataset import generar

N_ENTRENAMIENTO = 40_000
N_VALIDACION = 5_000
N_PRUEBA = 5_000


def clase(puntajes: np.ndarray) -> np.ndarray:
    """0 Bajo, 1 Medio, 2 Alto, según el puntaje global 0-100."""
    return np.digitize(puntajes, [UMBRAL_MEDIO, UMBRAL_ALTO])


def linea_base(x: np.ndarray) -> np.ndarray:
    """Regla simple de referencia: tasa de fallos por vector (0.5 si no hay datos)."""
    pred = np.full((x.shape[0], len(VECTORES)), 0.5, dtype=np.float32)
    for v in range(len(VECTORES)):
        usados = x[:, :, v]
        total = usados.sum(axis=1)
        fallos = (usados * x[:, :, 5]).sum(axis=1)
        con_datos = total > 0
        pred[con_datos, v] = fallos[con_datos] / total[con_datos]
    return pred


def main() -> None:
    keras.utils.set_random_seed(42)

    x_ent, y_ent = generar(N_ENTRENAMIENTO, semilla=1)
    x_val, y_val = generar(N_VALIDACION, semilla=2)
    x_pru, y_pru = generar(N_PRUEBA, semilla=3)

    modelo = construir_modelo()
    modelo.summary()

    historia = modelo.fit(
        x_ent, y_ent,
        validation_data=(x_val, y_val),
        epochs=40,
        batch_size=128,
        verbose=2,
        callbacks=[
            keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.5),
        ],
    )

    pred = modelo.predict(x_pru, verbose=0)
    base = linea_base(x_pru)

    global_real = y_pru.mean(axis=1) * 100
    global_pred = pred.mean(axis=1) * 100
    global_base = base.mean(axis=1) * 100

    matriz_confusion = np.zeros((3, 3), dtype=int)
    for real, estimada in zip(clase(global_real), clase(global_pred)):
        matriz_confusion[real, estimada] += 1

    metricas = {
        "version_modelo": VERSION_MODELO,
        "fecha_entrenamiento": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "datos": {
            "origen": "sintético (entrenamiento/generar_dataset.py)",
            "entrenamiento": N_ENTRENAMIENTO,
            "validacion": N_VALIDACION,
            "prueba": N_PRUEBA,
        },
        "epocas_ejecutadas": len(historia.history["loss"]),
        "parametros": int(modelo.count_params()),
        "prueba": {
            "mae_por_vector_puntos": {
                v: round(float(np.abs(pred[:, i] - y_pru[:, i]).mean() * 100), 2)
                for i, v in enumerate(VECTORES)
            },
            "mae_puntaje_global_puntos": round(float(np.abs(global_pred - global_real).mean()), 2),
            "exactitud_nivel": round(float((clase(global_pred) == clase(global_real)).mean()), 4),
            "matriz_confusion_nivel": {
                "orden": ["Bajo", "Medio", "Alto"],
                "filas_real_columnas_estimado": matriz_confusion.tolist(),
            },
        },
        "linea_base_tasa_de_fallos": {
            "mae_por_vector_puntos": round(float(np.abs(base - y_pru).mean() * 100), 2),
            "mae_puntaje_global_puntos": round(float(np.abs(global_base - global_real).mean()), 2),
            "exactitud_nivel": round(float((clase(global_base) == clase(global_real)).mean()), 4),
        },
    }

    DIR_MODELOS.mkdir(exist_ok=True)
    modelo.save(RUTA_MODELO)
    RUTA_METRICAS.write_text(json.dumps(metricas, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\nModelo guardado en", RUTA_MODELO)
    print(json.dumps(metricas["prueba"], indent=2, ensure_ascii=False))
    print("Línea base:", json.dumps(metricas["linea_base_tasa_de_fallos"], ensure_ascii=False))


if __name__ == "__main__":
    main()
