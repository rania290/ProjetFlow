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
    conversation_id: str = None

@router.post("/aura/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        result = await engine.chat(req.message, req.project_id, req.user_id, req.conversation_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aura/conversations/{project_id}")
async def get_conversations(project_id: str, user_id: str = "system", db: Session = Depends(get_db)):
    convs = db.query(models.AuraConversation).filter(
        models.AuraConversation.project_id == project_id,
        models.AuraConversation.user_id == user_id
    ).order_by(models.AuraConversation.updated_at.desc()).all()
    return convs

@router.get("/aura/conversations/{conversation_id}/messages")
async def get_conversation_messages(conversation_id: str, db: Session = Depends(get_db)):
    msgs = db.query(models.AuraMessage).filter(
        models.AuraMessage.conversation_id == conversation_id
    ).order_by(models.AuraMessage.created_at.asc()).all()
    return msgs

@router.delete("/aura/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    db.query(models.AuraMessage).filter(models.AuraMessage.conversation_id == conversation_id).delete()
    db.query(models.AuraConversation).filter(models.AuraConversation.id == conversation_id).delete()
    db.commit()
    return {"status": "success"}

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
