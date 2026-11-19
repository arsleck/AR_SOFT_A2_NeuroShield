"""Carga el modelo entrenado y produce el análisis de vulnerabilidad."""
from __future__ import annotations

import json

import keras
import numpy as np

from .config import (REFUERZOS, RUTA_METRICAS, RUTA_MODELO, UMBRAL_REFUERZO, VECTORES,
                     VERSION_MODELO, nivel_desde_puntaje)
from .features import matriz_desde_interacciones
from .modelo import SALIDA_REFUERZO, SALIDA_VULNERABILIDAD


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
        # Umbral de decisión de cada perfil, ajustado en validación durante el entrenamiento.
        guardados = self.metricas.get("umbrales_refuerzo", {})
        self.umbrales = {r: float(guardados.get(r, UMBRAL_REFUERZO)) for r in REFUERZOS}

    def confianza(self, refuerzo: str, probabilidad: float) -> str:
        """Qué tan por encima del umbral está la probabilidad: alta o media."""
        return "alta" if probabilidad >= self.umbrales[refuerzo] + 0.25 else "media"

    def predecir_lote(self, historiales: list[list[dict]]) -> list[dict]:
        """Un análisis por cada historial recibido (una sola pasada por la red)."""
        if not historiales:
            return []
        lote = np.stack([matriz_desde_interacciones(h) for h in historiales])
        salidas = self.modelo.predict(lote, verbose=0)

        analisis = []
        for i, historial in enumerate(historiales):
            por_vector = {v: int(round(float(p) * 100))
                          for v, p in zip(VECTORES, salidas[SALIDA_VULNERABILIDAD][i])}
            perfil = {r: round(float(p), 3) for r, p in zip(REFUERZOS, salidas[SALIDA_REFUERZO][i])}
            activos = sorted(
                (r for r in REFUERZOS if perfil[r] >= self.umbrales[r]),
                key=lambda r: perfil[r] - self.umbrales[r], reverse=True,
            )
            puntaje = int(round(sum(por_vector.values()) / len(por_vector)))
            practicados = {x.get("vector") for x in historial}
            analisis.append({
                "puntaje": puntaje,
                "nivel": nivel_desde_puntaje(puntaje),
                "riesgo_por_vector": por_vector,
                "perfil_refuerzo": perfil,
                "refuerzos": [{"tipo": r, "probabilidad": perfil[r], "confianza": self.confianza(r, perfil[r])}
                              for r in activos],
                "vectores_sin_practica": [v for v in VECTORES if v not in practicados],
                "interacciones_analizadas": min(len(historial), lote.shape[1]),
                "modelo": VERSION_MODELO,
            })
        return analisis

    def predecir(self, historial: list[dict]) -> dict:
        return self.predecir_lote([historial])[0]
