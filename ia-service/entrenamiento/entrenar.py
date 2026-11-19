"""Entrena la red convolucional y guarda el modelo y sus métricas.

Uso (desde la carpeta ia-service):  python -m entrenamiento.entrenar
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

import keras
import numpy as np

from app.config import (DIR_MODELOS, REFUERZOS, RUTA_METRICAS, RUTA_MODELO, UMBRAL_ALTO,
                        UMBRAL_MEDIO, VECTORES, VERSION_MODELO)
from app.modelo import SALIDA_REFUERZO, SALIDA_VULNERABILIDAD, construir_modelo
from entrenamiento.generar_dataset import generar

N_ENTRENAMIENTO = 40_000
N_VALIDACION = 5_000
N_PRUEBA = 5_000


def clase(puntajes: np.ndarray) -> np.ndarray:
    """0 Bajo, 1 Medio, 2 Alto, según el puntaje global 0-100."""
    return np.digitize(puntajes, [UMBRAL_MEDIO, UMBRAL_ALTO])


def tasa_fallos_por_vector(x: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Tasa de fallos por vector y si el vector tiene datos."""
    tasa = np.full((x.shape[0], len(VECTORES)), 0.5, dtype=np.float32)
    con_datos = np.zeros_like(tasa, dtype=bool)
    for v in range(len(VECTORES)):
        usados = x[:, :, v]
        total = usados.sum(axis=1)
        fallos = (usados * (x[:, :, 5] == 1.0)).sum(axis=1)
        hay = total > 0
        tasa[hay, v] = fallos[hay] / total[hay]
        con_datos[:, v] = hay
    return tasa, con_datos


def linea_base_vulnerabilidad(x: np.ndarray) -> np.ndarray:
    """Regla simple de referencia: tasa de fallos por vector (0.5 si no hay datos)."""
    return tasa_fallos_por_vector(x)[0]


def puntajes_reglas_refuerzo(x: np.ndarray) -> np.ndarray:
    """Puntaje continuo de cada regla simple (sin red neuronal), en el orden de REFUERZOS.

    teoría: tasa de fallos del peor vector · presión: rapidez media en simulaciones ·
    reportar: proporción de veces que solo ignoró en lugar de reportar · avanzar: dominio del peor vector.
    """
    tasa, con_datos = tasa_fallos_por_vector(x)
    maxima = np.where(con_datos, tasa, 0.0).max(axis=1)
    alguna = con_datos.any(axis=1)

    simulacion = (x[:, :, 8] == 1) & (x[:, :, 7] == 0)
    n_sim = simulacion.sum(axis=1)
    tiempo_medio = np.where(n_sim > 0, (x[:, :, 6] * simulacion).sum(axis=1) / np.maximum(n_sim, 1), 1.0)

    no_cayo = simulacion & (x[:, :, 5] < 1.0)
    reporto = no_cayo & (x[:, :, 5] == 0.0)
    n_no_cayo = no_cayo.sum(axis=1)
    tasa_reporte = np.where(n_no_cayo > 0, reporto.sum(axis=1) / np.maximum(n_no_cayo, 1), 1.0)

    puntajes = {
        "teoria": maxima,
        "presion": 1.0 - tiempo_medio,
        "reportar": 1.0 - tasa_reporte,
        "avanzar": np.where(alguna, 1.0 - maxima, 0.0),
    }
    return np.stack([puntajes[r] for r in REFUERZOS], axis=1).astype(np.float32)


def umbrales_optimos(real: np.ndarray, puntajes: np.ndarray) -> list[float]:
    """Umbral por perfil que maximiza el F1 en validación (mismo método para la red y las reglas)."""
    candidatos = np.round(np.arange(0.05, 0.96, 0.01), 2)
    umbrales = []
    for i in range(real.shape[1]):
        f1s = [metricas_binarias(real[:, i], (puntajes[:, i] >= u).astype(np.float32))["f1"] for u in candidatos]
        umbrales.append(float(candidatos[int(np.argmax(f1s))]))
    return umbrales


def metricas_binarias(real: np.ndarray, estimado: np.ndarray) -> dict:
    vp = float(((estimado == 1) & (real == 1)).sum())
    fp = float(((estimado == 1) & (real == 0)).sum())
    fn = float(((estimado == 0) & (real == 1)).sum())
    precision = vp / (vp + fp) if vp + fp else 0.0
    exhaustividad = vp / (vp + fn) if vp + fn else 0.0
    f1 = 2 * precision * exhaustividad / (precision + exhaustividad) if precision + exhaustividad else 0.0
    return {
        "precision": round(precision, 3),
        "exhaustividad": round(exhaustividad, 3),
        "f1": round(f1, 3),
        "exactitud": round(float((estimado == real).mean()), 3),
        "casos_positivos": int(real.sum()),
    }


def main() -> None:
    keras.utils.set_random_seed(42)

    x_ent, y_ent, z_ent = generar(N_ENTRENAMIENTO, semilla=1)
    x_val, y_val, z_val = generar(N_VALIDACION, semilla=2)
    x_pru, y_pru, z_pru = generar(N_PRUEBA, semilla=3)

    modelo = construir_modelo()
    modelo.summary()

    historia = modelo.fit(
        x_ent, {SALIDA_VULNERABILIDAD: y_ent, SALIDA_REFUERZO: z_ent},
        validation_data=(x_val, {SALIDA_VULNERABILIDAD: y_val, SALIDA_REFUERZO: z_val}),
        epochs=40,
        batch_size=128,
        verbose=2,
        callbacks=[
            keras.callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
            keras.callbacks.ReduceLROnPlateau(monitor="val_loss", patience=2, factor=0.5),
        ],
    )

    # Umbrales por perfil ajustados en VALIDACIÓN (nunca en prueba), igual para la red y las reglas.
    umbrales_red = umbrales_optimos(z_val, modelo.predict(x_val, verbose=0)[SALIDA_REFUERZO])
    umbrales_reglas = umbrales_optimos(z_val, puntajes_reglas_refuerzo(x_val))

    salida = modelo.predict(x_pru, verbose=0)
    pred = salida[SALIDA_VULNERABILIDAD]
    refuerzo = (salida[SALIDA_REFUERZO] >= np.array(umbrales_red)).astype(np.float32)
    base = linea_base_vulnerabilidad(x_pru)
    base_refuerzo = (puntajes_reglas_refuerzo(x_pru) >= np.array(umbrales_reglas)).astype(np.float32)

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
        "umbrales_refuerzo": dict(zip(REFUERZOS, umbrales_red)),
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
            "perfil_refuerzo": {
                r: metricas_binarias(z_pru[:, i], refuerzo[:, i]) for i, r in enumerate(REFUERZOS)
            },
        },
        "linea_base_reglas": {
            "mae_por_vector_puntos": round(float(np.abs(base - y_pru).mean() * 100), 2),
            "mae_puntaje_global_puntos": round(float(np.abs(global_base - global_real).mean()), 2),
            "exactitud_nivel": round(float((clase(global_base) == clase(global_real)).mean()), 4),
            "umbrales_refuerzo": dict(zip(REFUERZOS, umbrales_reglas)),
            "perfil_refuerzo": {
                r: metricas_binarias(z_pru[:, i], base_refuerzo[:, i]) for i, r in enumerate(REFUERZOS)
            },
        },
    }

    DIR_MODELOS.mkdir(exist_ok=True)
    modelo.save(RUTA_MODELO)
    RUTA_METRICAS.write_text(json.dumps(metricas, indent=2, ensure_ascii=False), encoding="utf-8")

    print("\nModelo guardado en", RUTA_MODELO)
    print(json.dumps(metricas["prueba"], indent=2, ensure_ascii=False))
    print("Línea base:", json.dumps(metricas["linea_base_reglas"], ensure_ascii=False))


if __name__ == "__main__":
    main()
