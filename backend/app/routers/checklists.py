from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.checklist import Checklist, ChecklistItem
from app.schemas.checklist import (
    ChecklistCreate, ChecklistUpdate, ChecklistOut,
    ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemOut
)

router = APIRouter(prefix="/api", tags=["checklists"])


@router.post("/cards/{card_id}/checklists", response_model=ChecklistOut, status_code=201)
def create_checklist(card_id: int, payload: ChecklistCreate, db: Session = Depends(get_db)):
    checklist = Checklist(card_id=card_id, **payload.model_dump())
    db.add(checklist)
    db.commit()
    db.refresh(checklist)
    return checklist


@router.patch("/checklists/{checklist_id}", response_model=ChecklistOut)
def update_checklist(checklist_id: int, payload: ChecklistUpdate, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(checklist, key, value)
    db.commit()
    db.refresh(checklist)
    return checklist


@router.delete("/checklists/{checklist_id}", status_code=204)
def delete_checklist(checklist_id: int, db: Session = Depends(get_db)):
    checklist = db.query(Checklist).filter(Checklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    db.delete(checklist)
    db.commit()


@router.post("/checklists/{checklist_id}/items", response_model=ChecklistItemOut, status_code=201)
def create_checklist_item(checklist_id: int, payload: ChecklistItemCreate, db: Session = Depends(get_db)):
    item = ChecklistItem(checklist_id=checklist_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/checklist-items/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(item_id: int, payload: ChecklistItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/checklist-items/{item_id}", status_code=204)
def delete_checklist_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    db.delete(item)
    db.commit()
