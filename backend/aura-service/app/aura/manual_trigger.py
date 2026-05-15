import sys
import os
import asyncio

# Setup paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Load .env manually
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
for encoding in ['utf-8', 'windows-1252', 'latin-1']:
    try:
        with open(env_path, 'r', encoding=encoding) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, _, value = line.partition('=')
                    os.environ.setdefault(key.strip(), value.strip())
        break
    except:
        pass

from sqlalchemy import text
from app.database import SessionLocal
from app.aura.engine import generate_weekly_report

# Step 1: List all projects and their statuses
print("=== Projects in Database ===")
with SessionLocal() as db:
    projects = db.execute(text("SELECT id, name, status FROM projects")).mappings().all()
    for p in projects:
        print(f"  ID: {p['id']} | Name: {p['name']} | Status: {p['status']}")

# Step 2: Generate report for ALL projects regardless of status
print("\n=== Generating Reports for ALL Projects ===")
async def generate_all():
    with SessionLocal() as db:
        projects = db.execute(text("SELECT id, name FROM projects")).mappings().all()
        for p in projects:
            pid = str(p['id'])
            name = p['name']
            print(f"Generating report for: {name} ({pid})")
            result = await generate_weekly_report(pid)
            if 'error' in result:
                print(f"  ERROR: {result['error']}")
            else:
                print(f"  SUCCESS: Report ID {result.get('id')} created at {result.get('created_at')}")

asyncio.run(generate_all())
print("\nDone.")
