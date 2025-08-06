from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, User as UserSchema
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    """
    Registro de nuevo usuario con logging detallado
    """
    # Log de entrada
    logger.info(f"Register attempt for email: {user.email}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"User data received: name={user.name}, email={user.email}")
    
    try:
        # Verificar si el usuario ya existe
        db_user = db.query(User).filter(User.email == user.email.lower().strip()).first()
        if db_user:
            logger.warning(f"Registration failed: Email {user.email} already registered")
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Validaciones adicionales
        if len(user.password) < 6:
            logger.warning(f"Registration failed: Password too short for {user.email}")
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 6 characters"
            )
        
        if len(user.name.strip()) < 2:
            logger.warning(f"Registration failed: Name too short for {user.email}")
            raise HTTPException(
                status_code=400,
                detail="Name must be at least 2 characters"
            )
        
        # Crear nuevo usuario
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name.strip(),
            email=user.email.lower().strip(),
            password=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"User successfully registered: {db_user.email} with ID: {db_user.id}")
        
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """
    Login con logging detallado
    """
    logger.info(f"Login attempt for email: {user_credentials.email}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    try:
        user = authenticate_user(db, user_credentials.email.lower().strip(), user_credentials.password)
        if not user:
            logger.warning(f"Login failed for email: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        logger.info(f"Login successful for user: {user.email}")
        
        return {
            "access_token": access_token, 
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    logger.info(f"User info requested for: {current_user.email}")
    return current_user

# Endpoint de prueba para verificar que el auth router funciona
@router.get("/test")
async def test_auth():
    logger.info("Auth test endpoint accessed")
    return {"message": "Auth router is working", "status": "ok"}