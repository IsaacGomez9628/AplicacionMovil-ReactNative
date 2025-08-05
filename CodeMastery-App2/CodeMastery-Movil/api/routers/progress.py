from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import UserProgress, User, Module
from schemas import UserProgress as UserProgressSchema, UserProgressCreate, UserProgressUpdate
from auth import get_current_user

router = APIRouter()

@router.get("/{user_id}", response_model=List[UserProgressSchema])
def get_user_progress(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).all()
    return progress

@router.put("/", response_model=UserProgressSchema)
def update_progress(
    progress: UserProgressUpdate,
    user_id: int,
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Buscar progreso existente
    db_progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.module_id == module_id
    ).first()
    
    if db_progress is None:
        # Crear nuevo progreso
        db_progress = UserProgress(
            user_id=user_id,
            module_id=module_id,
            completed=progress.completed or False,
            completion_date=progress.completion_date
        )
        db.add(db_progress)
    else:
        # Actualizar progreso existente
        update_data = progress.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_progress, field, value)
    
    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.get("/resumen/{user_id}")
def get_user_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Contar módulos totales
    total_modules = db.query(Module).count()
    
    # Contar módulos completados por el usuario
    completed_modules = db.query(UserProgress).filter(
        UserProgress.user_id == user_id,
        UserProgress.completed == True
    ).count()
    
    # Calcular porcentaje
    completion_percentage = (completed_modules / total_modules * 100) if total_modules > 0 else 0
    
    return {
        "user_id": user_id,
        "total_modules": total_modules,
        "completed_modules": completed_modules,
        "completion_percentage": completion_percentage
    }
