import asyncio
import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

async def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            print("❌ DATABASE_URL not found in environment variables")
            return False
            
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection failed - unexpected response")
                return False
                
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

async def test_api_endpoints():
    """Test API endpoints are accessible"""
    import requests
    
    print("\n🔍 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            
        # Test root endpoint
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

async def main():
    print("🚀 CodeMastery API Connection Test\n")
    
    db_ok = await test_database_connection()
    api_ok = await test_api_endpoints()
    
    print(f"\n📊 Results:")
    print(f"Database: {'✅ OK' if db_ok else '❌ FAILED'}")
    print(f"API: {'✅ OK' if api_ok else '❌ FAILED'}")
    
    if db_ok and api_ok:
        print("\n🎉 All tests passed! Your API should work correctly.")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed. Check the configuration above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())