from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Exam, ExamQuestion, TestResult
from app.schemas.schemas import ExamListItem, SubmitTestRequest

router = APIRouter(prefix="/api/v1/tests", tags=["Tests & Exams"])

@router.get("/", response_model=List[ExamListItem])
async def list_tests(
    clase_licencia: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Exam).options(selectinload(Exam.exam_questions))
    if clase_licencia:
        stmt = stmt.where(Exam.clase_licencia == clase_licencia)

    result = await db.execute(stmt.order_by(Exam.id))
    exams = result.scalars().all()

    res_stmt = select(TestResult).where(TestResult.user_id == current_user.id).order_by(TestResult.fecha.desc())
    res_query = await db.execute(res_stmt)
    user_results = res_query.scalars().all()

    latest_by_exam = {}
    for r in user_results:
        if r.test_id not in latest_by_exam:
            latest_by_exam[r.test_id] = r

    items = []
    for ex in exams:
        prev = latest_by_exam.get(ex.id)
        items.append(
            ExamListItem(
                id=ex.id,
                nombre=ex.nombre,
                clase_licencia=ex.clase_licencia,
                categoria=ex.categoria,
                total_preguntas=len(ex.exam_questions),
                completado=prev is not None,
                ultimo_puntaje=prev.puntaje if prev else None,
                last_result_id=prev.id if prev else None,
            )
        )
    return items

@router.get("/{test_id}")
async def get_test_detail(
    test_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Exam)
        .where(Exam.id == test_id)
        .options(selectinload(Exam.exam_questions).selectinload(ExamQuestion.question))
    )
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Examen no encontrado")

    questions_out = []
    for eq in exam.exam_questions:
        q = eq.question
        if not q:
            continue
        questions_out.append({
            "id": q.id,
            "nro_pregunta": q.nro_pregunta,
            "texto": q.texto,
            "alternativas": q.alternativas,
            "categoria": q.categoria,
            "clase_licencia": q.clase_licencia,
            "is_multiple": len(q.respuestas_correctas) > 1,
            "correct_answers": q.respuestas_correctas,
            "explicacion": q.explicacion,
        })

    return {
        "id": exam.id,
        "nombre": exam.nombre,
        "clase_licencia": exam.clase_licencia,
        "categoria": exam.categoria,
        "questions": questions_out,
    }

@router.post("/{test_id}/submit")
async def submit_test(
    test_id: int,
    payload: SubmitTestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Exam)
        .where(Exam.id == test_id)
        .options(selectinload(Exam.exam_questions).selectinload(ExamQuestion.question))
    )
    result = await db.execute(stmt)
    exam = result.scalar_one_or_none()

    if not exam:
        raise HTTPException(status_code=404, detail="Examen no encontrado")

    answers_map = {item.question_id: sorted(item.respuestas) for item in payload.answers}

    correctas = 0
    detalles = []
    questions = [eq.question for eq in exam.exam_questions if eq.question]
    total_preguntas = len(questions)

    for q in questions:
        user_ans = answers_map.get(q.id, [])
        correct_ans = sorted(q.respuestas_correctas or [])
        is_correct = (user_ans == correct_ans) and len(user_ans) > 0
        if is_correct:
            correctas += 1

        detalles.append({
            "question_id": q.id,
            "texto_pregunta": q.texto,
            "alternativas": q.alternativas,
            "categoria": q.categoria,
            "selected_answers": user_ans,
            "correct_answers": correct_ans,
            "is_correct": is_correct,
            "explicacion": q.explicacion,
        })

    puntaje = int((correctas / total_preguntas) * 100) if total_preguntas > 0 else 0

    test_result = TestResult(
        user_id=current_user.id,
        test_id=exam.id,
        correctas=correctas,
        total_preguntas=total_preguntas,
        puntaje=puntaje,
        detalles=detalles,
    )
    db.add(test_result)
    await db.commit()
    await db.refresh(test_result)

    return {
        "test_result_id": test_result.id,
        "test_id": exam.id,
        "nombre_test": exam.nombre,
        "clase_licencia": exam.clase_licencia,
        "correctas": correctas,
        "total_preguntas": total_preguntas,
        "puntaje": puntaje,
        "aprobado": (total_preguntas - correctas) <= 2,
        "resultados": detalles,
    }