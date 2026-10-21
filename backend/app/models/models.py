from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(32), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    license_class = Column(String(20), default="Clase B")
    is_admin = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    premium_until = Column(DateTime(timezone=True), nullable=True)  # <-- NUEVO CAMPO
    created_at = Column(DateTime(timezone=True), default=utc_now)

    results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    nro_pregunta = Column(Integer, unique=True, index=True, nullable=False)
    texto = Column(Text, nullable=False)
    alternativas = Column(JSON, nullable=False)          # Ej: {"A": "...", "B": "...", "C": "..."}
    respuestas_correctas = Column(JSON, nullable=False)  # Ej: ["B"]
    explicacion = Column(Text, nullable=True)
    clase_licencia = Column(String(50), nullable=False)  # Ej: "Clase C, Clase B"
    categoria = Column(String(120), nullable=False)
    imagen_url = Column(String(255), nullable=True)


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    clase_licencia = Column(String(20), nullable=False)  # "Clase B" o "Clase C"
    categoria = Column(String(120), default="Mixto")
    is_free = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    exam_questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)

    exam = relationship("Exam", back_populates="exam_questions")
    question = relationship("Question")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    correctas = Column(Integer, nullable=False)
    total_preguntas = Column(Integer, nullable=False)
    puntaje = Column(Integer, nullable=False)             # Porcentaje 0 - 100
    detalles = Column(JSON, nullable=False)               # Detalle de respuestas y corrección
    fecha = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="results")
    exam = relationship("Exam")