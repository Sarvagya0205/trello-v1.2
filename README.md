# Trello Clone

A full-stack Kanban board application — boards, lists, cards, labels, members, checklists, drag-and-drop, and search/filter.

## Tech Stack

| Layer    | Technology                                         |
|----------|----------------------------------------------------|
| Frontend | React 18, TailwindCSS, @hello-pangea/dnd           |
| Backend  | FastAPI, SQLAlchemy 2, Pydantic v2, Alembic        |
| Database | MySQL 8                                            |

---

## Local Development

### Prerequisites
- Node.js 16+, npm
- Python 3.9+
- MySQL 8 running locally

### 1 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Edit .env with your DB credentials
cp .env.example .env            # then fill in DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

uvicorn app.main:app --reload   # starts on http://localhost:8000
```

Tables are auto-created and seeded with sample data on first run.

### 2 — Frontend

```bash
cd frontend
npm install
npm start                       # starts on http://localhost:3000
```

The `.env.development` file already points the frontend at `http://localhost:8000`.

---

## Deployment

### Option A — Separate hosts (recommended)

Deploy the backend and frontend on different services (e.g. backend on Railway/Render, frontend on Vercel/Netlify).

**Backend:**
```bash
# Set environment variables on your host:
DB_HOST=<your-mysql-host>
DB_PORT=3306
DB_USER=<user>
DB_PASSWORD=<password>
DB_NAME=trello_clone

# Start command:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend — set before building:**
```bash
REACT_APP_API_URL=https://your-backend-domain.com npm run build
```
Then deploy the `build/` folder as a static site.

---

### Option B — Single server (backend serves frontend)

Build the frontend first, then start only the backend. The backend automatically detects and serves the `frontend/build/` folder.

```bash
# 1. Build the frontend
cd frontend
REACT_APP_API_URL=""  npm run build   # empty = same-origin
cd ..

# 2. Start backend (serves API + static files)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Visit `http://your-server:8000` — the backend serves both the API and the React app.

---

### Environment Variables

**Backend `.env`:**
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=trello
DB_PASSWORD=secret
DB_NAME=trello_clone
```

**Frontend (set before `npm run build`):**
```
REACT_APP_API_URL=https://api.yourdomain.com
```
Leave empty (`""`) if the frontend is served from the same origin as the backend.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | List boards |
| POST | `/api/boards` | Create board |
| GET | `/api/boards/{id}` | Board + lists + cards |
| PATCH | `/api/boards/{id}` | Update board |
| DELETE | `/api/boards/{id}` | Delete board |
| GET/POST | `/api/boards/{id}/labels` | Board labels |
| PATCH/DELETE | `/api/boards/{id}/labels/{label_id}` | Edit/delete label |
| POST/DELETE | `/api/boards/{id}/members` | Board members |
| POST/PATCH/DELETE | `/api/lists` | Lists CRUD |
| GET/POST/PATCH/DELETE | `/api/cards` | Cards CRUD |
| POST/DELETE | `/api/cards/{id}/labels/{label_id}` | Card labels |
| POST/DELETE | `/api/cards/{id}/members/{user_id}` | Card members |
| POST/PATCH/DELETE | `/api/checklists` | Checklists |
| POST/PATCH/DELETE | `/api/checklist-items` | Checklist items |
| GET | `/api/boards/{id}/search?q=` | Search cards |
| GET | `/api/users` | All users |
| GET | `/api/health` | Health check |

Interactive docs: `http://localhost:8000/docs`
