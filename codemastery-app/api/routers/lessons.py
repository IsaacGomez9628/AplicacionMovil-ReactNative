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
    # Obtener la lección
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Verificar si el código es correcto (comparación simple)
    is_correct = submission.code_submitted.strip() == lesson.practice_solution.strip()
    
    # Crear el intento
    attempt = ExerciseAttempt(
        user_id=current_user.id,
        lesson_id=lesson_id,
        code_submitted=submission.code_submitted,
        is_correct=is_correct
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    return {
        "is_correct": is_correct,
        "message": "Código correcto!" if is_correct else "Código incorrecto, intenta de nuevo.",
        "attempt_id": attempt.id
    }

@router.get("/{lesson_id}/ultimo-intento")
def get_last_attempt(
    lesson_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(ExerciseAttempt).filter(
        ExerciseAttempt.lesson_id == lesson_id,
        ExerciseAttempt.user_id == user_id
    ).order_by(ExerciseAttempt.attempt_date.desc()).first()
    
    if attempt is None:
        raise HTTPException(status_code=404, detail="No attempts found")
    
    return attempt

@router.get("/intentos", response_model=List[ExerciseAttemptSchema])
def get_user_attempts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempts = db.query(ExerciseAttempt).filter(
        ExerciseAttempt.user_id == user_id
    ).order_by(ExerciseAttempt.attempt_date.desc()).all()
    
    return attempts

@router.delete("/intentos/{attempt_id}")
def delete_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt = db.query(ExerciseAttempt).filter(ExerciseAttempt.id == attempt_id).first()
    if attempt is None:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Verificar que el intento pertenece al usuario actual
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this attempt")
    
    db.delete(attempt)
    db.commit()
    return {"message": "Attempt deleted successfully"}

@router.post("/", response_model=LessonSchema)
def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_lesson = Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.put("/{lesson_id}", response_model=LessonSchema)
def update_lesson(
    lesson_id: int,
    lesson: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    update_data = lesson.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lesson, field, value)
    
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.delete("/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if db_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    db.delete(db_lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}
