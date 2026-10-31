from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/taxes")
async def list_taxes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [
            {"id": 1, "name": "CGST", "rate": 9, "state_code": "KA", "is_active": True},
            {"id": 2, "name": "SGST", "rate": 9, "state_code": "KA", "is_active": True},
        ],
        "total": 2,
        "page": page,
        "page_size": page_size,
    }


@router.post("/taxes")
async def create_tax(payload: dict) -> dict:
    return {"id": 3, "message": "Tax rule created", **payload}


@router.patch("/taxes/{tax_id}")
async def update_tax(tax_id: int, payload: dict) -> dict:
    return {"id": tax_id, "message": "Tax rule updated", **payload}
