# VialApp — CONASET Driving Test Simulator

A full-stack web simulator for the Chilean theoretical driving exam (Classes B and C), designed according to official CONASET regulations (35 questions, 45-minute countdown, maximum 2 mistakes to pass).

Developed as an academic project for **IT Innovations in Business — Ural Federal University (UrFU / ИРИТ-РТФ)**.

---

## Key Features

- **Official Exam Simulation:** Standard 35-question tests with a real 45-minute countdown and automatic submission upon expiration.
- **Guided Study Mode:** Instant feedback on each question with legal explanations based on the Chilean Driver Handbook.
- **Smart Mistake Reinforcement:** One-click mode to review and re-test only the questions missed during previous attempts.
- **Bilingual Interface (i18n):** Real-time language switch between Spanish (ES) and English (EN) across all application views.
- **Official Driving Glossary:** Searchable catalog of technical road safety and regulatory concepts categorized by topic.
- **Subscription & Sandbox Checkout:** Simulated payment workflow with instant activation for 1-day, 15-day, and 30-day access plans.
- **Executive Admin Dashboard:** Student management, bulk exam generator with randomized question sampling, and question bank explorer.

---

## Tech Stack

- **Backend:** FastAPI, Python 3.11, SQLAlchemy (Async), SQLite (`aiosqlite`), Pydantic v2, JWT & Passlib (Bcrypt).
- **Frontend:** React 19, Vite, Tailwind CSS.
- **DevOps:** Docker, Docker Compose.

---

## Project Structure

```text
VialApp-urfu/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & route declarations
│   │   ├── models.py        # SQLAlchemy database entities
│   │   ├── schemas.py       # Pydantic validation schemas
│   │   └── database.py      # Async SQLite session setup
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable layout and navigation components
│   │   ├── context/         # AuthContext and LanguageContext (ES/EN)
│   │   └── pages/           # Views (Home, Exams, Admin, Glossary, Checkout)
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## Quick Start (Docker)

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/VialApp-urfu.git](https://github.com/your-username/VialApp-urfu.git)
cd VialApp-urfu
```

### 2. Run the application
```bash
docker compose up --build
```

### 3. Access the services
- **Frontend App:** `http://localhost:5173`
- **Interactive API Documentation:** `http://localhost:8000/docs`

---

## Test Accounts

The database comes pre-seeded with test accounts for evaluation (or use the **Quick Login** shortcuts on the Sign In page):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@vialapp.cl` | `admin123` |
| **Student** | `demo@vialapp.cl` | `student123` |

---

## Author

- **Jorge Manríquez** — Ural Federal University (UrFU), 2026.