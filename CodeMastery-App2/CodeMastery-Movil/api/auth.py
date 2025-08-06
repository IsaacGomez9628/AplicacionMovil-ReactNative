# ✅ ARCHIVO CORREGIDO: api/auth.py - SECCIÓN DE TIMESTAMPS
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import logging

from database import get_db
from models import User
from schemas import TokenData

load_dotenv()

# Configurar logging
logger = logging.getLogger(__name__)

# Configuración
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Contexto de encriptación
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

def get_current_utc_time():
    """✅ NUEVA FUNCIÓN: Obtener tiempo UTC consistente"""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def verify_password(plain_password, hashed_password):
    """Verificar contraseña plana contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generar hash de contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """✅ CORREGIDO: Crear token de acceso JWT con timezone correcto"""
    to_encode = data.copy()
    
    # ✅ USAR UTC CONSISTENTEMENTE
    now = get_current_utc_time()
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": int(expire.timestamp()),  # ✅ Convertir a timestamp Unix
        "iat": int(now.timestamp()),     # ✅ Convertir a timestamp Unix
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    logger.info(f"🔐 Access token created:")
    logger.info(f"   Now UTC: {now}")
    logger.info(f"   Expires UTC: {expire}")
    logger.info(f"   Now timestamp: {int(now.timestamp())}")
    logger.info(f"   Exp timestamp: {int(expire.timestamp())}")
    
    return encoded_jwt

def create_refresh_token(data: dict):
    """✅ CORREGIDO: Crear token de refresh con timezone correcto"""
    to_encode = data.copy()
    
    # ✅ USAR UTC CONSISTENTEMENTE
    now = get_current_utc_time()
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": int(expire.timestamp()),  # ✅ Convertir a timestamp Unix
        "iat": int(now.timestamp()),     # ✅ Convertir a timestamp Unix
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    logger.info(f"🔄 Refresh token created:")
    logger.info(f"   Now UTC: {now}")
    logger.info(f"   Expires UTC: {expire}")
    
    return encoded_jwt

def create_token_pair(user_email: str):
    """Crear par de tokens (access + refresh)"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={"sub": user_email}, 
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user_email}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # En segundos
    }

def verify_token(token: str, token_type: str = "access"):
    """✅ CORREGIDO: Verificar token con timezone correcto"""
    try:
        logger.info(f"🔍 Verifying {token_type} token...")
        
        # Decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extraer claims
        email: str = payload.get("sub")
        exp: int = payload.get("exp")
        token_type_claim: str = payload.get("type")
        iat: int = payload.get("iat")
        
        logger.info(f"📊 Token payload: sub={email}, exp={exp}, type={token_type_claim}, iat={iat}")
        
        # Validaciones
        if email is None:
            logger.error("❌ Token missing 'sub' claim")
            return None
            
        if token_type_claim != token_type:
            logger.error(f"❌ Token type mismatch: expected {token_type}, got {token_type_claim}")
            return None
            
        # ✅ VERIFICAR EXPIRACIÓN CON UTC CORRECTO
        if exp:
            current_timestamp = int(get_current_utc_time().timestamp())
            
            logger.info(f"🕐 Time comparison:")
            logger.info(f"   Current timestamp: {current_timestamp}")
            logger.info(f"   Token exp timestamp: {exp}")
            logger.info(f"   Current UTC: {get_current_utc_time()}")
            logger.info(f"   Token exp UTC: {datetime.fromtimestamp(exp)}")
            
            if current_timestamp > exp:
                remaining = exp - current_timestamp
                logger.error(f"❌ Token expired: {remaining}s ago")
                return None
            else:
                remaining = exp - current_timestamp
                logger.info(f"✅ Token valid, {remaining}s remaining")
        
        return TokenData(email=email)
        
    except JWTError as e:
        logger.error(f"❌ JWT Error: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Token verification error: {e}")
        return None

def get_user_by_email(db: Session, email: str):
    """Obtener usuario por email"""
    user = db.query(User).filter(User.email == email).first()
    if user:
        logger.info(f"✅ User found: {email}")
    else:
        logger.warning(f"❌ User not found: {email}")
    return user

def authenticate_user(db: Session, email: str, password: str):
    """Autenticar usuario con email y contraseña"""
    logger.info(f"🔐 Authenticating user: {email}")
    
    user = get_user_by_email(db, email)
    if not user:
        logger.warning(f"❌ User not found for authentication: {email}")
        return False
        
    if not verify_password(password, user.password):
        logger.warning(f"❌ Invalid password for user: {email}")
        return False
        
    logger.info(f"✅ User authenticated successfully: {email}")
    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtener usuario actual desde token JWT"""
    
    logger.info(f"🔍 Getting current user from token")
    
    # Validar que tenemos credenciales
    if not credentials or not credentials.credentials:
        logger.error("❌ No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization credentials provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    logger.info(f"🔐 Token received: {token[:30]}...")
    
    # Verificar token
    token_data = verify_token(token, "access")
    
    if token_data is None:
        logger.error("❌ Token validation failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obtener usuario de la base de datos
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        logger.error(f"❌ User not found in database: {token_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"✅ Current user retrieved: {user.email}")
    return user

async def get_current_user_from_refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtener usuario desde refresh token"""
    
    logger.info("🔄 Getting user from refresh token")
    
    if not credentials or not credentials.credentials:
        logger.error("❌ No refresh token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    token_data = verify_token(token, "refresh")
    
    if token_data is None:
        logger.error("❌ Refresh token validation failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        logger.error(f"❌ User not found for refresh token: {token_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"✅ User retrieved from refresh token: {user.email}")
    return user

# ✅ FUNCIÓN DE DEBUG ACTUALIZADA
def debug_token(token: str):
    """Función para debuggear tokens en testing"""
    try:
        # Decodificar sin verificación para debug
        unverified = jwt.get_unverified_header(token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        print(f"🔍 DEBUG Token Info:")
        print(f"   Header: {unverified}")
        print(f"   Payload: {payload}")
        print(f"   Subject: {payload.get('sub')}")
        print(f"   Type: {payload.get('type')}")
        print(f"   Expires: {payload.get('exp')}")
        print(f"   Issued: {payload.get('iat')}")
        
        if payload.get('exp'):
            exp_timestamp = payload.get('exp')
            current_timestamp = int(get_current_utc_time().timestamp())
            
            exp_time = datetime.fromtimestamp(exp_timestamp)
            current_time = get_current_utc_time()
            
            print(f"   Exp Time: {exp_time}")
            print(f"   Current: {current_time}")
            print(f"   Exp Timestamp: {exp_timestamp}")
            print(f"   Current Timestamp: {current_timestamp}")
            print(f"   Time Difference: {current_timestamp - exp_timestamp}s")
            print(f"   Valid: {current_timestamp < exp_timestamp}")
        
        return payload
    except Exception as e:
        print(f"❌ Debug token error: {e}")
        return None