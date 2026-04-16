from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.card import Card, CardMember
from app.models.label import CardLabel
from app.schemas.card import CardSummary

router = APIRouter(prefix="/api/boards", tags=["search"])


@router.get("/{board_id}/search", response_model=List[CardSummary])
def search_cards(
    board_id: int,
    q: Optional[str] = Query(None),
    labels: Optional[str] = Query(None),
    members: Optional[str] = Query(None),
    due: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    from app.models.list import List as ListModel
    from sqlalchemy import and_
    from datetime import datetime, timezone

    query = (
        db.query(Card)
        .join(ListModel, Card.list_id == ListModel.id)
        .filter(ListModel.board_id == board_id, Card.is_archived == False)
    )

    if q:
        query = query.filter(Card.title.ilike(f"%{q}%"))

    if labels:
        label_ids = [int(x) for x in labels.split(",") if x.isdigit()]
        if label_ids:
            query = query.join(CardLabel, Card.id == CardLabel.card_id).filter(
                CardLabel.label_id.in_(label_ids)
            )

    if members:
        member_ids = [int(x) for x in members.split(",") if x.isdigit()]
        if member_ids:
            query = query.join(CardMember, Card.id == CardMember.card_id).filter(
                CardMember.user_id.in_(member_ids)
            )

    if due == "overdue":
        query = query.filter(Card.due_date < datetime.now(timezone.utc))
    elif due == "upcoming":
        query = query.filter(Card.due_date >= datetime.now(timezone.utc))

    return query.distinct().all()
