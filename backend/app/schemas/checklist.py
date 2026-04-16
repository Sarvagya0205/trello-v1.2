from pydantic import BaseModel
from typing import Optional, List


class ChecklistItemBase(BaseModel):
    title: str
    is_completed: bool = False
    position: float = 0.0


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    position: Optional[float] = None


class ChecklistItemOut(ChecklistItemBase):
    id: int
    checklist_id: int

    model_config = {"from_attributes": True}


class ChecklistBase(BaseModel):
    title: str


class ChecklistCreate(ChecklistBase):
    pass


class ChecklistUpdate(BaseModel):
    title: Optional[str] = None


class ChecklistOut(ChecklistBase):
    id: int
    card_id: int
    items: List[ChecklistItemOut] = []

    model_config = {"from_attributes": True}
