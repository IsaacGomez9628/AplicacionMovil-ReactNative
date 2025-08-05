from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Module, User
from schemas import Module as ModuleSchema, ModuleCreate, ModuleUpdate
from auth import get_current_user

router = APIRouter()

@router.get("/{module_id}", response_model=ModuleSchema)
def get_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@router.get("/{module_id}/lessons")
def get_module_lessons(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models import Lesson
    lessons = db.query(Lesson).filter(Lesson.module_id == module_id).order_by(Lesson.position).all()
    return lessons

@router.post("/", response_model=ModuleSchema)
def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_module = Module(**module.dict())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.put("/{module_id}", response_model=ModuleSchema)
def update_module(
    module_id: str,
    module: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    
    update_data = module.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_module, field, value)
    
    db.commit()
    db.refresh(db_module)
    return db_module

@router.delete("/{module_id}")
def delete_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db.delete(db_module)
    db.commit()
    return {"message": "Module deleted successfully"}
