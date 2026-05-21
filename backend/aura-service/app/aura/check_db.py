import sys
import os
from sqlalchemy import text

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

def check_data():
    with SessionLocal() as db:
        print("=== Checking for late tasks ===")
        late = db.execute(text("SELECT id, title, \"dueDate\" FROM tasks WHERE status != 'DONE' AND \"dueDate\" < NOW()")).mappings().all()
        print(f"Number of late tasks found: {len(late)}")
        for t in late:
            print(f"  - {t['title']} (Due: {t['dueDate']})")

        print("\n=== Checking aura_alerts table ===")
        alerts = db.execute(text("SELECT id, title, type, created_at FROM aura_alerts ORDER BY created_at DESC LIMIT 5")).mappings().all()
        print(f"Number of alerts in DB: {len(alerts)}")
        for a in alerts:
            print(f"  - [{a['type']}] {a['title']} (Created: {a['created_at']})")

if __name__ == "__main__":
    check_data()
