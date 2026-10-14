from typing import Optional, List, Dict, Any
from datetime import datetime
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

# --- Esquemas de Exámenes y Preguntas ---

class AnswerItem(BaseModel):
    question_id: int
    respuestas: List[str]

class SubmitTestRequest(BaseModel):
    answers: List[AnswerItem]
    mode: Optional[str] = "exam"

class QuestionOut(BaseModel):
    id: int
    nro_pregunta: int
    texto: str
    alternativas: Dict[str, str]
    categoria: str
    clase_licencia: str
    is_multiple: bool
    correct_answers: Optional[List[str]] = None
    explicacion: Optional[str] = None

class ExamListItem(BaseModel):
    id: int
    nombre: str
    clase_licencia: str
    categoria: str
    total_preguntas: int
    completado: bool = False
    ultimo_puntaje: Optional[int] = None
    last_result_id: Optional[int] = None

class TestResultSummary(BaseModel):
    id: int
    test_id: int
    nombre_test: str
    clase_licencia: str
    categoria: str
    correctas: int
    total_preguntas: int
    puntaje: int
    fecha: datetime
    detalles: Optional[List[Dict[str, Any]]] = None