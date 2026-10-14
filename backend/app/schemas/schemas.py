from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    license_class: Optional[str] = "Clase B"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    license_class: str
    is_admin: bool
    is_premium: bool
    profile_completed: bool = True
    password_change_required: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"