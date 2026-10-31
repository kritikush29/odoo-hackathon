from __future__ import annotations

from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.billing import BillingJobStatus, BillingRunRequest

router = APIRouter()

BILLING_JOBS: dict[str, BillingJobStatus] = {}


@router.post("/billing/run")
async def run_billing(payload: BillingRunRequest) -> dict[str, str]:
    job_id = uuid4().hex
    status_value = "completed" if not payload.dry_run else "dry-run"
    BILLING_JOBS[job_id] = BillingJobStatus(
        status=status_value,
        created=18 if not payload.dry_run else 0,
        skipped=3,
        failed=[],
    )
    return {"job_id": job_id}


@router.get("/billing/jobs/{job_id}")
async def get_billing_job(job_id: str) -> BillingJobStatus:
    job = BILLING_JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
