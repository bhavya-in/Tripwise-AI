# TripWise AI

A full-stack travel itinerary planner portfolio project built with React, TypeScript, FastAPI, and Python.

## Current status

The starter version includes a responsive React trip-planning interface, a FastAPI backend, input validation, a demo itinerary generator, and initial API tests. Attraction suggestions are templates, not live verified travel data yet.

## Requirements

- Node.js 20.19+ (or a compatible newer supported version)
- Python 3.10+
- VS Code (recommended)

## Run locally on Windows PowerShell

### 1. Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

Open http://127.0.0.1:8000/docs to explore the API.

### 2. Frontend (open a second PowerShell terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

### 3. Run backend tests

From the `backend` folder with the virtual environment activated:

```powershell
pytest -q
```

### 4. Build frontend for production

From the `frontend` folder:

```powershell
npm run build
```

## Next milestones

1. Add proper trip and activity domain models.
2. Replace demo templates with real places from a selected provider.
3. Add route and travel-time calculations.
4. Add budget-aware scheduling tests.
5. Persist saved trips in PostgreSQL.
6. Add optional AI recommendations with schema validation.
7. Deploy frontend and backend and document setup and limitations.

## Important note

The displayed activity costs are prototype estimates. They are not live prices, and the current version does not include transport or accommodation costs. Verify opening hours, fees, and safety information with official providers before using a generated plan for real travel.
