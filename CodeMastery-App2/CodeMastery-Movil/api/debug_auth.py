# ✅ ARCHIVO MEJORADO: api/debug_auth.py
#!/usr/bin/env python3
"""
Script de debug mejorado para probar autenticación
"""
import requests
import json
from datetime import datetime
from auth import debug_token  # Importar función de debug

BASE_URL = "http://localhost:8001"

def test_complete_auth_flow():
    """Test completo del flujo de autenticación con debug"""
    print("🧪 === TEST COMPLETO DE AUTENTICACIÓN ===")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # 1. Test de salud
    print("\n1️⃣ === HEALTH CHECK ===")
    try:
        health_response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health Status: {health_response.status_code}")
        print(f"📊 Response: {health_response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # 2. Registro de usuario
    print("\n2️⃣ === REGISTRO DE USUARIO ===")
    timestamp = int(datetime.now().timestamp())
    test_user = {
        "name": "Debug User",
        "email": f"debug_{timestamp}@test.com",
        "password": "debug123456"
    }
    
    try:
        register_response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        print(f"📝 Register Status: {register_response.status_code}")
        
        if register_response.status_code == 200:
            user_data = register_response.json()
            print(f"✅ User registered: {user_data.get('email')}")
        else:
            print(f"❌ Register failed: {register_response.text}")
            return False
    except Exception as e:
        print(f"❌ Register error: {e}")
        return False
    
    # 3. Login y obtención de tokens
    print("\n3️⃣ === LOGIN Y TOKENS ===")
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"🔐 Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            tokens = login_response.json()
            access_token = tokens["access_token"]
            refresh_token = tokens["refresh_token"]
            
            print(f"✅ Login successful")
            print(f"🔑 Access Token: {access_token[:50]}...")
            print(f"🔄 Refresh Token: {refresh_token[:50]}...")
            
            # Debug del token
            print("\n🔍 === DEBUG ACCESS TOKEN ===")
            debug_token(access_token)
            
        else:
            print(f"❌ Login failed: {login_response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # 4. Test endpoint protegido /auth/me
    print("\n4️⃣ === TEST /auth/me ===")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"👤 /auth/me Status: {me_response.status_code}")
        
        if me_response.status_code == 200:
            user_info = me_response.json()
            print(f"✅ User info retrieved: {user_info.get('email')}")
        else:
            print(f"❌ /auth/me failed: {me_response.text}")
            print(f"📋 Request headers: {headers}")
            
            # Debug adicional del token
            print("\n🔍 === RE-DEBUG TOKEN ===")
            debug_token(access_token)
            
    except Exception as e:
        print(f"❌ /auth/me error: {e}")
    
    # 5. Test endpoint de cursos
    print("\n5️⃣ === TEST /courses ===")
    try:
        courses_response = requests.get(f"{BASE_URL}/courses/", headers=headers)
        print(f"📚 /courses Status: {courses_response.status_code}")
        
        if courses_response.status_code == 200:
            courses = courses_response.json()
            print(f"✅ Courses retrieved: {len(courses) if isinstance(courses, list) else 'N/A'} items")
        else:
            print(f"❌ /courses failed: {courses_response.text}")
            
    except Exception as e:
        print(f"❌ /courses error: {e}")
    
    # 6. Test refresh token
    print("\n6️⃣ === TEST REFRESH TOKEN ===")
    refresh_headers = {
        "Authorization": f"Bearer {refresh_token}",
        "Content-Type": "application/json"
    }
    
    try:
        refresh_response = requests.post(f"{BASE_URL}/auth/refresh", headers=refresh_headers)
        print(f"🔄 Refresh Status: {refresh_response.status_code}")
        
        if refresh_response.status_code == 200:
            new_tokens = refresh_response.json()
            new_access_token = new_tokens["access_token"]
            print(f"✅ New tokens obtained")
            print(f"🔑 New Access Token: {new_access_token[:50]}...")
            
            # Test con nuevo token
            print("\n🧪 === TEST CON NUEVO TOKEN ===")
            new_headers = {
                "Authorization": f"Bearer {new_access_token}",
                "Content-Type": "application/json"
            }
            
            me_response_new = requests.get(f"{BASE_URL}/auth/me", headers=new_headers)
            print(f"👤 /auth/me con nuevo token: {me_response_new.status_code}")
            
            if me_response_new.status_code == 200:
                print("✅ Nuevo token funciona correctamente")
            else:
                print(f"❌ Nuevo token falló: {me_response_new.text}")
                
        else:
            print(f"❌ Refresh failed: {refresh_response.text}")
            
    except Exception as e:
        print(f"❌ Refresh error: {e}")
    
    print("\n🏁 === FIN DEL TEST ===")
    return True

def test_token_manually(token):
    """Test manual de un token específico"""
    print(f"\n🔍 === MANUAL TOKEN TEST ===")
    print(f"Token: {token[:50]}...")
    
    # Debug del token
    payload = debug_token(token)
    
    if payload:
        # Test con el token
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            print(f"Response Status: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Request error: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Test manual con token específico
        token = sys.argv[1]
        test_token_manually(token)
    else:
        # Test completo
        test_complete_auth_flow()