# RecipeGen

Full-stack AI recipe app with bilingual UX (English/Spanish), image-based dish analysis, and ingredient-based recipe generation.

## Features

- AI dish identification from uploaded image
- AI recipe generation from ingredient list
- Bilingual content flow (`en` / `es`) with user language preference
- Supabase auth, favorites, and recipe history
- Guest mode and authenticated mode

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- Axios
- i18next / react-i18next
- Supabase JS client

### Backend
- FastAPI (Python)
- Google Gemini (`gemini-2.5-flash`)
- Supabase (PostgreSQL + Auth)
- Pillow (image validation/parsing)

## Prerequisites

- Node.js 18+
- npm 9+
- Python 3.11+
- Gemini API key
- Supabase project (URL + anon key + service role key)

## Environment Variables

Copy `.env.example` to `.env` in project root and set values.

### Frontend (`VITE_*`)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase public anon key
- `VITE_API_URL`: Backend base URL (default local: `http://localhost:8000`)

### Backend
- `GEMINI_API_KEY`: Gemini API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)
- `ALLOWED_ORIGINS`: Comma-separated CORS origins

## Run Locally

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Install backend dependencies

```bash
cd backend
python -m venv venv
# Windows PowerShell
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3) Start backend (FastAPI)

```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4) Start frontend (Vite)

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

## Project Structure

```
.
├─ backend/
│  ├─ main.py
│  ├─ routers/
│  │  ├─ recipes.py
│  │  ├─ images.py
│  │  ├─ auth.py
│  │  ├─ favorites.py
│  │  └─ history.py
│  └─ requirements.txt
├─ src/
│  ├─ api/
│  ├─ components/
│  ├─ pages/
│  ├─ i18n.ts
│  └─ types.ts
└─ README.md
```