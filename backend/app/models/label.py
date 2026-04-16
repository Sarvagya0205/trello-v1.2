from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    color = Column(String(20), nullable=False)

    board = relationship("Board", back_populates="labels")
    card_labels = relationship("CardLabel", back_populates="label", cascade="all, delete-orphan")


class CardLabel(Base):
    __tablename__ = "card_labels"

    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True)
    label_id = Column(Integer, ForeignKey("labels.id", ondelete="CASCADE"), primary_key=True)

    card = relationship("Card", back_populates="labels")
    label = relationship("Label", back_populates="card_labels")
