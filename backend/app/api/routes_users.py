import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, Token

router = APIRouter(prefix="/api/v1/users", tags=["Users & Auth"])

def generate_user_id() -> str:
    return f"usr_{secrets.token_urlsafe(8).replace('-', '').replace('_', '')[:12]}"

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(or_(User.email == user_in.email, User.username == user_in.username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email o nombre de usuario ya está registrado",
        )

    new_user = User(
        id=generate_user_id(),
        username=user_in.username,
        email=user_in.email.lower().strip(),
        password_hash=get_password_hash(user_in.password),
        license_class=user_in.license_class or "Clase B",
        is_admin=False,
        is_premium=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    # Permitimos login tanto por email como por username
    identifier = form_data.username.lower().strip()
    result = await db.execute(
        select(User).where(or_(User.email == identifier, User.username == form_data.username.strip()))
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user



@router.get("/me/tests")
async def get_my_test_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TestResult)
        .where(TestResult.user_id == current_user.id)
        .options(selectinload(TestResult.exam))
        .order_by(TestResult.fecha.desc())
    )
    result = await db.execute(stmt)
    history = result.scalars().all()

    return [
        {
            "id": r.id,
            "test_id": r.test_id,
            "nombre_test": r.exam.nombre if r.exam else f"Examen #{r.test_id}",
            "clase_licencia": r.exam.clase_licencia if r.exam else "Clase B",
            "categoria": r.exam.categoria if r.exam else "Mixto",
            "correctas": r.correctas,
            "total_preguntas": r.total_preguntas,
            "puntaje": r.puntaje,
            "fecha": r.fecha,
        }
        for r in history
    ]

@router.get("/me/tests/{result_id}")
async def get_my_test_result_detail(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TestResult)
        .where(TestResult.id == result_id, TestResult.user_id == current_user.id)
        .options(selectinload(TestResult.exam))
    )
    result = await db.execute(stmt)
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")

    return {
        "id": r.id,
        "test_id": r.test_id,
        "nombre_test": r.exam.nombre if r.exam else f"Examen #{r.test_id}",
        "clase_licencia": r.exam.clase_licencia if r.exam else "Clase B",
        "correctas": r.correctas,
        "total_preguntas": r.total_preguntas,
        "puntaje": r.puntaje,
        "fecha": r.fecha,
        "detalles": r.detalles,
    }




@router.get("/me/stats/avanzadas")
async def get_my_advanced_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TestResult)
        .where(TestResult.user_id == current_user.id)
        .order_by(TestResult.fecha.desc())
    )
    result = await db.execute(stmt)
    history = result.scalars().all()

    total_tests = len(history)
    if total_tests == 0:
        return {
            "summary": {
                "total_tests": 0,
                "aprobados": 0,
                "promedio_puntaje": 0,
                "peor_categoria": None,
            },
            "categorias": [],
        }

    aprobados = sum(1 for r in history if (r.total_preguntas - r.correctas) <= 2)
    promedio_puntaje = round(sum(r.puntaje for r in history) / total_tests)

    cat_totals = {}
    for r in history:
        for item in (r.detalles or []):
            cat = item.get("categoria") or "General"
            if cat not in cat_totals:
                cat_totals[cat] = {"correctas": 0, "total": 0}
            cat_totals[cat]["total"] += 1
            if item.get("is_correct"):
                cat_totals[cat]["correctas"] += 1

    categorias_list = []
    for cat, counts in cat_totals.items():
        porcentaje = round((counts["correctas"] / counts["total"]) * 100) if counts["total"] > 0 else 0
        categorias_list.append({
            "categoria": cat,
            "correctas": counts["correctas"],
            "total": counts["total"],
            "porcentaje": porcentaje,
        })

    categorias_list.sort(key=lambda x: x["porcentaje"])
    peor_categoria = categorias_list[0]["categoria"] if categorias_list else None

    return {
        "summary": {
            "total_tests": total_tests,
            "aprobados": aprobados,
            "promedio_puntaje": promedio_puntaje,
            "peor_categoria": peor_categoria,
        },
        "categorias": categorias_list,
    }