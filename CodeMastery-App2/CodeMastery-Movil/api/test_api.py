#!/usr/bin/env python3
"""
Script mejorado para probar la API y verificar endpoints
"""
import requests
import json
import sys
import traceback
from datetime import datetime
from urllib.parse import urljoin

# ✅ CONFIGURACIÓN MEJORADA
BASE_URL = "http://localhost:8001"  # Cambia por tu URL
TIMEOUT = 30  # 30 segundos de timeout

# ✅ CONFIGURACIÓN DE SESSION PARA REUTILIZAR CONEXIONES
session = requests.Session()
session.headers.update({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'TestScript/1.0'
})

def print_separator(title=""):
    print("\n" + "="*60)
    if title:
        print(f" {title}")
        print("="*60)

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"🔍 {message}")

def print_response(response, show_full=False):
    """Imprimir información de respuesta de manera estructurada"""
    print(f"   Status: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")
    
    try:
        data = response.json()
        if show_full:
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            # Mostrar solo los primeros campos para evitar spam
            if isinstance(data, dict):
                preview = {k: v for i, (k, v) in enumerate(data.items()) if i < 3}
                if len(data) > 3:
                    preview['...'] = f'({len(data)-3} more fields)'
                print(f"   Response: {json.dumps(preview, indent=2)}")
            else:
                print(f"   Response: {str(data)[:200]}...")
    except json.JSONDecodeError:
        print(f"   Raw Response: {response.text[:200]}...")

def test_server_running():
    """Verificar si el servidor está corriendo"""
    print_info("Verificando si el servidor FastAPI está corriendo...")
    
    try:
        response = session.get(f"{BASE_URL}/", timeout=TIMEOUT)
        
        if response.status_code == 200:
            print_success("Servidor FastAPI está corriendo")
            print_response(response)
            return True
        else:
            print_error(f"Servidor responde con código {response.status_code}")
            print_response(response)
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("No se puede conectar al servidor")
        print("   Verifica que FastAPI esté corriendo en el puerto 8000")
        print("   Comando: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        return False
    except requests.exceptions.Timeout:
        print_error(f"Timeout después de {TIMEOUT} segundos")
        return False
    except Exception as e:
        print_error(f"Error inesperado: {e}")
        traceback.print_exc()
        return False

def test_health_endpoint():
    """Test del endpoint de salud"""
    print_info("Probando endpoint /health...")
    
    try:
        response = session.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        
        if response.status_code == 200:
            print_success("Endpoint /health funciona correctamente")
            print_response(response, show_full=True)
            return True
        else:
            print_error(f"Health endpoint falló con código {response.status_code}")
            print_response(response)
            return False
            
    except Exception as e:
        print_error(f"Error en health endpoint: {e}")
        return False

def test_cors_preflight():
    """Test de CORS preflight request"""
    print_info("Probando CORS preflight (OPTIONS)...")
    
    try:
        headers = {
            'Origin': 'http://localhost:19006',  # Típico de Expo
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        response = session.options(f"{BASE_URL}/auth/register", 
                                 headers=headers, 
                                 timeout=TIMEOUT)
        
        print(f"   Status: {response.status_code}")
        print(f"   CORS Headers:")
        cors_headers = {k: v for k, v in response.headers.items() 
                       if k.lower().startswith('access-control')}
        
        for header, value in cors_headers.items():
            print(f"     {header}: {value}")
        
        if response.status_code in [200, 204] and cors_headers:
            print_success("CORS preflight configurado correctamente")
            return True
        else:
            print_error("CORS preflight no configurado o no funcionando")
            return False
            
    except Exception as e:
        print_error(f"Error en CORS test: {e}")
        return False

def test_register_endpoint():
    """Test del endpoint de registro"""
    print_info("Probando endpoint de registro...")
    
    test_user = {
        "name": "Test User",
        "email": f"test_{int(datetime.now().timestamp())}@example.com",
        "password": "test123456"
    }
    
    print(f"   Datos de prueba: {json.dumps({**test_user, 'password': '***'}, indent=2)}")
    
    try:
        response = session.post(
            f"{BASE_URL}/auth/register",
            json=test_user,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            print_success("Registro exitoso")
            print_response(response)
            return test_user, response.json()
        elif response.status_code == 400:
            # Podría ser email duplicado, es normal en testing
            print_info("Email ya registrado (normal en testing)")
            print_response(response)
            return test_user, None
        elif response.status_code == 422:
            print_error("Error de validación en registro")
            print_response(response, show_full=True)
            return None, None
        else:
            print_error(f"Registro falló con código {response.status_code}")
            print_response(response, show_full=True)
            return None, None
            
    except Exception as e:
        print_error(f"Error en registro: {e}")
        traceback.print_exc()
        return None, None

def test_login_endpoint(user_data):
    """Test del endpoint de login"""
    print_info("Probando endpoint de login...")
    
    if not user_data:
        print_error("No hay datos de usuario para login")
        return None
    
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    try:
        response = session.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            print_success("Login exitoso")
            print_response(response)
            token_data = response.json()
            return token_data.get("access_token")
        elif response.status_code == 401:
            print_error("Credenciales incorrectas (normal si el usuario no existe)")
            print_response(response)
            return None
        else:
            print_error(f"Login falló con código {response.status_code}")
            print_response(response, show_full=True)
            return None
            
    except Exception as e:
        print_error(f"Error en login: {e}")
        return None

def test_protected_endpoint(token):
    """Test de endpoint protegido /auth/me"""
    print_info("Probando endpoint protegido /auth/me...")
    
    if not token:
        print_error("No hay token para probar endpoint protegido")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = session.get(
            f"{BASE_URL}/auth/me",
            headers=headers,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            print_success("Endpoint protegido funciona correctamente")
            print_response(response)
            return True
        elif response.status_code == 401:
            print_error("Token inválido o expirado")
            print_response(response)
            return False
        else:
            print_error(f"Endpoint protegido falló con código {response.status_code}")
            print_response(response)
            return False
            
    except Exception as e:
        print_error(f"Error en endpoint protegido: {e}")
        return False

def test_courses_endpoint():
    """Test del endpoint de cursos"""
    print_info("Probando endpoint de cursos...")
    
    try:
        response = session.get(f"{BASE_URL}/courses/", timeout=TIMEOUT)
        
        if response.status_code == 401:
            print_info("Endpoint de cursos requiere autenticación (esperado)")
            return True
        elif response.status_code == 200:
            print_success("Endpoint de cursos accesible")
            print_response(response)
            return True
        else:
            print_error(f"Endpoint de cursos falló con código {response.status_code}")
            print_response(response)
            return False
            
    except Exception as e:
        print_error(f"Error en endpoint de cursos: {e}")
        return False

def run_all_tests():
    """Ejecutar todos los tests"""
    print_separator("🚀 PRUEBAS DE API FASTAPI")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"URL Base: {BASE_URL}")
    
    results = {}
    
    # Test 1: Servidor corriendo
    print_separator("1. Verificación de Servidor")
    results['server'] = test_server_running()
    
    if not results['server']:
        print_error("❌ SERVIDOR NO DISPONIBLE - Deteniendo pruebas")
        return results
    
    # Test 2: Health endpoint
    print_separator("2. Endpoint de Salud")
    results['health'] = test_health_endpoint()
    
    # Test 3: CORS preflight
    print_separator("3. Configuración CORS")
    results['cors'] = test_cors_preflight()
    
    # Test 4: Registro
    print_separator("4. Endpoint de Registro")
    user_data, _ = test_register_endpoint()
    results['register'] = user_data is not None
    
    # Test 5: Login
    print_separator("5. Endpoint de Login")
    token = None
    if user_data:
        token = test_login_endpoint(user_data)
        results['login'] = token is not None
    else:
        print_info("Saltando test de login (no hay usuario)")
        results['login'] = False
    
    # Test 6: Endpoint protegido
    print_separator("6. Endpoint Protegido")
    results['protected'] = test_protected_endpoint(token)
    
    # Test 7: Otros endpoints
    print_separator("7. Otros Endpoints")
    results['courses'] = test_courses_endpoint()
    
    # Resumen
    print_separator("📊 RESUMEN DE RESULTADOS")
    
    passed = sum(results.values())
    total = len(results)
    
    print(f"✅ Pruebas exitosas: {passed}/{total}")
    print(f"❌ Pruebas fallidas: {total - passed}/{total}")
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name.upper()}: {status}")
    
    if passed == total:
        print_success("🎉 ¡TODAS LAS PRUEBAS PASARON!")
    else:
        print_error("🚨 ALGUNAS PRUEBAS FALLARON")
        print("\n🔧 ACCIONES RECOMENDADAS:")
        if not results['server']:
            print("   • Inicia el servidor: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        if not results['cors']:
            print("   • Revisa la configuración de CORS en main.py")
        if not results['register'] or not results['login']:
            print("   • Verifica los endpoints de autenticación")
    
    return results

if __name__ == "__main__":
    try:
        results = run_all_tests()
        
        # Exit code basado en resultados
        if all(results.values()):
            sys.exit(0)  # Éxito
        else:
            sys.exit(1)  # Error
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Pruebas interrumpidas por el usuario")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n💥 Error crítico en el script: {e}")
        traceback.print_exc()
        sys.exit(1)