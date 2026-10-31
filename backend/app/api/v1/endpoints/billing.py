from fastapi import APIRouter
from pydantic import BaseModel

from app.schemas.billing import BillingJobStatus, BillingRunRequest

router = APIRouter()


@router.post("/billing/run")
async def run_billing(payload: BillingRunRequest) -> dict:
    return {"job_id": "billing-job-1"}


@router.get("/billing/jobs/{job_id}")
async def get_billing_job(job_id: str) -> BillingJobStatus:
    return BillingJobStatus(
        status="completed",
        created=18,
        skipped=3,
        failed=[],
    )
