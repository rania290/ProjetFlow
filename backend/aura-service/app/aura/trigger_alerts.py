import sys
import os
import asyncio

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

from app.aura.scheduler import run_analysis

async def main():
    print("=== Manually triggering Aura Analysis (Alerts) ===")
    await run_analysis()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
