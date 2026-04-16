from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.card import Card, CardMember
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate, CardOut

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.post("", response_model=CardOut, status_code=201)
def create_card(payload: CardCreate, db: Session = Depends(get_db)):
    card = Card(**payload.model_dump())
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("/{card_id}", response_model=CardOut)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.patch("/{card_id}", response_model=CardOut)
def update_card(card_id: int, payload: CardUpdate, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(card, key, value)
    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=204)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()


@router.post("/{card_id}/members/{user_id}", status_code=204)
def add_card_member(card_id: int, user_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    exists = db.query(CardMember).filter(CardMember.card_id == card_id, CardMember.user_id == user_id).first()
    if not exists:
        db.add(CardMember(card_id=card_id, user_id=user_id))
        db.commit()


@router.delete("/{card_id}/members/{user_id}", status_code=204)
def remove_card_member(card_id: int, user_id: int, db: Session = Depends(get_db)):
    member = db.query(CardMember).filter(CardMember.card_id == card_id, CardMember.user_id == user_id).first()
    if member:
        db.delete(member)
        db.commit()


@router.post("/{card_id}/labels/{label_id}", status_code=204)
def add_card_label(card_id: int, label_id: int, db: Session = Depends(get_db)):
    from app.models.label import CardLabel
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    exists = db.query(CardLabel).filter(CardLabel.card_id == card_id, CardLabel.label_id == label_id).first()
    if not exists:
        db.add(CardLabel(card_id=card_id, label_id=label_id))
        db.commit()


@router.delete("/{card_id}/labels/{label_id}", status_code=204)
def remove_card_label(card_id: int, label_id: int, db: Session = Depends(get_db)):
    from app.models.label import CardLabel
    cl = db.query(CardLabel).filter(CardLabel.card_id == card_id, CardLabel.label_id == label_id).first()
    if cl:
        db.delete(cl)
        db.commit()
