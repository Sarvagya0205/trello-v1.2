# 📋 Trello Clone

A full-featured Kanban board application built from scratch — create boards, organize work with lists and cards, assign members, label tasks, track progress with checklists, drag-and-drop everything, and filter/search your way through projects.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## ✨ Features

| Category | What you can do |
|----------|----------------|
| **Boards** | Create, rename (click title), delete (with confirmation), customize background color |
| **Lists** | Add, rename, reorder via drag-and-drop, delete |
| **Cards** | Create, edit title/description, set due dates, cover colors, archive, delete |
| **Members** | Add/edit/delete users from the Members panel, assign to boards and cards |
| **Labels** | Create color-coded labels per board, toggle on/off per card |
| **Checklists** | Add multiple checklists per card, track item completion with progress bars |
| **Drag & Drop** | Reorder lists horizontally, reorder/move cards between lists |
| **Search** | Live search cards by title within a board |
| **Filters** | Filter cards by labels, members, or due date (overdue / upcoming) |
| **Due Dates** | Visual badges — 🔴 overdue, 🟡 due within 7 days, 🔵 upcoming |
| **Auto-seed** | Sample data (users, boards, lists, cards) created automatically on first run |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, React Router v7 | UI & client-side routing |
| **Styling** | TailwindCSS 3 | Utility-first CSS |
| **Drag & Drop** | @hello-pangea/dnd | List & card reordering |
| **HTTP Client** | Axios | API calls |
| **Backend** | FastAPI | REST API framework |
| **ORM** | SQLAlchemy 2.0 | Database models & queries |
| **Validation** | Pydantic v2 | Request/response schemas |
| **Database** | MySQL 8 | Data persistence |
| **Server** | Uvicorn | ASGI server |

---

## 📁 Project Structure

```
project/
├── README.md
├── .gitignore
│
├── backend/
│   ├── .env                        # DB credentials (create from .env.example)
│   ├── .env.example                # Template
│   ├── requirements.txt            # Python dependencies
│   ├── runtime.txt                 # Python version for deployment
│   └── app/
│       ├── __init__.py
│       ├── config.py               # Loads settings from .env
│       ├── database.py             # SQLAlchemy engine, session, Base class
│       ├── main.py                 # FastAPI app entry point
│       ├── seed.py                 # Auto-seeds sample data on first run
│       ├── models/                 # SQLAlchemy ORM models
│       │   ├── user.py             #   User
│       │   ├── board.py            #   Board, BoardMember (join table)
│       │   ├── list.py             #   List
│       │   ├── card.py             #   Card, CardMember (join table)
│       │   ├── label.py            #   Label, CardLabel (join table)
│       │   └── checklist.py        #   Checklist, ChecklistItem
│       ├── schemas/                # Pydantic request/response schemas
│       │   ├── user.py             #   UserCreate, UserUpdate, UserOut
│       │   ├── board.py            #   BoardCreate, BoardOut, BoardMemberOut
│       │   ├── list.py             #   ListCreate, ListOut
│       │   ├── card.py             #   CardCreate, CardOut, CardSummary
│       │   ├── label.py            #   LabelCreate, LabelOut
│       │   └── checklist.py        #   ChecklistItemOut, ChecklistOut
│       └── routers/                # API route handlers
│           ├── boards.py           #   /api/boards + /labels + /members
│           ├── lists.py            #   /api/lists
│           ├── cards.py            #   /api/cards + /members + /labels
│           ├── checklists.py       #   /api/checklists + /checklist-items
│           ├── users.py            #   /api/users (CRUD)
│           └── search.py           #   /api/boards/{id}/search
│
└── frontend/
    ├── package.json
    ├── public/
    └── src/
        ├── index.js                # React entry point
        ├── index.css               # Global styles, design tokens, animations
        ├── App.js                  # Router setup (/ and /board/:id)
        ├── api/
        │   └── index.js            # Axios API client (all endpoint functions)
        ├── context/
        │   └── BoardContext.js      # React context + useReducer state management
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx       # Top navigation bar
        │   │   ├── Avatar.jsx       # User avatar with initials fallback
        │   │   └── MembersPanel.jsx # Members management dropdown
        │   ├── Board/               # (empty — board UI is in BoardPage)
        │   ├── List/
        │   │   └── ListColumn.jsx   # Droppable list column
        │   └── Card/
        │       ├── CardItem.jsx     # Draggable card with badges
        │       └── CardDetailModal.jsx  # Full card edit modal
        └── pages/
            ├── BoardsPage.jsx       # Home page — board grid + create form
            └── BoardPage.jsx        # Board view — lists, cards, filters, DnD
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Check with |
|------------|---------|------------|
| **Node.js** | 16+ | `node --version` |
| **npm** | 8+ | `npm --version` |
| **Python** | 3.9+ | `python3 --version` |
| **MySQL** | 8.0+ | `mysql --version` |

### Step 1 — Set up MySQL

```sql
-- Connect to MySQL
mysql -u root -p

-- Create the database and user
CREATE DATABASE trello_clone;
CREATE USER 'trello'@'localhost' IDENTIFIED BY 'Trello@1234';
GRANT ALL PRIVILEGES ON trello_clone.* TO 'trello'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2 — Backend

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure database connection
cp .env.example .env
# Edit .env with your credentials:
#   DB_HOST=localhost
#   DB_PORT=3306
#   DB_USER=trello
#   DB_PASSWORD=Trello@1234
#   DB_NAME=trello_clone

# Start the backend server
uvicorn app.main:app --reload
# ✅ Running on http://localhost:8000
# ✅ Tables auto-created
# ✅ Sample data auto-seeded
```

> **Note:** On first startup, the backend automatically creates all database tables and seeds sample data (4 users, 1 board with lists/cards/labels/checklists). Subsequent startups skip seeding.

### Step 3 — Frontend

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
# ✅ Running on http://localhost:3000
# ✅ API requests proxy to http://localhost:8000
```

### Step 4 — Open the app

Visit **http://localhost:3000** — you should see the "Your Boards" page with the seeded "Product Roadmap" board.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Full connection URL (overrides individual fields) | – | For cloud deploys |
| `DB_HOST` | MySQL host | `localhost` | For local dev |
| `DB_PORT` | MySQL port | `3306` | For local dev |
| `DB_USER` | MySQL username | `root` | For local dev |
| `DB_PASSWORD` | MySQL password | (empty) | For local dev |
| `DB_NAME` | Database name | `trello_clone` | For local dev |

> **Priority:** If `DATABASE_URL` is set, it takes precedence over individual `DB_*` fields. The app auto-converts `mysql://` → `mysql+pymysql://` and `postgres://` → `postgresql://` for SQLAlchemy compatibility.

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | (empty — uses proxy in dev) |

In development, the `"proxy": "http://localhost:8000"` in `package.json` handles API routing. For production builds, set `REACT_APP_API_URL` before running `npm run build`.

---

## 📡 API Reference

Interactive API documentation is auto-generated at **http://localhost:8000/docs** (Swagger UI).

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards` | List all boards (summary) |
| `POST` | `/api/boards` | Create a board |
| `GET` | `/api/boards/{id}` | Get board with all lists, cards, members, labels |
| `PATCH` | `/api/boards/{id}` | Update board (title, background_color) |
| `DELETE` | `/api/boards/{id}` | Delete board and all its data |

### Board Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/boards/{id}/members/{user_id}` | Add user to board |
| `DELETE` | `/api/boards/{id}/members/{user_id}` | Remove user from board |

### Board Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards/{id}/labels` | List board labels |
| `POST` | `/api/boards/{id}/labels` | Create label |
| `PATCH` | `/api/boards/{id}/labels/{label_id}` | Update label |
| `DELETE` | `/api/boards/{id}/labels/{label_id}` | Delete label |

### Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/lists` | Create a list |
| `PATCH` | `/api/lists/{id}` | Update list (title, position) |
| `DELETE` | `/api/lists/{id}` | Delete list and its cards |

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cards` | Create a card |
| `GET` | `/api/cards/{id}` | Get card with members, labels, checklists |
| `PATCH` | `/api/cards/{id}` | Update card (title, description, position, due_date, cover_color, is_archived, list_id) |
| `DELETE` | `/api/cards/{id}` | Delete card |

### Card Members & Labels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cards/{id}/members/{user_id}` | Assign user to card |
| `DELETE` | `/api/cards/{id}/members/{user_id}` | Remove user from card |
| `POST` | `/api/cards/{id}/labels/{label_id}` | Add label to card |
| `DELETE` | `/api/cards/{id}/labels/{label_id}` | Remove label from card |

### Checklists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cards/{id}/checklists` | Create checklist on card |
| `PATCH` | `/api/checklists/{id}` | Update checklist title |
| `DELETE` | `/api/checklists/{id}` | Delete checklist |
| `POST` | `/api/checklists/{id}/items` | Add item to checklist |
| `PATCH` | `/api/checklist-items/{id}` | Update item (title, is_completed, position) |
| `DELETE` | `/api/checklist-items/{id}` | Delete item |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all users |
| `POST` | `/api/users` | Create user |
| `PATCH` | `/api/users/{id}` | Update user (name, email, avatar_url) |
| `DELETE` | `/api/users/{id}` | Delete user |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards/{id}/search?q=&labels=&members=&due=` | Search/filter cards in a board |

**Search parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search card titles (case-insensitive) |
| `labels` | string | Comma-separated label IDs to filter by |
| `members` | string | Comma-separated user IDs to filter by |
| `due` | string | `"overdue"` (past due) or `"upcoming"` (future due) |

---

## 🗃 Database Schema

```
┌──────────┐     ┌───────────────┐     ┌──────────┐
│  users   │────▶│ board_members │◀────│  boards  │
│          │     │ (join table)  │     │          │
│ id       │     │ board_id (PK) │     │ id       │
│ name     │     │ user_id  (PK) │     │ title    │
│ email    │     │ role          │     │ bg_color │
│ avatar   │     └───────────────┘     │ created  │
│ created  │                           └────┬─────┘
└────┬─────┘                                │
     │         ┌──────────┐            ┌────┴─────┐
     │         │  labels  │◀───────────│  (owns)  │
     │         │ id       │            └──────────┘
     │         │ board_id │
     │         │ name     │       ┌──────────┐
     │         │ color    │       │  lists   │
     │         └────┬─────┘       │ id       │
     │              │             │ board_id │
     │    ┌─────────┴──────┐      │ title    │
     │    │  card_labels   │      │ position │
     │    │  (join table)  │      └────┬─────┘
     │    │  card_id (PK)  │           │
     │    │  label_id (PK) │      ┌────┴─────┐
     │    └─────────┬──────┘      │  cards   │
     │              │             │ id       │
     │              └────────────▶│ list_id  │
     │                            │ title    │
     │    ┌───────────────┐       │ desc     │
     └───▶│ card_members  │◀──────│ position │
          │ (join table)  │       │ due_date │
          │ card_id (PK)  │       │ archived │
          │ user_id (PK)  │       │ cover    │
          └───────────────┘       └────┬─────┘
                                       │
                                  ┌────┴──────────┐
                                  │  checklists   │
                                  │ id            │
                                  │ card_id       │
                                  │ title         │
                                  └────┬──────────┘
                                       │
                                  ┌────┴──────────┐
                                  │checklist_items│
                                  │ id            │
                                  │ checklist_id  │
                                  │ title         │
                                  │ is_completed  │
                                  │ position      │
                                  └───────────────┘
```

**Relationships:**
- A **Board** has many Lists, Labels, and Members (via join table)
- A **List** has many Cards
- A **Card** has many Members (via join table), Labels (via join table), and Checklists
- A **Checklist** has many ChecklistItems
- All relationships use **cascade delete** — deleting a board removes everything under it

---

## 🌐 Deployment

### Option A — Separate Services (Recommended)

Deploy backend and frontend on different platforms.

**Backend** (Railway / Render / any VPS):
```bash
# Set environment variables on your host
DATABASE_URL=mysql://user:pass@host:3306/trello_clone

# Start command
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend** (Vercel / Netlify):
```bash
# Build with API URL pointing to your backend
REACT_APP_API_URL=https://your-backend.railway.app npm run build

# Deploy the build/ folder as a static site
```

### Option B — Single Server

Build the frontend and serve it from the backend:

```bash
# 1. Build frontend
cd frontend
REACT_APP_API_URL="" npm run build
cd ..

# 2. Start backend (serves API + static files)
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Visit `http://your-server:8000`.

---

## 🧪 Development Notes

- **Hot Reload:** Both servers support hot reload — backend `--reload` flag, frontend via react-scripts
- **API Proxy:** In dev, the frontend's `package.json` has `"proxy": "http://localhost:8000"` so API calls are forwarded automatically
- **Swagger Docs:** Visit `http://localhost:8000/docs` for interactive API testing
- **Auto-seed:** The backend seeds sample data on first run (skips if data already exists)
- **CORS:** Backend allows all origins in development (`allow_origins=["*"]`)

---

## 📝 License

This project is for learning/portfolio purposes.
