from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from . import engine, models
from ..database import get_db

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    project_id: str
    user_id: str = "system"

@router.post("/aura/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        response = await engine.chat(req.message, req.project_id, req.user_id)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aura/insights/{project_id}")
async def get_insights(project_id: str):
    try:
        insights = await engine.get_quick_insights(project_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aura/alerts/{project_id}")
async def get_alerts(project_id: str, db: Session = Depends(get_db)):
    alerts = db.query(models.AuraAlert).filter(
        models.AuraAlert.project_id == project_id,
        models.AuraAlert.is_read == False
    ).all()
    return alerts

@router.get("/aura/analysis/{project_id}")
async def get_analysis(project_id: str):
    try:
        analysis = await engine.analyze_project_progress(project_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aura/report/{project_id}")
async def get_report(project_id: str):
    try:
        report = await engine.generate_weekly_report(project_id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aura/reports/{project_id}")
async def get_reports_list(project_id: str, db: Session = Depends(get_db)):
    reports = db.query(models.AuraReport).filter(
        models.AuraReport.project_id == project_id
    ).order_by(models.AuraReport.created_at.desc()).all()
    return reports

@router.get("/aura/reports/detail/{report_id}")
async def get_report_detail(report_id: str, db: Session = Depends(get_db)):
    report = db.query(models.AuraReport).filter(models.AuraReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

class SuggestTasksRequest(BaseModel):
    title: str
    description: str

@router.post("/aura/suggest-tasks")
async def suggest_tasks(req: SuggestTasksRequest):
    try:
        tasks = await engine.suggest_tasks_for_story(req.title, req.description)
        return {"tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/aura/alerts/dismiss/{alert_id}")
async def dismiss_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(models.AuraAlert).filter(models.AuraAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"status": "success"}

class RecommendAssigneeRequest(BaseModel):
    project_id: str
    title: str
    description: str

@router.post("/aura/recommend-assignee")
async def recommend_assignee(req: RecommendAssigneeRequest):
    try:
        recommendation = await engine.recommend_assignee(req.project_id, req.title, req.description)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
