from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    background_color = Column(String(20), default="#0052CC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lists = relationship("List", back_populates="board", cascade="all, delete-orphan", order_by="List.position")
    members = relationship("BoardMember", back_populates="board", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="board", cascade="all, delete-orphan")


class BoardMember(Base):
    __tablename__ = "board_members"

    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(Enum("owner", "member"), default="member")

    board = relationship("Board", back_populates="members")
    user = relationship("User", back_populates="board_memberships")
