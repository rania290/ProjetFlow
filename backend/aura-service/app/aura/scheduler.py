import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import text
from .engine import detect_late_tasks, detect_at_risk_sprints
from .models import AuraAlert
from ..database import SessionLocal

logger = logging.getLogger(__name__)

async def run_analysis():
    logger.info("Running aura scheduler analysis...")
    with SessionLocal() as db:
        try:
            projects = db.execute(text("SELECT id FROM projects WHERE status = 'ACTIVE'")).mappings().all()
            for p in projects:
                pid = str(p['id'])
                
                late_tasks = await detect_late_tasks(pid)
                for task in late_tasks:
                    existing = db.query(AuraAlert).filter_by(
                        project_id=pid, target_id=str(task['task_id']), type='task_late', is_read=False
                    ).first()
                    
                    if not existing:
                        alert = AuraAlert(
                            project_id=pid,
                            type='task_late',
                            severity='warning',
                            title=f"Tâche en retard: {task['title']}",
                            message=f"La tâche est en retard de {task['days_late']} jours. Assigné à: {task['assignee_name']}",
                            target_id=str(task['task_id'])
                        )
                        db.add(alert)
                
                db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Scheduler error: {e}")

def start_scheduler():
    scheduler = AsyncIOScheduler()
    scheduler.add_job(run_analysis, 'interval', hours=2)
    scheduler.start()
    logger.info("Aura scheduler started.")
