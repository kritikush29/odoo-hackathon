from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.billing import BillingJobStatus, BillingRunRequest
from app.tasks.billing_tasks import generate_billing_day

router = APIRouter()

BILLING_JOBS: dict[str, BillingJobStatus] = {}


@router.post("/billing/run")
async def run_billing(payload: BillingRunRequest) -> dict[str, str]:
    job_id = uuid4().hex
    result = generate_billing_day(payload.dry_run)
    status_value = result["status"]
    BILLING_JOBS[job_id] = BillingJobStatus(
        status=status_value,
        created=result["created"],
        skipped=result["skipped"],
        failed=result["failed"],
    )
    return {"job_id": job_id}


@router.get("/billing/jobs/{job_id}")
async def get_billing_job(job_id: str) -> BillingJobStatus:
    job = BILLING_JOBS.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
