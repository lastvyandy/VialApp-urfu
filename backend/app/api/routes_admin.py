import random
from typing import Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.models import User, Question, Exam, ExamQuestion, TestResult

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Normaliza cualquier datetime de SQLite a UTC con zona horaria para evitar TypeError."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido a administradores",
        )
    return current_user

class UserAdminUpdate(BaseModel):
    license_class: Optional[str] = None
    is_premium: Optional[bool] = None
    is_admin: Optional[bool] = None
    premium_until: Optional[str] = None
    add_days: Optional[int] = None
    reset_password: Optional[bool] = None

@router.get("/summary")
async def get_admin_summary(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = await db.scalar(select(func.count()).select_from(User)) or 0
    premium_users = await db.scalar(select(func.count()).select_from(User).where(User.is_premium == True)) or 0
    total_questions = await db.scalar(select(func.count()).select_from(Question)) or 0
    total_exams = await db.scalar(select(func.count()).select_from(Exam)) or 0
    total_results = await db.scalar(select(func.count()).select_from(TestResult)) or 0

    passed_results = await db.scalar(
        select(func.count()).select_from(TestResult).where((TestResult.total_preguntas - TestResult.correctas) <= 2)
    ) or 0
    tasa_aprobacion = round((passed_results / total_results) * 100) if total_results > 0 else 0

    cat_query = await db.execute(
        select(Question.categoria, func.count(Question.id)).group_by(Question.categoria)
    )
    categorias_dist = [{"categoria": cat, "total": cnt} for cat, cnt in cat_query.all()]

    return {
        "total_users": total_users,
        "premium_users": premium_users,
        "total_questions": total_questions,
        "total_exams": total_exams,
        "total_results": total_results,
        "tasa_aprobacion": tasa_aprobacion,
        "categorias_dist": categorias_dist,
    }

@router.get("/users")
async def list_users_admin(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    now = datetime.now(timezone.utc)
    user_list = []

    for u in users:
        dias_restantes = 0
        premium_activo = False
        exp_date = to_utc(u.premium_until)
        created_date = to_utc(u.created_at)

        if u.is_premium:
            if exp_date:
                diff = (exp_date - now).total_seconds()
                if diff > 0:
                    dias_restantes = int(diff // 86400) + 1
                    premium_activo = True
            else:
                premium_activo = True
                dias_restantes = 365

        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "license_class": u.license_class or "Clase B",
            "is_admin": bool(u.is_admin),
            "is_premium": premium_activo,
            "premium_until": exp_date.isoformat() if exp_date else None,
            "dias_restantes": dias_restantes,
            "created_at": created_date.isoformat() if created_date else None,
        })

    return user_list

@router.patch("/users/{user_id}")
async def update_user_admin(
    user_id: str,
    payload: UserAdminUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if payload.license_class is not None:
        user.license_class = payload.license_class
    if payload.is_admin is not None:
        user.is_admin = payload.is_admin

    now = datetime.now(timezone.utc)
    current_exp = to_utc(user.premium_until)

    if payload.add_days is not None:
        base = current_exp if (current_exp and current_exp > now) else now
        user.premium_until = base + timedelta(days=payload.add_days)
        user.is_premium = True

    if payload.is_premium is not None:
        user.is_premium = payload.is_premium
        if not payload.is_premium:
            user.premium_until = None
        elif not current_exp or current_exp <= now:
            user.premium_until = now + timedelta(days=30)

    if payload.premium_until is not None:
        if payload.premium_until == "":
            user.premium_until = None
            user.is_premium = False
        else:
            try:
                clean_date = payload.premium_until.replace("Z", "")
                parsed = datetime.fromisoformat(clean_date).replace(tzinfo=timezone.utc)
                user.premium_until = parsed
                user.is_premium = parsed > now
            except ValueError:
                pass

    if payload.reset_password:
        user.password_hash = get_password_hash("12345678")

    await db.commit()
    await db.refresh(user)

    return {"message": "Usuario actualizado exitosamente"}

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta de administrador")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    await db.delete(user)
    await db.commit()
    return {"message": "Usuario eliminado correctamente"}

@router.post("/tests/generate")
async def generate_bulk_exams(
    clase_licencia: str = "Clase B",
    categoria: Optional[str] = "Mixto",
    num_questions: int = 35,
    cantidad: int = 1,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Question).where(Question.clase_licencia.contains(clase_licencia))
    if categoria and categoria != "Mixto":
        stmt = stmt.where(Question.categoria == categoria)

    result = await db.execute(stmt)
    matching_questions = result.scalars().all()

    if len(matching_questions) < num_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Hay {len(matching_questions)} preguntas disponibles. Reduce el número de preguntas por examen.",
        )

    cantidad = max(1, min(cantidad, 25))
    created = []

    for _ in range(cantidad):
        exam_count = await db.scalar(
            select(func.count()).select_from(Exam).where(Exam.clase_licencia == clase_licencia)
        ) or 0
        next_number = exam_count + 1

        selected_qs = random.sample(matching_questions, num_questions)

        new_exam = Exam(
            nombre=f"Ensayo Oficial #{next_number} - {clase_licencia}",
            clase_licencia=clase_licencia,
            categoria=categoria or "Mixto",
            is_free=True,
        )
        db.add(new_exam)
        await db.flush()

        for q in selected_qs:
            db.add(ExamQuestion(exam_id=new_exam.id, question_id=q.id))

        created.append(new_exam.nombre)

    await db.commit()
    return {
        "message": f"¡Éxito! Se generaron {len(created)} examen(es) de {num_questions} preguntas.",
        "examenes": created,
    }

@router.get("/questions")
async def list_questions_admin(
    categoria: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Question)
    if categoria and categoria != "Todas":
        stmt = stmt.where(Question.categoria == categoria)
    if search:
        stmt = stmt.where(Question.texto.contains(search.strip()))

    result = await db.execute(stmt.limit(limit))
    qs = result.scalars().all()
    return [
        {
            "id": q.id,
            "nro": q.nro_pregunta,
            "texto": q.texto,
            "categoria": q.categoria,
            "clase_licencia": q.clase_licencia,
            "alternativas": q.alternativas,
            "respuestas_correctas": q.respuestas_correctas,
            "explicacion": q.explicacion,
        }
        for q in qs
    ]