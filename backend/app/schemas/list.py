from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.card import CardSummary


class ListBase(BaseModel):
    title: str


class ListCreate(ListBase):
    board_id: int
    position: float = 0.0


class ListUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[float] = None


class ListOut(ListBase):
    id: int
    board_id: int
    position: float
    created_at: datetime
    cards: List[CardSummary] = []

    model_config = {"from_attributes": True}
