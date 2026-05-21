import sys
import os
from sqlalchemy import text
from datetime import datetime, timedelta

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Load .env manually
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
try:
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())
except:
    pass

from app.database import SessionLocal

def create_late_task():
    with SessionLocal() as db:
        # Get first project
        project = db.execute(text("SELECT id FROM projects LIMIT 1")).mappings().first()
        if not project:
            print("No project found.")
            return
        
        pid = project['id']
        late_date = datetime.now() - timedelta(days=2)
        
        print(f"Creating late task for project {pid}...")
        db.execute(text("""
            INSERT INTO tasks (id, project_id, title, status, priority, "dueDate", created_at, updated_at)
            VALUES (gen_random_uuid(), :pid, 'Tâche Urgente en Retard (TEST IA)', 'IN_PROGRESS', 'CRITICAL', :due, NOW(), NOW())
        """), {"pid": pid, "due": late_date})
        db.commit()
        print("Late task created successfully.")

if __name__ == "__main__":
    create_late_task()
