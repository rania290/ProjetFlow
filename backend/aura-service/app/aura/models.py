import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base

class AuraAlert(Base):
    __tablename__ = 'aura_alerts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), index=True) # project_id in project_db
    type = Column(String(30))   # 'task_late' | 'sprint_at_risk' | 'budget_exceeded' | 'member_overloaded'
    severity = Column(String(10))  # 'info' | 'warning' | 'critical'
    title = Column(String(200))
    message = Column(Text)
    target_id = Column(UUID(as_uuid=True), nullable=True) # id of task or sprint
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
