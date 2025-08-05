#!/bin/bash

echo "🚀 Iniciando Learning Platform API..."

# Activar entorno virtual si existe
if [ -d "venv" ]; then
    echo "📦 Activando entorno virtual..."
    source venv/bin/activate
fi

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install -r requirements.txt

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "⚙️ Creando archivo .env..."
    cp .env.example .env
    echo "✏️ Por favor, edita el archivo .env con tus configuraciones"
fi

# Poblar base de datos con datos de ejemplo
echo "🌱 Poblando base de datos con datos de ejemplo..."
python seed_data.py

# Iniciar servidor
echo "🎯 Iniciando servidor en http://localhost:8000"
echo "📚 Documentación disponible en http://localhost:8000/docs"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
