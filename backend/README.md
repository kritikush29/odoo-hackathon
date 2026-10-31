# Brightloop backend

This backend provides the Python/FastAPI API, PostgreSQL persistence, and Celery task orchestration for the Brightloop subscription platform.

## Quick start

1. Create a Python virtual environment.
2. Copy the environment file:
   - `cp .env.example .env`
3. Start PostgreSQL and Redis:
   - `docker compose up -d postgres redis`
4. Install dependencies:
   - `pip install -r requirements.txt`
5. Run the app from the backend directory with the package path set:
   - `PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - On Windows PowerShell: `Set-Location .; $env:PYTHONPATH = (Get-Location).Path; uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

## Main modules

- `app.main`: FastAPI application entry point
- `app.core.config`: environment settings
- `app.core.database`: SQLAlchemy engine and session factory
- `app.models`: ORM models for business domains
- `app.api.v1`: endpoints matching the frontend contract
- `app.tasks`: Celery jobs for billing automation

## Environment variables

Values are read from `.env` and default to local Docker credentials for development.

## Git workflow

Create feature branches before changes, for example:

- `git checkout -b feat/backend-foundation`
- `git checkout -b feat/billing-jobs`

Keep each commit focused and use conventional commit prefixes such as `feat:`, `fix:`, `docs:`.
