#!/usr/bin/env python3
"""
Script para probar la API y verificar endpoints
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_register():
    """Test register endpoint"""
    print("\n🔍 Testing register endpoint...")
    
    test_user = {
        "name": "Test User",
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "test123456"
    }
    
    print(f"📤 Sending: {json.dumps(test_user, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Register successful!")
            return test_user
        else:
            print(f"❌ Register failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_login(user_data):
    """Test login endpoint"""
    print("\n🔍 Testing login endpoint...")
    
    if not user_data:
        print("⚠️ No user data provided")
        return
    
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    print(f"📤 Sending: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json()["access_token"]
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_me(token):
    """Test /me endpoint"""
    print("\n🔍 Testing /me endpoint...")
    
    if not token:
        print("⚠️ No token provided")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ User info retrieved successfully!")
        else:
            print(f"❌ Failed to get user info: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("=" * 50)
    print("🚀 CODEMASTERY API TEST")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("\n❌ API is not responding. Make sure it's running!")
        return
    
    # Test register
    user = test_register()
    
    # Test login
    if user:
        token = test_login(user)
        
        # Test /me
        if token:
            test_me(token)
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")
    print("=" * 50)

if __name__ == "__main__":
    main()