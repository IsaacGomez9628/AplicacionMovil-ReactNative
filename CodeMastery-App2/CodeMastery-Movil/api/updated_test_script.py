#!/usr/bin/env python3
"""
Script de prueba actualizado para puerto 8001
"""
import requests
import json
import socket
import sys
from datetime import datetime

# ✅ CONFIGURACIÓN ACTUALIZADA PARA PUERTO 8001
BASE_URL = "http://localhost:8001"
NETWORK_IP = "172.20.10.3"  # Tu IP detectada
NETWORK_URL = f"http://{NETWORK_IP}:8001"
TIMEOUT = 10

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def test_local_connection():
    """Test conexión local"""
    print("🔍 Probando conexión local...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            print("✅ Conexión local OK")
            print(f"   URL: {BASE_URL}")
            print(f"   Status: {response.status_code}")
            return True
        else:
            print(f"❌ Conexión local falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conexión local: {e}")
        return False

def test_network_connection():
    """Test conexión desde red"""
    print("🔍 Probando conexión desde red...")
    
    try:
        response = requests.get(f"{NETWORK_URL}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            print("✅ Conexión de red OK")
            print(f"   URL: {NETWORK_URL}")
            print(f"   Status: {response.status_code}")
            return True
        else:
            print(f"❌ Conexión de red falló: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ No se puede conectar a {NETWORK_URL}")
        print("   Posibles causas:")
        print("   1. uvicorn no está usando --host 0.0.0.0")
        print("   2. Firewall bloqueando puerto 8001")
        print("   3. Puerto no disponible")
        return False
    except Exception as e:
        print(f"❌ Error conexión de red: {e}")
        return False

def test_port_accessibility():
    """Test accesibilidad del puerto"""
    print("🔍 Probando accesibilidad del puerto...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((NETWORK_IP, 8001))
        sock.close()
        
        if result == 0:
            print("✅ Puerto 8001 accesible")
            return True
        else:
            print("❌ Puerto 8001 no accesible")
            print("   Soluciones:")
            print("   1. Verificar que uvicorn usa: --host 0.0.0.0 --port 8001")
            print("   2. Abrir puerto en firewall de Windows")
            return False
    except Exception as e:
        print(f"❌ Error verificando puerto: {e}")
        return False

def test_cors_from_mobile():
    """Test CORS desde perspectiva móvil"""
    print("🔍 Probando CORS desde móvil...")
    
    mobile_origin = f"http://{NETWORK_IP}:19006"
    
    try:
        headers = {
            'Origin': mobile_origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        response = requests.options(
            f"{NETWORK_URL}/auth/register", 
            headers=headers, 
            timeout=TIMEOUT
        )
        
        cors_headers = {k: v for k, v in response.headers.items() 
                       if k.lower().startswith('access-control')}
        
        if cors_headers and response.status_code in [200, 204]:
            print("✅ CORS configurado correctamente")
            print("   Headers CORS:")
            for header, value in cors_headers.items():
                print(f"     {header}: {value}")
            return True
        else:
            print("❌ CORS no configurado correctamente")
            return False
            
    except Exception as e:
        print(f"❌ Error en test CORS: {e}")
        return False

def test_auth_endpoints():
    """Test endpoints de autenticación"""
    print("🔍 Probando endpoints de autenticación...")
    
    # Test registro
    test_user = {
        "name": "Test User Mobile",
        "email": f"mobile_test_{int(datetime.now().timestamp())}@example.com",
        "password": "test123456"
    }
    
    try:
        # Usar URL de red para simular móvil
        response = requests.post(
            f"{NETWORK_URL}/auth/register",
            json=test_user,
            headers={
                'Origin': f'http://{NETWORK_IP}:19006',
                'Content-Type': 'application/json'
            },
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            print("✅ Registro desde red funciona")
            return True
        else:
            print(f"❌ Registro falló: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en registro: {e}")
        return False

def provide_solutions(local_ok, network_ok, port_ok, cors_ok):
    """Proveer soluciones basadas en resultados"""
    print_header("🔧 DIAGNÓSTICO Y SOLUCIONES")
    
    if local_ok and network_ok and port_ok and cors_ok:
        print("🎉 ¡TODO FUNCIONA PERFECTAMENTE!")
        print("\n📱 CONFIGURACIÓN PARA REACT NATIVE:")
        print(f"   YOUR_COMPUTER_IP = \"{NETWORK_IP}\"")
        print(f"   URL base: {NETWORK_URL}")
        print("\n✅ La app móvil debería funcionar ahora")
        return True
    
    print("🚨 PROBLEMAS DETECTADOS:\n")
    
    if not local_ok:
        print("❌ PROBLEMA: FastAPI no responde localmente")
        print("   SOLUCIÓN:")
        print("   cd api")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8001")
        print()
    
    if local_ok and not network_ok:
        print("❌ PROBLEMA: FastAPI no accesible desde red")
        print("   SOLUCIONES:")
        print("   1. Usar --host 0.0.0.0 (no localhost)")
        print("      uvicorn main:app --reload --host 0.0.0.0 --port 8001")
        print("   2. Verificar firewall de Windows")
        print("   3. Temporalmente deshabilitar firewall para testing")
        print()
    
    if local_ok and network_ok and not port_ok:
        print("❌ PROBLEMA: Puerto no accesible")
        print("   SOLUCIONES:")
        print("   1. Abrir puerto 8001 en firewall:")
        print("      New-NetFirewallRule -DisplayName \"FastAPI 8001\" -Direction Inbound -Port 8001 -Protocol TCP -Action Allow")
        print("   2. O usar puerto diferente (8080, 3001, etc.)")
        print()
    
    if not cors_ok:
        print("❌ PROBLEMA: CORS no configurado")
        print("   SOLUCIÓN: Verificar configuración CORS en main.py")
        print()
    
    return False

def main():
    print_header("🚀 TEST COMPLETO - PUERTO 8001")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"URL Local: {BASE_URL}")
    print(f"URL Red: {NETWORK_URL}")
    
    # Tests
    local_ok = test_local_connection()
    network_ok = test_network_connection()
    port_ok = test_port_accessibility()
    cors_ok = test_cors_from_mobile() if network_ok else False
    auth_ok = test_auth_endpoints() if network_ok else False
    
    # Diagnóstico
    success = provide_solutions(local_ok, network_ok, port_ok, cors_ok)
    
    print_header("📊 RESUMEN")
    tests = [
        ("Local Connection", local_ok),
        ("Network Connection", network_ok), 
        ("Port Accessibility", port_ok),
        ("CORS Configuration", cors_ok),
        ("Auth Endpoints", auth_ok)
    ]
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    if success:
        print("\n🎯 PRÓXIMO PASO: Actualizar api.js con IP 192.168.1.8 y puerto 8001")
    else:
        print("\n🔧 REVISA LAS SOLUCIONES ARRIBA")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())