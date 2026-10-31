from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/payments")
async def list_payments(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [
            {
                "id": 1,
                "invoice_id": 101,
                "method": "UPI",
                "amount": 1999,
                "date": "2026-10-31T00:00:00Z",
                "note": "Payment received",
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/payments")
async def create_payment(payload: dict) -> dict:
    return {"id": 2, "message": "Payment recorded", **payload}
