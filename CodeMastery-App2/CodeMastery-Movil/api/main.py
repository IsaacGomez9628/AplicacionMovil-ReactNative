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
    
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# ✅ CONFIGURACIÓN CORS CORREGIDA CON TU IP ESPECÍFICA
origins = [
    # Desarrollo local
    "http://localhost:3000",
    "http://localhost:8081", 
    "http://localhost:19006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",
    
    # ✅ TU IP ESPECÍFICA DETECTADA - Puerto 8001
    "http://192.168.1.8:8001",
    "http://192.168.1.8:19006",
    "http://192.168.1.8:8081",
    "http://192.168.1.8:3000",
    
    # Expo URLs
    "exp://192.168.1.8:8081",
    "exp://192.168.1.8:19006",
    
    # Android Emulator
    "http://10.0.2.2:8001",
    "http://10.0.2.2:8081",
    "http://10.0.2.2:19006",
    
    # Adicionales para debugging
    "http://192.168.1.8:8080",
    "http://localhost:8080",
]

# ✅ CORS MIDDLEWARE CORREGIDO
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ✅ Lista específica (NO usar "*")
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
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Endpoint de test para verificar conexión
@app.post("/test-connection")
async def test_connection(data: dict = None):
    logger.info(f"Test connection received: {data}")
    return {
        "received": data,
        "timestamp": datetime.now().isoformat(),
        "message": "Connection successful",
        "status": "ok"
    }

# ✅ ENDPOINT PARA DEBUG DE CORS
@app.options("/{path:path}")
async def cors_handler(path: str):
    return {"message": "CORS preflight handled"}

if __name__ == "__main__":
    import os
    os.makedirs("logs", exist_ok=True)
    
    logger.info("Starting API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # ✅ Importante para dispositivos móviles
        port=8001,       # ✅ Puerto actualizado
        reload=True,
        log_level="info"
    )