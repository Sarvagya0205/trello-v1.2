from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import boards, lists, cards, checklists, search, users

# Import all models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trello Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(boards.router)
app.include_router(lists.router)
app.include_router(cards.router)
app.include_router(checklists.router)
app.include_router(search.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Trello Clone API is running"}
