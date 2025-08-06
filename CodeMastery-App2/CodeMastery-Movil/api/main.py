from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy.orm import Session
import uvicorn
import logging
from datetime import datetime

from database import SessionLocal, engine, get_db
from routers import auth, courses, modules, lessons, progress, users
import models

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/app_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Crear las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Learning Platform API",
    description="API para plataforma de aprendizaje con React Native",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    # Log del body para POST/PUT
    if request.method in ["POST", "PUT"]:
        body = await request.body()
        logger.info(f"Body: {body.decode('utf-8') if body else 'Empty'}")
        # Recrear el request con el body
        from starlette.requests import Request
        request = Request(request.scope, receive=lambda: body)
    
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Configurar CORS - MÁS ESPECÍFICO Y SEGURO
origins = [
    "http://192.168.56.1:19006",      # Expo web
    "http://192.168.56.1:8081",        # Metro bundler
    "http://192.168.56.1:19006",  # Tu IP local - CAMBIA ESTO
    "http://192.168.56.1:8081",   # Tu IP local - CAMBIA ESTO
    "http://192.168.56.1:19006",       # Android emulator
    "http://192.168.56.1:8081",        # Android emulator
    "exp://192.168.56.1:8081",    # Expo Go - CAMBIA ESTO
    "http://192.168.56.1:19006",      # Localhost alternativo
    "http://192.168.56.1:8081",       # Localhost alternativo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Incluir routers con logging
logger.info("Registrando routers...")
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(modules.router, prefix="/modules", tags=["modules"])
app.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(users.router, prefix="/usuarios", tags=["users"])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Learning Platform API - Funcionando correctamente!",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API is running",
        "timestamp": datetime.now().isoformat()
    }

# Endpoint de test para verificar conexión
@app.post("/test-connection")
async def test_connection(data: dict = None):
    logger.info(f"Test connection received: {data}")
    return {
        "received": data,
        "timestamp": datetime.now().isoformat(),
        "message": "Connection successful"
    }

if __name__ == "__main__":
    import os
    os.makedirs("logs", exist_ok=True)
    
    logger.info("Starting API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )