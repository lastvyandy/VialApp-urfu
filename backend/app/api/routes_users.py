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