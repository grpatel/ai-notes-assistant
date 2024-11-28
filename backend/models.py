from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, func

class Note(Base):
    __tablename__ = 'notes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    session_type = Column(String(50), index=True)
    session_duration = Column(Float)
    observation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
