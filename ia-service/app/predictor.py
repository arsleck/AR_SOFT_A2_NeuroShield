"""Carga el modelo entrenado y produce el análisis de vulnerabilidad."""
from __future__ import annotations

import json

import keras
import numpy as np

from .config import (RUTA_METRICAS, RUTA_MODELO, VECTORES, VERSION_MODELO,
                     nivel_desde_puntaje)
from .features import matriz_desde_interacciones


class Predictor:
    def __init__(self) -> None:
        if not RUTA_MODELO.exists():
            raise FileNotFoundError(
                f"No existe {RUTA_MODELO}. Ejecuta: python -m entrenamiento.entrenar"
            )
        self.modelo = keras.models.load_model(RUTA_MODELO)
        self.metricas = (
            json.loads(RUTA_METRICAS.read_text(encoding="utf-8")) if RUTA_METRICAS.exists() else {}
        )

    def predecir_lote(self, historiales: list[list[dict]]) -> list[dict]:
        """Un análisis por cada historial recibido (una sola pasada por la red)."""
        if not historiales:
            return []
        lote = np.stack([matriz_desde_interacciones(h) for h in historiales])
        salidas = self.modelo.predict(lote, verbose=0)

        analisis = []
        for historial, salida in zip(historiales, salidas):
            por_vector = {v: int(round(float(p) * 100)) for v, p in zip(VECTORES, salida)}
            puntaje = int(round(sum(por_vector.values()) / len(por_vector)))
            practicados = {i.get("vector") for i in historial}
            analisis.append({
                "puntaje": puntaje,
                "nivel": nivel_desde_puntaje(puntaje),
                "riesgo_por_vector": por_vector,
                "vectores_sin_practica": [v for v in VECTORES if v not in practicados],
                "interacciones_analizadas": min(len(historial), lote.shape[1]),
                "modelo": VERSION_MODELO,
            })
        return analisis

    def predecir(self, historial: list[dict]) -> dict:
        return self.predecir_lote([historial])[0]
