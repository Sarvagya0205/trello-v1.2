from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.list import List
from app.schemas.list import ListCreate, ListUpdate, ListOut

router = APIRouter(prefix="/api/lists", tags=["lists"])


@router.post("", response_model=ListOut, status_code=201)
def create_list(payload: ListCreate, db: Session = Depends(get_db)):
    lst = List(**payload.model_dump())
    db.add(lst)
    db.commit()
    db.refresh(lst)
    return lst


@router.patch("/{list_id}", response_model=ListOut)
def update_list(list_id: int, payload: ListUpdate, db: Session = Depends(get_db)):
    lst = db.query(List).filter(List.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(lst, key, value)
    db.commit()
    db.refresh(lst)
    return lst


@router.delete("/{list_id}", status_code=204)
def delete_list(list_id: int, db: Session = Depends(get_db)):
    lst = db.query(List).filter(List.id == list_id).first()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    db.delete(lst)
    db.commit()
