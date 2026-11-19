"""Traduce la salida de la red en recomendaciones y borradores de curso."""
from __future__ import annotations

from .config import UMBRAL_ALTO, UMBRAL_MEDIO, VECTORES
from .plantillas import PLANTILLAS

NOMBRES = {
    "Phishing": "phishing (correo)",
    "Smishing": "smishing (SMS)",
    "Vishing": "vishing (llamadas)",
    "Ing. Social": "ingeniería social",
}


def vectores_prioritarios(riesgo_por_vector: dict[str, int],
                          sin_practica: list[str] | None = None) -> list[str]:
    """Vectores a reforzar, del más débil al menos débil.

    Solo se priorizan vectores en los que el usuario ya tiene historial: en los
    demás la estimación es una suposición y se le pide practicar primero.
    """
    con_datos = [v for v in riesgo_por_vector if v not in (sin_practica or [])] or list(riesgo_por_vector)
    ordenados = sorted(con_datos, key=riesgo_por_vector.get, reverse=True)
    criticos = [v for v in ordenados if riesgo_por_vector[v] >= UMBRAL_MEDIO]
    return criticos or ordenados[:1]


# Texto de cada perfil de refuerzo que decide la red (segunda salida del modelo).
TEXTOS_REFUERZO = {
    "teoria": {
        "icono": "fa-book-open", "color": "text-danger", "titulo": "Refuerzo teórico",
        "texto": "Repasa la teoría de {vector}: tu riesgo estimado es {riesgo}%. Completa su curso y repite "
                 "el examen antes de volver al simulador.",
    },
    "presion": {
        "icono": "fa-stopwatch", "color": "text-warning", "titulo": "Entrenar bajo presión",
        "texto": "Tus decisiones muestran un patrón de respuestas apresuradas. Antes de actuar, revisa el "
                 "remitente y el destino del enlace; practica una misión de {vector} con tiempo límite.",
    },
    "reportar": {
        "icono": "fa-bullhorn", "color": "text-primary", "titulo": "Pasar de ignorar a reportar",
        "texto": "Casi nunca reportas los intentos de engaño. Cuando identifiques una amenaza de {vector}, "
                 "usa \"Reportar\" en lugar de ignorarla: reportar protege a los demás.",
    },
    "avanzar": {
        "icono": "fa-arrow-trend-up", "color": "text-success", "titulo": "Subir de dificultad",
        "texto": "Dominas los escenarios básicos. Pasa a misiones de dificultad Avanzado para seguir mejorando.",
    },
}


def recomendaciones_usuario(analisis: dict) -> list[dict]:
    """Recomendaciones en el formato que ya pinta el perfil: icono, color y texto.

    El nivel y el vector salen de la primera salida de la red (vulnerabilidad);
    el tipo de refuerzo, de la segunda (perfil de refuerzo). Las reglas solo
    redactan el texto y avisan de los vectores sin práctica, que es un dato observado.
    """
    riesgo = analisis["riesgo_por_vector"]
    prioritarios = vectores_prioritarios(riesgo, analisis.get("vectores_sin_practica"))
    peor = prioritarios[0]
    recomendaciones = []

    if analisis["nivel"] == "Alto":
        recomendaciones.append({
            "icono": "fa-triangle-exclamation", "color": "text-danger",
            "texto": f"La red neuronal estima una vulnerabilidad alta ({analisis['puntaje']}%). "
                     f"Tu punto más débil es {NOMBRES[peor]} ({riesgo[peor]}%).",
        })
    elif analisis["nivel"] == "Medio":
        recomendaciones.append({
            "icono": "fa-shield-halved", "color": "text-warning",
            "texto": f"Vulnerabilidad moderada ({analisis['puntaje']}%). "
                     f"Refuerza {NOMBRES[peor]}, donde tu riesgo estimado es {riesgo[peor]}%.",
        })
    else:
        recomendaciones.append({
            "icono": "fa-circle-check", "color": "text-success",
            "texto": f"Vulnerabilidad baja ({analisis['puntaje']}%). Mantén la práctica; "
                     f"tu vector con más margen de mejora es {NOMBRES[peor]} ({riesgo[peor]}%).",
        })

    for refuerzo in analisis.get("refuerzos", []):
        plantilla = TEXTOS_REFUERZO[refuerzo["tipo"]]
        recomendaciones.append({
            "icono": plantilla["icono"], "color": plantilla["color"],
            "texto": plantilla["texto"].format(vector=NOMBRES[peor], riesgo=riesgo[peor]),
            "tipo": refuerzo["tipo"], "titulo": plantilla["titulo"],
            "origen": "red_neuronal", "confianza": refuerzo["confianza"],
            "probabilidad": refuerzo["probabilidad"],
        })

    # Si la red no activó ningún perfil, se sugiere practicar los vectores prioritarios.
    if not analisis.get("refuerzos"):
        for vector in prioritarios[:2]:
            if riesgo[vector] >= UMBRAL_MEDIO:
                recomendaciones.append({
                    "icono": "fa-crosshairs", "color": "text-primary",
                    "texto": f"Practica una misión de {NOMBRES[vector]} para consolidar lo aprendido.",
                })

    sin_practica = analisis.get("vectores_sin_practica", [])
    if sin_practica:
        lista = ", ".join(NOMBRES[v] for v in sin_practica)
        recomendaciones.append({
            "icono": "fa-compass", "color": "text-primary",
            "texto": f"Aún no hay datos tuyos en: {lista}. Completa una misión o un quiz "
                     f"de esos temas para afinar la estimación.",
        })
    return recomendaciones


def analisis_grupal(analisis_usuarios: list[dict]) -> dict:
    """Promedia los análisis individuales de un grupo de usuarios."""
    n = len(analisis_usuarios)
    promedio = {
        v: int(round(sum(a["riesgo_por_vector"][v] for a in analisis_usuarios) / n))
        for v in VECTORES
    }
    puntaje = int(round(sum(a["puntaje"] for a in analisis_usuarios) / n))
    return {
        "usuarios_analizados": n,
        "puntaje_promedio": puntaje,
        "riesgo_promedio_por_vector": promedio,
        "usuarios_por_nivel": {
            nivel: sum(1 for a in analisis_usuarios if a["nivel"] == nivel)
            for nivel in ("Bajo", "Medio", "Alto")
        },
        "vector_prioritario": max(promedio, key=promedio.get),
    }


def borrador_curso(grupal: dict, vector: str | None = None) -> dict:
    """Arma un borrador de curso y examen para el vector más débil del grupo.

    El texto proviene de plantillas revisables (plantillas.py); la red decide
    QUÉ tema y QUÉ nivel hacen falta. El administrador revisa y publica.
    """
    vector = vector if vector in VECTORES else grupal["vector_prioritario"]
    riesgo = grupal["riesgo_promedio_por_vector"][vector]

    # A mayor riesgo, contenido más básico; a menor riesgo, casos más avanzados.
    if riesgo >= UMBRAL_ALTO:
        nivel, duracion = "Básico", "10 min"
    elif riesgo >= UMBRAL_MEDIO:
        nivel, duracion = "Intermedio", "12 min"
    else:
        nivel, duracion = "Avanzado", "15 min"

    plantilla = PLANTILLAS[vector]
    orden_niveles = ["Básico", "Intermedio", "Avanzado"]
    tope = orden_niveles.index(nivel)
    # Examen de 4 preguntas: primero las del nivel elegido y luego las más cercanas.
    preguntas = sorted(
        plantilla["preguntas"],
        key=lambda p: abs(orden_niveles.index(p["nivel"]) - tope),
    )[:4]

    justificacion = (
        f"Borrador sugerido por el servicio de IA ({grupal['usuarios_analizados']} usuario(s) "
        f"analizado(s)). Riesgo promedio estimado en {vector}: {riesgo}%. "
        f"Riesgo por vector: {grupal['riesgo_promedio_por_vector']}. Nivel propuesto: {nivel}."
    )

    return {
        "titulo": plantilla["titulos"][nivel],
        "categoria": vector,
        "nivel": nivel,
        "duracion": duracion,
        "icono": plantilla["icono"],
        "portada_url": None,
        "resumen": plantilla["resumen"],
        "como_funciona": plantilla["como_funciona"],
        "senales_alerta": plantilla["senales_alerta"],
        "prevencion": plantilla["prevencion"],
        "habilidades": plantilla["habilidades"],
        "materiales": [
            {"orden": i + 1, "titulo": m["titulo"], "tipo_recurso": "lectura",
             "archivo_url": None, "mime_type": None,
             "contenido_texto": m["contenido_texto"], "es_post_quiz": m.get("es_post_quiz", False)}
            for i, m in enumerate(plantilla["materiales"])
        ],
        "quizzes": [
            {"orden": i + 1, "pregunta": p["pregunta"], "recurso_apoyo_url": None,
             "tipo_recurso_apoyo": None, "opciones": p["opciones"],
             "explicacion": p["explicacion"], "puntos_riesgo_fallo": 15}
            for i, p in enumerate(preguntas)
        ],
        "origen": "Servicio IA",
        "prompt_generacion": justificacion,
    }


# Umbral de "respuesta con prisa": decidir usando menos del 30 % del tiempo disponible.
UMBRAL_PRISA = 0.30


def patron_de_tiempo(historiales: list[list[dict]]) -> dict:
    """Mide en el historial del grupo cuántas caídas ocurrieron respondiendo con prisa."""
    caidas = [
        i for h in historiales for i in h
        if i.get("tipo") == "simulacion" and i.get("resultado") == "caer"
        and i.get("tiempo_respuesta") is not None and i.get("tiempo_limite")
    ]
    con_prisa = [i for i in caidas if i["tiempo_respuesta"] / i["tiempo_limite"] < UMBRAL_PRISA]
    return {
        "caidas_con_tiempo": len(caidas),
        "caidas_con_prisa": len(con_prisa),
        "proporcion_prisa": round(len(con_prisa) / len(caidas), 2) if caidas else 0.0,
    }


def borrador_mision(grupal: dict, historiales: list[list[dict]], vector: str | None = None,
                    titulos_existentes: list[str] | None = None) -> dict:
    """Arma un borrador de misión para el simulador.

    La red neuronal decide el vector y la dificultad (a partir del riesgo
    promedio del grupo). Los tiempos de respuesta registrados ajustan el tiempo
    límite. Se evita repetir un escenario que ya exista en el simulador.
    """
    from .plantillas_misiones import MISIONES

    vector = vector if vector in VECTORES else grupal["vector_prioritario"]
    riesgo = grupal["riesgo_promedio_por_vector"][vector]

    # A mayor riesgo, un escenario más evidente; a menor riesgo, uno más sofisticado.
    if riesgo >= UMBRAL_ALTO:
        dificultad = "Básico"
    elif riesgo >= UMBRAL_MEDIO:
        dificultad = "Intermedio"
    else:
        dificultad = "Avanzado"

    orden = ["Básico", "Intermedio", "Avanzado"]
    existentes = {t.strip().lower() for t in (titulos_existentes or [])}
    candidatos = sorted(MISIONES[vector], key=lambda m: abs(orden.index(m["dificultad"]) - orden.index(dificultad)))
    nuevos = [m for m in candidatos if m["titulo"].strip().lower() not in existentes]
    elegida = dict(nuevos[0] if nuevos else candidatos[0])
    repetida = not nuevos

    # Ajuste por presión de tiempo: si la mayoría de las caídas del grupo fueron
    # respuestas apresuradas, se acorta el tiempo para entrenar bajo presión.
    tiempo = patron_de_tiempo(historiales)
    nota_tiempo = ""
    if tiempo["caidas_con_tiempo"] >= 2 and tiempo["proporcion_prisa"] >= 0.5:
        elegida["tiempo_limite"] = max(60, elegida["tiempo_limite"] - 30)
        nota_tiempo = (f" El {int(tiempo['proporcion_prisa'] * 100)} % de las caídas registradas ocurrió "
                       f"respondiendo con prisa, por lo que el tiempo límite se redujo a "
                       f"{elegida['tiempo_limite']} s para entrenar bajo presión.")

    nota_nivel = "" if elegida["dificultad"] == dificultad else (
        f" El escenario de nivel {dificultad} ya existe en el simulador, así que se propone uno de nivel "
        f"{elegida['dificultad']}.")
    nota_repetida = " Todos los escenarios de este vector ya existen; edita el borrador antes de publicarlo." if repetida else ""

    justificacion = (
        f"Borrador de misión sugerido por el servicio de IA ({grupal['usuarios_analizados']} usuario(s) "
        f"analizado(s)). Riesgo promedio estimado en {vector}: {riesgo}%. Dificultad recomendada: "
        f"{dificultad}.{nota_nivel}{nota_tiempo}{nota_repetida}"
    )

    return {
        "titulo": elegida["titulo"],
        "vector": vector,
        "dificultad": elegida["dificultad"],
        "tiempo_limite": elegida["tiempo_limite"],
        "descripcion_corta": elegida["descripcion_corta"],
        "remitente_nombre": elegida["remitente_nombre"],
        "remitente_identificador": elegida["remitente_identificador"],
        "asunto_o_contexto": elegida["asunto_o_contexto"],
        "contenido_principal": elegida["contenido_principal"],
        "texto_boton_trampa": elegida["texto_boton_trampa"],
        "url_trampa": elegida["url_trampa"],
        "pistas_forenses": list(elegida["pistas_forenses"]),
        "origen": "Servicio IA",
        "prompt_generacion": justificacion,
        "dificultad_recomendada": dificultad,
        "patron_tiempo": tiempo,
        "escenario_repetido": repetida,
    }
