from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/discounts")
async def list_discounts(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [{"id": 1, "name": "Launch discount", "discount_type": "percentage", "value": 10, "usage_limit": 50}],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/discounts")
async def create_discount(payload: dict) -> dict:
    return {"id": 2, "message": "Discount rule created", **payload}


@router.patch("/discounts/{discount_id}")
async def update_discount(discount_id: int, payload: dict) -> dict:
    return {"id": discount_id, "message": "Discount rule updated", **payload}
