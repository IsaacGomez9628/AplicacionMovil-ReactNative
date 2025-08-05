from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Course, User
from schemas import Course as CourseSchema, CourseCreate, CourseUpdate
from auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CourseSchema])
def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(
    course_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/", response_model=CourseSchema)
def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar si el curso ya existe
    db_course = db.query(Course).filter(Course.id == course.id).first()
    if db_course:
        raise HTTPException(status_code=400, detail="Course already exists")
    
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=CourseSchema)
def update_course(
    course_id: str,
    course: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

@router.get("/{course_id}/modules")
def get_course_modules(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models import Module
    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.position).all()
    return modules
