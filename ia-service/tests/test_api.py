"""Pruebas del servicio de IA.  Uso (desde ia-service):  python -m pytest -q"""
import pytest
from fastapi.testclient import TestClient

from app.config import MAX_PASOS, NUM_CARACTERISTICAS, VECTORES
from app.features import matriz_desde_interacciones
from app.main import app


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:  # el bloque with dispara la carga del modelo
        yield c


def historial(resultado_sim, resultado_quiz, tiempo, n=3):
    """n rondas en las que el usuario practica los cuatro vectores."""
    interacciones = []
    for _ in range(n):
        for vector in VECTORES:
            interacciones.append({"tipo": "simulacion", "vector": vector, "dificultad": "Intermedio",
                                  "resultado": resultado_sim, "tiempo_respuesta": tiempo, "tiempo_limite": 120})
            interacciones.append({"tipo": "quiz", "vector": vector, "dificultad": "Básico",
                                  "resultado": resultado_quiz})
    return interacciones


def test_matriz_de_entrada():
    matriz = matriz_desde_interacciones(historial("caer", "incorrecta", 10, n=1))
    assert matriz.shape == (MAX_PASOS, NUM_CARACTERISTICAS)
    assert matriz[:, 8].sum() == 8          # 8 filas válidas
    assert matriz[0].sum() == 0             # el relleno va al inicio
    assert matriz[-1, 7] == 1 and matriz[-1, 5] == 1  # última fila: quiz fallado


def test_health(cliente):
    datos = cliente.get("/health").json()
    assert datos["status"] == "OK" and datos["modelo"]


def test_usuario_vulnerable_vs_usuario_seguro(cliente):
    vulnerable = cliente.post("/predict", json={"id_usuario": 1,
                              "interacciones": historial("caer", "incorrecta", 8)}).json()
    seguro = cliente.post("/predict", json={"id_usuario": 2,
                          "interacciones": historial("reportar", "correcta", 70)}).json()

    assert set(vulnerable["riesgo_por_vector"]) == set(VECTORES)
    assert vulnerable["puntaje"] > seguro["puntaje"] + 30
    assert vulnerable["nivel"] == "Alto" and seguro["nivel"] == "Bajo"
    assert vulnerable["recomendaciones"] and seguro["recomendaciones"]


def test_detecta_el_vector_debil(cliente):
    interacciones = []
    for _ in range(4):
        interacciones.append({"tipo": "simulacion", "vector": "Vishing", "dificultad": "Básico",
                              "resultado": "caer", "tiempo_respuesta": 10, "tiempo_limite": 120})
        for vector in ("Phishing", "Smishing", "Ing. Social"):
            interacciones.append({"tipo": "simulacion", "vector": vector, "dificultad": "Básico",
                                  "resultado": "reportar", "tiempo_respuesta": 60, "tiempo_limite": 120})
    datos = cliente.post("/predict", json={"interacciones": interacciones}).json()
    assert datos["vectores_prioritarios"][0] == "Vishing"
    assert max(datos["riesgo_por_vector"], key=datos["riesgo_por_vector"].get) == "Vishing"


def test_predict_sin_interacciones(cliente):
    assert cliente.post("/predict", json={"interacciones": []}).status_code == 422


def test_sugerir_curso(cliente):
    grupo = {"usuarios": [
        {"id_usuario": 1, "interacciones": historial("caer", "incorrecta", 8)},
        {"id_usuario": 2, "interacciones": historial("ignorar", "incorrecta", 30)},
        {"id_usuario": 3, "interacciones": []},  # sin datos: se omite
    ]}
    datos = cliente.post("/sugerir-curso", json=grupo).json()
    borrador = datos["borrador"]

    assert datos["analisis_grupal"]["usuarios_analizados"] == 2
    assert borrador["categoria"] == datos["analisis_grupal"]["vector_prioritario"]
    assert borrador["titulo"] and borrador["materiales"]
    assert len(borrador["quizzes"]) == 4
    for quiz in borrador["quizzes"]:
        assert len(quiz["opciones"]) == 3
        assert sum(o["es_correcta"] for o in quiz["opciones"]) == 1


def test_sugerir_curso_vector_forzado(cliente):
    datos = cliente.post("/sugerir-curso", json={"vector": "Smishing", "usuarios": [
        {"interacciones": historial("reportar", "correcta", 70)}]}).json()
    assert datos["borrador"]["categoria"] == "Smishing"
    assert datos["borrador"]["nivel"] == "Avanzado"


def test_no_prioriza_vectores_sin_historial(cliente):
    datos = cliente.post("/predict", json={"interacciones": [
        {"tipo": "simulacion", "vector": "Phishing", "dificultad": "Básico",
         "resultado": "caer", "tiempo_respuesta": 15, "tiempo_limite": 150}]}).json()
    assert datos["vectores_prioritarios"] == ["Phishing"]
    assert set(datos["vectores_sin_practica"]) == {"Smishing", "Vishing", "Ing. Social"}


CAMPOS_MISION = ["titulo", "vector", "dificultad", "tiempo_limite", "descripcion_corta", "remitente_nombre",
                 "remitente_identificador", "asunto_o_contexto", "contenido_principal",
                 "texto_boton_trampa", "url_trampa", "pistas_forenses"]


def test_plantillas_de_mision_completas():
    from app.plantillas_misiones import MISIONES
    for vector in VECTORES:
        assert sorted(m["dificultad"] for m in MISIONES[vector]) == ["Avanzado", "Básico", "Intermedio"]
        for m in MISIONES[vector]:
            assert all(m.get(c) for c in CAMPOS_MISION if c != "vector")
            assert len(m["pistas_forenses"]) == 3


def test_sugerir_mision_grupo_vulnerable(cliente):
    datos = cliente.post("/sugerir-mision", json={"usuarios": [
        {"interacciones": historial("caer", "incorrecta", 8)}]}).json()
    borrador = datos["borrador"]
    assert all(borrador.get(c) for c in CAMPOS_MISION)
    assert borrador["vector"] == datos["analisis_grupal"]["vector_prioritario"]
    assert borrador["dificultad"] == "Básico"           # riesgo alto -> escenario evidente
    assert borrador["patron_tiempo"]["proporcion_prisa"] == 1.0
    assert borrador["tiempo_limite"] < 150              # cayó con prisa -> menos tiempo
    assert borrador["origen"] == "Servicio IA"


def test_sugerir_mision_no_repite_escenarios(cliente):
    from app.plantillas_misiones import MISIONES
    titulos = [m["titulo"] for m in MISIONES["Vishing"] if m["dificultad"] == "Avanzado"]
    datos = cliente.post("/sugerir-mision", json={"vector": "Vishing", "titulos_existentes": titulos,
                         "usuarios": [{"interacciones": historial("reportar", "correcta", 70)}]}).json()
    borrador = datos["borrador"]
    assert borrador["dificultad_recomendada"] == "Avanzado"
    assert borrador["titulo"] not in titulos and borrador["vector"] == "Vishing"
    assert borrador["patron_tiempo"]["caidas_con_tiempo"] == 0


def simulaciones(resultado, tiempo, rondas=3):
    return [{"tipo": "simulacion", "vector": v, "dificultad": "Intermedio", "resultado": resultado,
             "tiempo_respuesta": tiempo, "tiempo_limite": 120} for _ in range(rondas) for v in VECTORES]


def tipos(datos):
    return [r["tipo"] for r in datos["refuerzos"]]


def test_perfil_refuerzo_en_la_respuesta(cliente):
    from app.config import REFUERZOS
    datos = cliente.post("/predict", json={"interacciones": simulaciones("caer", 10)}).json()
    assert set(datos["perfil_refuerzo"]) == set(REFUERZOS)
    assert all(0 <= p <= 1 for p in datos["perfil_refuerzo"].values())
    for r in datos["refuerzos"]:
        assert r["confianza"] in ("alta", "media")


def test_red_detecta_impulsividad_y_falta_de_teoria(cliente):
    datos = cliente.post("/predict", json={"interacciones": simulaciones("caer", 10)}).json()
    assert {"presion", "teoria"} <= set(tipos(datos))
    assert "avanzar" not in tipos(datos)
    textos = [r for r in datos["recomendaciones"] if r.get("origen") == "red_neuronal"]
    assert {r["tipo"] for r in textos} == set(tipos(datos))


def test_red_detecta_que_no_reporta(cliente):
    datos = cliente.post("/predict", json={"interacciones": simulaciones("ignorar", 70)}).json()
    assert "reportar" in tipos(datos)
    assert "presion" not in tipos(datos)


def test_red_sugiere_avanzar_a_quien_domina(cliente):
    interacciones = simulaciones("reportar", 70) + [
        {"tipo": "quiz", "vector": v, "dificultad": "Avanzado", "resultado": "correcta"} for v in VECTORES]
    datos = cliente.post("/predict", json={"interacciones": interacciones}).json()
    assert tipos(datos) == ["avanzar"]
