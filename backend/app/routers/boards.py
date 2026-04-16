from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List
from app.database import get_db
from app.models.board import Board, BoardMember
from app.models.card import Card, CardMember
from app.models.label import Label, CardLabel
from app.models.list import List as ListModel
from app.schemas.board import BoardCreate, BoardUpdate, BoardOut, BoardSummary
from app.schemas.label import LabelCreate, LabelUpdate, LabelOut

router = APIRouter(prefix="/api/boards", tags=["boards"])


@router.get("", response_model=List[BoardSummary])
def get_boards(db: Session = Depends(get_db)):
    return db.query(Board).all()


@router.post("", response_model=BoardOut, status_code=201)
def create_board(payload: BoardCreate, db: Session = Depends(get_db)):
    board = Board(**payload.model_dump())
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


@router.get("/{board_id}", response_model=BoardOut)
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = (
        db.query(Board)
        .options(
            selectinload(Board.members).selectinload(BoardMember.user),
            selectinload(Board.labels),
            selectinload(Board.lists).selectinload(ListModel.cards).selectinload(Card.members).selectinload(CardMember.user),
            selectinload(Board.lists).selectinload(ListModel.cards).selectinload(Card.labels).selectinload(CardLabel.label),
        )
        .filter(Board.id == board_id)
        .first()
    )
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


@router.patch("/{board_id}", response_model=BoardOut)
def update_board(board_id: int, payload: BoardUpdate, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(board, key, value)
    db.commit()
    db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=204)
def delete_board(board_id: int, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db.delete(board)
    db.commit()


@router.get("/{board_id}/labels", response_model=List[LabelOut])
def get_board_labels(board_id: int, db: Session = Depends(get_db)):
    return db.query(Label).filter(Label.board_id == board_id).all()


@router.post("/{board_id}/labels", response_model=LabelOut, status_code=201)
def create_board_label(board_id: int, payload: LabelCreate, db: Session = Depends(get_db)):
    board = db.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    label = Label(board_id=board_id, **payload.model_dump())
    db.add(label)
    db.commit()
    db.refresh(label)
    return label


@router.patch("/{board_id}/labels/{label_id}", response_model=LabelOut)
def update_board_label(board_id: int, label_id: int, payload: LabelUpdate, db: Session = Depends(get_db)):
    label = db.query(Label).filter(Label.id == label_id, Label.board_id == board_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(label, key, value)
    db.commit()
    db.refresh(label)
    return label


@router.delete("/{board_id}/labels/{label_id}", status_code=204)
def delete_board_label(board_id: int, label_id: int, db: Session = Depends(get_db)):
    label = db.query(Label).filter(Label.id == label_id, Label.board_id == board_id).first()
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    db.delete(label)
    db.commit()
