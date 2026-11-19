"""Servicio de Inteligencia Artificial de NeuroShield (FastAPI).

Lo consume únicamente el backend (Express). Endpoints:
  GET  /health          estado del servicio y métricas del modelo
  POST /predict         historial de un usuario -> vulnerabilidad y recomendaciones
  POST /sugerir-curso   historiales de un grupo -> borrador de curso y examen
  POST /sugerir-mision  historiales de un grupo -> borrador de misión del simulador

Ejecución (desde la carpeta ia-service):
  uvicorn app.main:app --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .config import MAX_PASOS, VECTORES, VERSION_MODELO
from .predictor import Predictor
from .recomendador import (analisis_grupal, borrador_curso, borrador_mision,
                           recomendaciones_usuario, vectores_prioritarios)

estado: dict = {}


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    estado["predictor"] = Predictor()  # el modelo se carga una sola vez al iniciar
    yield
    estado.clear()


app = FastAPI(
    title="NeuroShield - Servicio de IA",
    description="Red neuronal convolucional que estima la vulnerabilidad de un usuario "
                "a partir de su historial de simulaciones y quizzes.",
    version=VERSION_MODELO,
    lifespan=ciclo_de_vida,
)


class Interaccion(BaseModel):
    tipo: Literal["simulacion", "quiz"]
    vector: Literal["Phishing", "Smishing", "Vishing", "Ing. Social"]
    dificultad: Optional[str] = "Básico"
    resultado: Literal["caer", "ignorar", "tiempo", "reportar", "correcta", "incorrecta"]
    tiempo_respuesta: Optional[float] = Field(None, ge=0, description="Segundos que tardó en decidir")
    tiempo_limite: Optional[float] = Field(None, gt=0, description="Segundos disponibles en la misión")


class SolicitudPrediccion(BaseModel):
    id_usuario: Optional[int] = None
    interacciones: list[Interaccion] = Field(..., description="Historial en orden cronológico")


class UsuarioGrupo(BaseModel):
    id_usuario: Optional[int] = None
    interacciones: list[Interaccion]


class SolicitudCurso(BaseModel):
    usuarios: list[UsuarioGrupo]
    vector: Optional[str] = Field(None, description="Forzar un vector; si se omite, se usa el más débil")


class SolicitudMision(SolicitudCurso):
    titulos_existentes: list[str] = Field(default_factory=list,
                                          description="Títulos de las misiones ya publicadas, para no repetirlas")


@app.get("/health")
def health():
    predictor: Predictor = estado["predictor"]
    return {
        "status": "OK",
        "servicio": "neuroshield-ia",
        "modelo": VERSION_MODELO,
        "arquitectura": "CNN 1D (Keras) con dos salidas: vulnerabilidad por vector y perfil de refuerzo",
        "entrada": {"pasos": MAX_PASOS, "vectores": VECTORES},
        "metricas": predictor.metricas.get("prueba", {}),
    }


@app.post("/predict")
def predict(solicitud: SolicitudPrediccion):
    if not solicitud.interacciones:
        raise HTTPException(status_code=422, detail="Se requiere al menos una interacción")

    predictor: Predictor = estado["predictor"]
    analisis = predictor.predecir([i.model_dump() for i in solicitud.interacciones])
    analisis["id_usuario"] = solicitud.id_usuario
    analisis["vectores_prioritarios"] = vectores_prioritarios(
        analisis["riesgo_por_vector"], analisis["vectores_sin_practica"])
    analisis["recomendaciones"] = recomendaciones_usuario(analisis)
    return analisis


@app.post("/sugerir-curso")
def sugerir_curso(solicitud: SolicitudCurso):
    historiales = [
        [i.model_dump() for i in u.interacciones] for u in solicitud.usuarios if u.interacciones
    ]
    if not historiales:
        raise HTTPException(status_code=422, detail="Ningún usuario tiene interacciones registradas")

    predictor: Predictor = estado["predictor"]
    grupal = analisis_grupal(predictor.predecir_lote(historiales))
    return {
        "modelo": VERSION_MODELO,
        "analisis_grupal": grupal,
        "borrador": borrador_curso(grupal, solicitud.vector),
    }


@app.post("/sugerir-mision")
def sugerir_mision(solicitud: SolicitudMision):
    historiales = [
        [i.model_dump() for i in u.interacciones] for u in solicitud.usuarios if u.interacciones
    ]
    if not historiales:
        raise HTTPException(status_code=422, detail="Ningún usuario tiene interacciones registradas")

    predictor: Predictor = estado["predictor"]
    grupal = analisis_grupal(predictor.predecir_lote(historiales))
    return {
        "modelo": VERSION_MODELO,
        "analisis_grupal": grupal,
        "borrador": borrador_mision(grupal, historiales, solicitud.vector, solicitud.titulos_existentes),
    }
