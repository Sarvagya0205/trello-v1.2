from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime
from typing import Optional, List, Any
from app.schemas.user import UserOut
from app.schemas.label import LabelOut
from app.schemas.checklist import ChecklistOut


class CardMemberOut(BaseModel):
    user: UserOut

    model_config = {"from_attributes": True}


class CardLabelOut(BaseModel):
    label: LabelOut

    model_config = {"from_attributes": True}


class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    cover_color: Optional[str] = None


class CardCreate(CardBase):
    list_id: int
    position: float = 0.0


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    list_id: Optional[int] = None
    position: Optional[float] = None
    due_date: Optional[datetime] = None
    is_archived: Optional[bool] = None
    cover_color: Optional[str] = None


class CardOut(CardBase):
    id: int
    list_id: int
    position: float
    is_archived: bool
    created_at: datetime
    members: List[UserOut] = []
    labels: List[LabelOut] = []
    checklists: List[ChecklistOut] = []

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def flatten_relations(cls, data: Any) -> Any:
        if hasattr(data, "members"):
            data.__dict__["members"] = [m.user for m in data.members if m.user]
        if hasattr(data, "labels"):
            data.__dict__["labels"] = [cl.label for cl in data.labels if cl.label]
        return data


class CardSummary(BaseModel):
    id: int
    list_id: int
    title: str
    position: float
    is_archived: bool
    due_date: Optional[datetime] = None
    cover_color: Optional[str] = None
    members: List[UserOut] = []
    labels: List[LabelOut] = []

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def flatten_relations(cls, data: Any) -> Any:
        if hasattr(data, "members"):
            data.__dict__["members"] = [m.user for m in data.members if m.user]
        if hasattr(data, "labels"):
            data.__dict__["labels"] = [cl.label for cl in data.labels if cl.label]
        return data
