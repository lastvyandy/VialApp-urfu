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