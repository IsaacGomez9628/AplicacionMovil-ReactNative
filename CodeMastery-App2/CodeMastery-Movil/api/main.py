# ✅ MAIN.PY CONFIGURADO PARA PUERTO 8000

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

# ✅ CORS CONFIGURADO PARA PUERTO 8001
origins = [
    # Desarrollo local
    "http://localhost:3000",
    "http://localhost:8081", 
    "http://localhost:19006",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19006",
    "http://localhost:8001",    # ✅ Puerto backend
    
    # ✅ TU IP ESPECÍFICA - PUERTO 8000 (ACTUALIZADO)
    "http://192.168.1.8:8001",  # ✅ Backend en puerto 8001
    "http://192.168.1.8:19006", # Expo Dev Server
    "http://192.168.1.8:8081",  # Metro bundler
    "http://192.168.1.8:3000",  # Web development
    "http://192.168.1.8:8080",  # Alternativo
    
    # Expo URLs
    "exp://192.168.1.8:8081",
    "exp://192.168.1.8:19006",
    
    # Android Emulator - PUERTO 8000 (ACTUALIZADO)
    "http://10.0.2.2:8001",     # ✅ Backend desde emulador
    "http://10.0.2.2:8081",     # Metro
    "http://10.0.2.2:19006",    # Expo Dev
    "http://10.0.2.2:3000",     # Web
    
    # Adicionales
    "capacitor://localhost",
    "ionic://localhost",
    "http://localhost",
    "https://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Middleware para logging
@app.middleware("http")
async def log_requests(request, call_next):
    is_auth_request = "/auth/" in str(request.url.path)
    
    if is_auth_request:
        logger.info(f"🔐 AUTH Request: {request.method} {request.url.path}")
        logger.info(f"🔐 Origin: {request.headers.get('origin', 'No origin')}")
        
        if "/auth/refresh" in str(request.url.path):
            logger.info(f"🔄 REFRESH TOKEN Request detected")
    else:
        logger.info(f"Request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    if is_auth_request:
        logger.info(f"🔐 AUTH Response status: {response.status_code}")
    else:
        logger.info(f"Response status: {response.status_code}")
    
    return response

@app.options("/{path:path}")
async def enhanced_cors_handler(path: str, request):
    origin = request.headers.get("origin", "unknown")
    method = request.headers.get("access-control-request-method", "unknown")
    
    logger.info(f"🌐 PREFLIGHT: {method} /{path} from {origin}")
    
    if "/auth/" in path:
        logger.info(f"🔐 AUTH PREFLIGHT: {method} /{path}")
        if "/auth/refresh" in path:
            logger.info(f"🔄 REFRESH TOKEN PREFLIGHT detected")
    
    return {
        "message": "CORS preflight handled", 
        "path": path,
        "method": method,
        "origin": origin
    }

# Incluir routers
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
        "message": "Learning Platform API - Puerto 8001 ✅",
        "version": "1.0.0",
        "port": 8001,  # ✅ Confirmar puerto
        "docs": "/docs",
        "status": "healthy",
        "refresh_token_enabled": True
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API running on port 8000",  # ✅ Confirmar puerto
        "port": 8001,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "features": {
            "refresh_token": True,
            "cors_enabled": True,
            "auth_endpoints": ["/auth/login", "/auth/register", "/auth/refresh", "/auth/me"]
        }
    }

@app.post("/test-cors-auth")
async def test_cors_auth(request):
    headers = dict(request.headers)
    return {
        "message": "CORS with Auth test successful - Port 8001",
        "port": 8001,  # ✅ Confirmar puerto
        "origin": headers.get('origin', 'No origin'),
        "authorization": "Present" if 'authorization' in headers else "Missing",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/test-connection")
async def test_connection(data: dict = None):
    logger.info(f"Test connection received: {data}")
    return {
        "received": data,
        "port": 8001,  # ✅ Confirmar puerto
        "timestamp": datetime.now().isoformat(),
        "message": "Connection successful on port 8001",
        "status": "ok"
    }

@app.get("/auth/debug")
async def auth_debug():
    return {
        "message": "Auth debug info - Port 8001",
        "port": 8000,
        "base_url": "http://192.168.1.8:8001",  # ✅ URL completa
        "endpoints": {
            "login": "/auth/login",
            "register": "/auth/register", 
            "refresh": "/auth/refresh",
            "me": "/auth/me",
            "logout": "/auth/logout"
        },
        "cors_origins": len(origins),
        "status": "ready"
    }

if __name__ == "__main__":
    import os
    os.makedirs("logs", exist_ok=True)
    
    logger.info("🚀 Starting API server on PORT 8001...")
    logger.info(f"📡 Base URL: http://192.168.1.8:8001")
    logger.info(f"🌐 CORS origins configured: {len(origins)}")
    logger.info("🔄 Refresh token system: ENABLED")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,      # ✅ PUERTO 8000 CONFIGURADO
        reload=True,
        log_level="info"
    )