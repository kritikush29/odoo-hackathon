from fastapi import APIRouter, Query

from app.schemas.catalog import PlanCreate, ProductCreate

router = APIRouter()


@router.get("/products")
async def list_products(
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
                "name": "Brightloop Core",
                "product_type": "software",
                "sales_price": 1290,
                "cost_price": 480,
                "notes": "Core billing automation",
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.get("/products/{product_id}/variants")
async def product_variants(product_id: int) -> dict:
    return {"items": [{"id": 1, "product_id": product_id, "brand": "Odoo", "price_delta": 560}], "total": 1}


@router.post("/products")
async def create_product(payload: ProductCreate) -> dict:
    return {"id": 1, "message": "Product created", **payload.model_dump()}


@router.get("/plans")
async def list_plans(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {
        "items": [
            {
                "id": 1,
                "name": "Starter",
                "billing_period": "monthly",
                "price": 1999,
                "minimum_quantity": 1,
                "is_auto_close": True,
                "is_closable": True,
                "is_pausable": True,
                "is_renewable": True,
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.post("/plans")
async def create_plan(payload: PlanCreate) -> dict:
    return {"id": 1, "message": "Plan created", **payload.model_dump()}


@router.get("/quotation-templates")
async def list_quotation_templates(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
) -> dict:
    return {"items": [{"id": 1, "name": "Growth plan", "expires_at": "2026-12-31T00:00:00Z"}], "total": 1, "page": page, "page_size": page_size}
