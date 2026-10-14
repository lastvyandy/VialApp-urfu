import json
import os
from sqlalchemy import select, func
from app.core.database import async_session
from app.core.security import get_password_hash
from app.models.models import User, Question, Exam, ExamQuestion

async def seed_database():
    async with async_session() as db:
        # 1. Verificar si ya hay preguntas cargadas
        q_count = await db.scalar(select(func.count()).select_from(Question))
        if q_count and q_count > 0:
            return

        print("🌱 Inicializando semilla de datos para VialApp MVP...")

        # 2. Crear usuarios por defecto para la demo
        demo_user = User(
            id="usr_demo_urfu01",
            username="jorge_demo",
            email="demo@vialapp.cl",
            password_hash=get_password_hash("12345678"),
            license_class="Clase B",
            is_admin=False,
            is_premium=True,
        )
        admin_user = User(
            id="usr_admin_urfu1",
            username="admin",
            email="admin@vialapp.cl",
            password_hash=get_password_hash("admin123"),
            license_class="Clase B",
            is_admin=True,
            is_premium=True,
        )
        db.add_all([demo_user, admin_user])

        # 3. Cargar preguntas desde final_preguntas_respuestasPT.json (limitamos a 200 para rapidez en MVP)
        json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "final_preguntas_respuestasPT.json")
        questions_created = []

        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                raw_questions = json.load(f)

            for item in raw_questions[:200]:
                q = Question(
                    nro_pregunta=item.get("nro_pregunta"),
                    texto=item.get("texto", ""),
                    alternativas=item.get("alternativas", {}),
                    respuestas_correctas=item.get("respuestasCorrectas", []),
                    explicacion=item.get("Explicacion", ""),
                    clase_licencia=item.get("clase_licencia", "Clase B"),
                    categoria=item.get("categoria", "General"),
                )
                db.add(q)
                questions_created.append(q)
        else:
            # Fallback en caso de que no esté el JSON aún
            for i in range(1, 16):
                q = Question(
                    nro_pregunta=i,
                    texto=f"Pregunta de prueba #{i}: ¿Cuál es la velocidad máxima en zona urbana en Chile?",
                    alternativas={"A": "50 km/h", "B": "60 km/h", "C": "70 km/h"},
                    respuestas_correctas=["A"],
                    explicacion="El límite urbano general para vehículos livianos y motocicletas es de 50 km/h.",
                    clase_licencia="Clase C, Clase B",
                    categoria="Normas y Señalización del Tránsito",
                )
                db.add(q)
                questions_created.append(q)

        await db.flush()

        # 4. Generar Exámenes de muestra (15 preguntas por examen para que sea ágil mostrarlo en clases)
        clase_b_qs = [q for q in questions_created if "Clase B" in q.clase_licencia]
        clase_c_qs = [q for q in questions_created if "Clase C" in q.clase_licencia]

        exams_spec = [
            ("Ensayo Oficial #1 - Clase B", "Clase B", "Mixto", clase_b_qs[:15]),
            ("Ensayo Oficial #2 - Clase B", "Clase B", "Mixto", clase_b_qs[15:30]),
            ("Ensayo Oficial #1 - Clase C", "Clase C", "Mixto", clase_c_qs[:15]),
            ("Ensayo Oficial #2 - Clase C", "Clase C", "Mixto", clase_c_qs[15:30]),
        ]

        for nombre, licencia, categoria, qs_subset in exams_spec:
            if not qs_subset:
                continue
            exam = Exam(nombre=nombre, clase_licencia=licencia, categoria=categoria, is_free=True)
            db.add(exam)
            await db.flush()

            for q in qs_subset:
                db.add(ExamQuestion(exam_id=exam.id, question_id=q.id))

        await db.commit()
        print(f"✅ Semilla completada: {len(questions_created)} preguntas y exámenes generados.")