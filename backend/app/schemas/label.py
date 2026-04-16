from pydantic import BaseModel
from typing import Optional


class LabelBase(BaseModel):
    name: str
    color: str


class LabelCreate(LabelBase):
    pass


class LabelUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class LabelOut(LabelBase):
    id: int
    board_id: int

    model_config = {"from_attributes": True}
