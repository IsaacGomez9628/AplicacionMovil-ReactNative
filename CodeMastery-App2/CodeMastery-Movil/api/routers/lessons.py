# api/routers/lessons.py - CORREGIDO
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Lesson, ExerciseAttempt, User
from schemas import (
    Lesson as LessonSchema, 
    LessonCreate, 
    LessonUpdate,
    ExerciseSubmission,
    ExerciseAttempt as ExerciseAttemptSchema
)
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/{lesson_id}", response_model=LessonSchema)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/{lesson_id}/enviar")
def submit_code(
    lesson_id: int,
    submission: ExerciseSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Code submission for lesson {lesson_id} by user {current_user.email}")
    
    # Obtener la lección
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # ✅ MEJORADA: Lógica de validación más robusta
    submitted_code = submission.code_submitted.strip()
    expected_code = lesson.practice_solution.strip()
    
    # Normalizar espacios en blanco y saltos de línea
    submitted_normalized = ' '.join(submitted_code.split())
    expected_normalized = ' '.join(expected_code.split())
    
    is_correct = submitted_normalized.lower() == expected_normalized.lower()
    
    logger.info(f"Code validation - Expected: '{expected_normalized}', Submitted: '{submitted_normalized}', Correct: {is_correct}")
    
    # Crear el intento
    attempt = ExerciseAttempt(
        user_id=current_user.id,
        lesson_id=lesson_id,
        code_submitted=submission.code_submitted,
        is_correct=is_correct
    )
    
    try:
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
        logger.info(f"Exercise attempt saved with ID: {attempt.id}")
        
        return {
            "is_correct": is_correct,
            "message": "¡Código correcto! 🎉" if is_correct else "Código incorrecto, revisa e intenta de nuevo. 💭",
            "attempt_id": attempt.id,
            "submitted_code": submitted_code,
            "expected_code": expected_code if not is_correct else None
        }
    except Exception as e:
        logger.error(f"Error saving attempt: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar el intento")

@router.get("/{lesson_id}/ultimo-intento")
def get_last_attempt(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(ExerciseAttempt).filter(
        ExerciseAttempt.lesson_id == lesson_id,
        ExerciseAttempt.user_id == current_user.id
    ).order_by(ExerciseAttempt.attempt_date.desc()).first()
    
    if attempt is None:
        raise HTTPException(status_code=404, detail="No attempts found")
    
    return attempt

# ✅ CORREGIDO: Endpoint mejorado para obtener intentos del usuario
@router.get("/intentos", response_model=List[ExerciseAttemptSchema])
def get_user_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """Obtener todos los intentos del usuario autenticado"""
    logger.info(f"Fetching attempts for user {current_user.email} (ID: {current_user.id})")
    
    try:
        attempts = db.query(ExerciseAttempt).filter(
            ExerciseAttempt.user_id == current_user.id
        ).order_by(
            ExerciseAttempt.attempt_date.desc()
        ).limit(limit).all()
        
        logger.info(f"Found {len(attempts)} attempts for user {current_user.id}")
        
        if not attempts:
            logger.info(f"No attempts found for user {current_user.id}")
            return []
            
        return attempts
        
    except Exception as e:
        logger.error(f"Error fetching user attempts: {str(e)}")
        return []

@router.delete("/intentos/{attempt_id}")
def delete_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(ExerciseAttempt).filter(ExerciseAttempt.id == attempt_id).first()
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this attempt")
    
    try:
        db.delete(attempt)
        db.commit()
        logger.info(f"Attempt {attempt_id} deleted by user {current_user.email}")
        return {"message": "Attempt deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting attempt {attempt_id}: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar el intento")