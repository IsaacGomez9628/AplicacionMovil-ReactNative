from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Course, Module, Lesson, User
from auth import get_password_hash

# Crear las tablas
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    try:
        # Crear usuario administrador
        admin_user = User(
            name="Administrador",
            email="admin@example.com",
            password=get_password_hash("admin123")
        )
        db.add(admin_user)
        
        # Crear usuario de prueba
        test_user = User(
            name="Usuario de Prueba",
            email="test@example.com",
            password=get_password_hash("test123")
        )
        db.add(test_user)
        
        # Crear curso de ejemplo
        python_course = Course(
            id="python-basics",
            title="Fundamentos de Python",
            description="Aprende los conceptos básicos de programación en Python",
            icon="language-python",
            color_class="#3776ab"
        )
        db.add(python_course)
        
        # Crear módulo de ejemplo
        variables_module = Module(
            id="python-variables",
            course_id="python-basics",
            title="Variables y Tipos de Datos",
            description="Aprende sobre variables, números, strings y booleanos",
            position=1
        )
        db.add(variables_module)
        
        # Crear lección de ejemplo
        variables_lesson = Lesson(
            module_id="python-variables",
            title="Creando tu primera variable",
            theory="""
            En Python, una variable es un contenedor que almacena datos. 
            Para crear una variable, simplemente asigna un valor usando el signo igual (=).
            
            Ejemplo:
            nombre = "Juan"
            edad = 25
            es_estudiante = True
            """,
            practice_instructions="""
            Crea una variable llamada 'mi_nombre' y asígnale tu nombre como string.
            Luego crea una variable llamada 'mi_edad' y asígnale tu edad como número.
            """,
            practice_initial_code="""# Escribe tu código aquí
mi_nombre = 
mi_edad = """,
            practice_solution="""mi_nombre = "Juan"
mi_edad = 25""",
            position=1
        )
        db.add(variables_lesson)
        
        # Crear curso de JavaScript
        js_course = Course(
            id="javascript-basics",
            title="JavaScript Fundamentals",
            description="Learn the basics of JavaScript programming",
            icon="language-javascript",
            color_class="#f7df1e"
        )
        db.add(js_course)
        
        # Crear módulo de JavaScript
        js_variables_module = Module(
            id="js-variables",
            course_id="javascript-basics",
            title="Variables and Data Types",
            description="Learn about var, let, const and data types",
            position=1
        )
        db.add(js_variables_module)
        
        # Crear lección de JavaScript
        js_variables_lesson = Lesson(
            module_id="js-variables",
            title="Declaring Variables",
            theory="""
            In JavaScript, you can declare variables using var, let, or const.
            
            - let: for variables that can change
            - const: for constants that won't change
            - var: older way (avoid in modern JavaScript)
            
            Example:
            let name = "John";
            const age = 25;
            """,
            practice_instructions="""
            Create a variable called 'myName' using let and assign your name.
            Create a constant called 'birthYear' and assign your birth year.
            """,
            practice_initial_code="""// Write your code here
let myName = 
const birthYear = """,
            practice_solution="""let myName = "John";
const birthYear = 1998;""",
            position=1
        )
        db.add(js_variables_lesson)
        
        db.commit()
        print("✅ Base de datos poblada con datos de ejemplo!")
        
    except Exception as e:
        print(f"❌ Error al poblar la base de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
