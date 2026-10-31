from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/staff")
async def list_staff(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [{"id": 1, "full_name": "Aditi Sharma", "email": "aditi@brightloop.dev", "role": "staff"}],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/staff")
async def create_staff(payload: dict) -> dict:
    return {"id": 2, "message": "Staff member created", **payload}


@router.delete("/staff/{staff_id}")
async def delete_staff(staff_id: int) -> dict:
    return {"id": staff_id, "message": "Staff member deleted"}
