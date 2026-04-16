from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Float, nullable=False, default=0.0)
    due_date = Column(DateTime(timezone=True), nullable=True)
    is_archived = Column(Boolean, default=False)
    cover_color = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    list = relationship("List", back_populates="cards")
    members = relationship("CardMember", back_populates="card", cascade="all, delete-orphan")
    labels = relationship("CardLabel", back_populates="card", cascade="all, delete-orphan")
    checklists = relationship("Checklist", back_populates="card", cascade="all, delete-orphan")


class CardMember(Base):
    __tablename__ = "card_members"

    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)

    card = relationship("Card", back_populates="members")
    user = relationship("User", back_populates="card_memberships")
