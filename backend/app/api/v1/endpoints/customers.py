from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/customers")
async def list_customers(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    q: str | None = None,
) -> dict:
    return {
        "items": [
            {
                "id": 1,
                "full_name": "Raghav Mehta",
                "email": "raghav@example.com",
                "phone": "+91 98100 00000",
                "company_name": "Northwind Labs",
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/customers")
async def create_customer(payload: dict) -> dict:
    return {"id": 2, "message": "Customer created", **payload}
