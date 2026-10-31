from pydantic import BaseModel, Field


class BillingRunRequest(BaseModel):
    dry_run: bool = False


class BillingJobStatus(BaseModel):
    status: str
    created: int = 0
    skipped: int = 0
    failed: list[dict] = Field(default_factory=list)
