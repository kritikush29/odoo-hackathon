from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/subscriptions")
async def list_subscriptions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    sort: str | None = None,
    order: str = "desc",
    q: str | None = None,
) -> dict:
    return {
        "items": [
            {
                "id": 1,
                "customer_id": 1,
                "status": "active",
                "plan_name": "Starter",
                "amount": 1999,
                "current_period_start": "2026-10-01T00:00:00Z",
                "current_period_end": "2026-11-01T00:00:00Z",
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/subscriptions")
async def create_subscription(payload: dict) -> dict:
    return {"id": 3, "message": "Subscription created", **payload}


@router.patch("/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: int, payload: dict) -> dict:
    return {"id": subscription_id, "message": "Subscription updated", **payload}


@router.post("/subscriptions/{subscription_id}/transition")
async def transition_subscription(subscription_id: int, payload: dict) -> dict:
    return {"id": subscription_id, "status": payload.get("to", "active"), "message": "Subscription state changed"}


@router.post("/subscriptions/from-template")
async def create_from_template(payload: dict) -> dict:
    return {"id": 9, "message": "Subscription created from template", **payload}
