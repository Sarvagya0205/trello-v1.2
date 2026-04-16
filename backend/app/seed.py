from app.database import SessionLocal, engine, Base
import app.models  # noqa: F401
from app.models.user import User
from app.models.board import Board, BoardMember
from app.models.list import List
from app.models.card import Card, CardMember
from app.models.label import Label, CardLabel
from app.models.checklist import Checklist, ChecklistItem

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        # Users
        users = [
            User(name="Alice Johnson", email="alice@example.com", avatar_url="https://i.pravatar.cc/150?img=1"),
            User(name="Bob Smith", email="bob@example.com", avatar_url="https://i.pravatar.cc/150?img=2"),
            User(name="Carol White", email="carol@example.com", avatar_url="https://i.pravatar.cc/150?img=3"),
            User(name="David Lee", email="david@example.com", avatar_url="https://i.pravatar.cc/150?img=4"),
        ]
        db.add_all(users)
        db.flush()

        # Board
        board = Board(title="Product Roadmap", background_color="#0052CC")
        db.add(board)
        db.flush()

        # Board members
        db.add(BoardMember(board_id=board.id, user_id=users[0].id, role="owner"))
        db.add(BoardMember(board_id=board.id, user_id=users[1].id, role="member"))
        db.add(BoardMember(board_id=board.id, user_id=users[2].id, role="member"))
        db.add(BoardMember(board_id=board.id, user_id=users[3].id, role="member"))

        # Labels
        labels = [
            Label(board_id=board.id, name="Bug", color="#FF5630"),
            Label(board_id=board.id, name="Feature", color="#36B37E"),
            Label(board_id=board.id, name="Design", color="#6554C0"),
            Label(board_id=board.id, name="Backend", color="#00B8D9"),
            Label(board_id=board.id, name="Frontend", color="#FF8B00"),
        ]
        db.add_all(labels)
        db.flush()

        # Lists
        backlog = List(board_id=board.id, title="Backlog", position=1.0)
        in_progress = List(board_id=board.id, title="In Progress", position=2.0)
        review = List(board_id=board.id, title="In Review", position=3.0)
        done = List(board_id=board.id, title="Done", position=4.0)
        db.add_all([backlog, in_progress, review, done])
        db.flush()

        # Cards — Backlog
        card1 = Card(list_id=backlog.id, title="Setup project repository", description="Initialize Git repo and CI/CD pipeline.", position=1.0)
        card2 = Card(list_id=backlog.id, title="Design database schema", description="Design ERD for all core entities.", position=2.0)
        card3 = Card(list_id=backlog.id, title="Implement authentication", description="JWT-based auth with refresh tokens.", position=3.0)

        # Cards — In Progress
        card4 = Card(list_id=in_progress.id, title="Build board API", description="REST endpoints for board CRUD.", position=1.0)
        card5 = Card(list_id=in_progress.id, title="Implement drag and drop", description="Use @hello-pangea/dnd for cards and lists.", position=2.0)

        # Cards — In Review
        card6 = Card(list_id=review.id, title="Card detail modal", description="Show full card details in a modal.", position=1.0)

        # Cards — Done
        card7 = Card(list_id=done.id, title="Project kickoff meeting", description="Align team on scope and timeline.", position=1.0, is_archived=False)

        db.add_all([card1, card2, card3, card4, card5, card6, card7])
        db.flush()

        # Card labels
        db.add(CardLabel(card_id=card1.id, label_id=labels[1].id))
        db.add(CardLabel(card_id=card2.id, label_id=labels[3].id))
        db.add(CardLabel(card_id=card3.id, label_id=labels[3].id))
        db.add(CardLabel(card_id=card4.id, label_id=labels[3].id))
        db.add(CardLabel(card_id=card5.id, label_id=labels[4].id))
        db.add(CardLabel(card_id=card6.id, label_id=labels[2].id))
        db.add(CardLabel(card_id=card6.id, label_id=labels[4].id))

        # Card members
        db.add(CardMember(card_id=card4.id, user_id=users[0].id))
        db.add(CardMember(card_id=card4.id, user_id=users[1].id))
        db.add(CardMember(card_id=card5.id, user_id=users[2].id))
        db.add(CardMember(card_id=card6.id, user_id=users[3].id))

        # Checklist on card5
        checklist = Checklist(card_id=card5.id, title="DnD Tasks")
        db.add(checklist)
        db.flush()

        db.add_all([
            ChecklistItem(checklist_id=checklist.id, title="Install @hello-pangea/dnd", is_completed=True, position=1.0),
            ChecklistItem(checklist_id=checklist.id, title="Wrap board in DragDropContext", is_completed=True, position=2.0),
            ChecklistItem(checklist_id=checklist.id, title="Make lists draggable", is_completed=False, position=3.0),
            ChecklistItem(checklist_id=checklist.id, title="Make cards draggable between lists", is_completed=False, position=4.0),
        ])

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
