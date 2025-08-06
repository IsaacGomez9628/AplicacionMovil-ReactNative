#!/usr/bin/env python3
"""
Test específico para verificar conectividad desde dispositivos móviles
"""
import requests
import json
import socket
import subprocess
import sys

def get_local_ip():
    """Obtener IP local de la computadora"""
    try:
        # Crear socket para obtener IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return None

def test_mobile_connectivity():
    """Probar conectividad desde perspectiva móvil"""
    print("📱 PRUEBA DE CONECTIVIDAD MÓVIL")
    print("=" * 50)
    
    # Obtener IP local
    local_ip = get_local_ip()
    if not local_ip:
        print("❌ No se pudo obtener IP local")
        return False
    
    print(f"🌐 IP Local detectada: {local_ip}")
    
    # URLs a probar (localhost + IP local)
    urls_to_test = [
        f"http://localhost:8001",
        f"http://127.0.0.1:8001", 
        f"http://{local_ip}:8001"
    ]
    
    results = {}
    
    for url in urls_to_test:
        print(f"\n🔍 Probando: {url}")
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ {url} - ACCESIBLE")
                results[url] = True
            else:
                print(f"❌ {url} - Status: {response.status_code}")
                results[url] = False
        except Exception as e:
            print(f"❌ {url} - Error: {e}")
            results[url] = False
    
    # Test específico de CORS desde IP móvil
    mobile_origin = f"http://{local_ip}:19006"  # Típico de Expo
    print(f"\n🧪 Probando CORS desde origen móvil: {mobile_origin}")
    
    try:
        headers = {
            'Origin': mobile_origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
        
        response = requests.options(
            f"http://{local_ip}:8001/auth/register", 
            headers=headers, 
            timeout=5
        )
        
        cors_headers = {k: v for k, v in response.headers.items() 
                       if k.lower().startswith('access-control')}
        
        if cors_headers and response.status_code in [200, 204]:
            print("✅ CORS funciona para dispositivos móviles")
            print("📋 Headers CORS:")
            for header, value in cors_headers.items():
                print(f"   {header}: {value}")
        else:
            print("❌ CORS no configurado para dispositivos móviles")
            
    except Exception as e:
        print(f"❌ Error en test CORS móvil: {e}")
    
    # Resumen
    print(f"\n📊 RESUMEN:")
    accessible_urls = [url for url, success in results.items() if success]
    
    if accessible_urls:
        print(f"✅ URLs accesibles: {len(accessible_urls)}")
        for url in accessible_urls:
            print(f"   {url}")
            
        print(f"\n📱 CONFIGURACIÓN PARA REACT NATIVE:")
        print(f"   Actualiza YOUR_COMPUTER_IP = \"{local_ip}\"")
        print(f"   URL base será: http://{local_ip}:8001")
        
        return True
    else:
        print("❌ Ninguna URL accesible")
        return False

def test_ports():
    """Verificar que el puerto esté abierto"""
    local_ip = get_local_ip()
    print(f"\n🔌 Verificando puerto 8000 en {local_ip}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((local_ip, 8001))
        sock.close()
        
        if result == 0:
            print("✅ Puerto 8000 abierto y accesible")
            return True
        else:
            print("❌ Puerto 8000 no accesible")
            return False
    except Exception as e:
        print(f"❌ Error verificando puerto: {e}")
        return False

def main():
    print("🚀 TEST DE CONECTIVIDAD PARA DISPOSITIVOS MÓVILES")
    print("=" * 60)
    
    # Verificar que FastAPI esté corriendo
    try:
        response = requests.get("http://localhost:8001/health", timeout=3)
        if response.status_code != 200:
            print("❌ FastAPI no está corriendo en localhost:8000")
            print("   Ejecuta: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
            sys.exit(1)
    except:
        print("❌ FastAPI no está corriendo en localhost:8000")
        print("   Ejecuta: uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        sys.exit(1)
    
    print("✅ FastAPI está corriendo")
    
    # Test de conectividad móvil
    mobile_ok = test_mobile_connectivity()
    
    # Test de puertos
    port_ok = test_ports()
    
    # Resultado final
    if mobile_ok and port_ok:
        print("\n🎉 ¡TODO LISTO PARA DISPOSITIVOS MÓVILES!")
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Actualizar YOUR_COMPUTER_IP en src/services/api.js")
        print("2. Reiniciar la app React Native")
        print("3. Probar registro/login desde la app")
    else:
        print("\n🚨 HAY PROBLEMAS DE CONECTIVIDAD")
        print("\n🔧 POSIBLES SOLUCIONES:")
        print("1. Asegurar que uvicorn use --host 0.0.0.0")
        print("2. Verificar firewall de Windows")
        print("3. Comprobar que dispositivo esté en misma red WiFi")

if __name__ == "__main__":
    main()