from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/reports/summary")
async def summary(
    from_date: str | None = Query(default=None, alias="from"),
    to: str | None = None,
) -> dict:
    return {
        "active_subscriptions": 240,
        "revenue": 458000,
        "collected": 390000,
        "outstanding": 68000,
        "overdue_count": 18,
        "revenue_series": [
            {"date": "2026-09-01", "value": 95000},
            {"date": "2026-10-01", "value": 120000},
            {"date": "2026-11-01", "value": 142000},
        ],
    }


@router.get("/reports/overdue")
async def overdue(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [{"id": 10, "customer": "Raghav Mehta", "days_overdue": 14, "amount": 2450}],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }
