from fastapi import FastAPI, HTTPException, Depends
from datetime import datetime
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# pydantic model
class NoteBase(BaseModel):
    title: str
    session_type: str
    session_duration: float
    observation: str
    created_at: datetime
    updated_at: datetime | None

class NoteModel(NoteBase):
    id: int
    
    class Config:
        from_attributes = True
    
# db dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session, Depends(get_db)]
models.Base.metadata.create_all(bind=engine)

@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/notes/", response_model=NoteModel)
async def create_note(note: NoteBase, db: db_dependency):
    db_note = models.Note(**note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.get("/notes/")
async def get_notes(db: db_dependency, skip: int = 0, limit: int = 100):
    notes = db.query(models.Note).offset(skip).limit(limit).all()
    return notes

# get a specific note
@app.get("/notes/{note_id}", response_model=NoteModel)
async def get_note(note_id: int, db: db_dependency):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.put("/notes/{note_id}", response_model=NoteModel)
async def update_note(note_id: int, note: NoteBase, db: db_dependency):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note_data = note.dict(exclude_unset=True)
    note_data["updated_at"] = datetime.utcnow()
    
    for key, value in note_data.items():
        setattr(db_note, key, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note

@app.delete("/notes/{note_id}")
async def delete_note(note_id: int, db: db_dependency):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}



