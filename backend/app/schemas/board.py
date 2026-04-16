from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.list import ListOut
from app.schemas.user import UserOut


class BoardBase(BaseModel):
    title: str
    background_color: Optional[str] = "#0052CC"


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    title: Optional[str] = None
    background_color: Optional[str] = None


class BoardMemberOut(BaseModel):
    user: UserOut
    role: str

    model_config = {"from_attributes": True}


class BoardOut(BoardBase):
    id: int
    created_at: datetime
    lists: List[ListOut] = []
    members: List[BoardMemberOut] = []

    model_config = {"from_attributes": True}


class BoardSummary(BoardBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
