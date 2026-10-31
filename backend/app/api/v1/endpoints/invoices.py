from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/invoices")
async def list_invoices(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    status: str | None = None,
) -> dict:
    return {
        "items": [
            {
                "id": 101,
                "invoice_number": "INV-1001",
                "status": "confirmed",
                "total_amount": 2999,
                "outstanding_amount": 1999,
                "due_date": "2026-11-12T00:00:00Z",
                "customer_id": 1,
            }
        ],
        "total": 1,
        "page": page,
        "page_size": page_size,
    }


@router.get("/invoices/{invoice_id}")
async def get_invoice(invoice_id: int) -> dict:
    return {
        "id": invoice_id,
        "invoice_number": "INV-1001",
        "status": "confirmed",
        "total_amount": 2999,
        "outstanding_amount": 1999,
        "due_date": "2026-11-12T00:00:00Z",
        "customer_id": 1,
        "lines": [{"product": "Brightloop Core", "quantity": 1, "unit_price": 2999, "tax": 270, "amount": 3269}],
    }


@router.post("/invoices/{invoice_id}/transition")
async def transition_invoice(invoice_id: int, payload: dict) -> dict:
    return {"id": invoice_id, "status": payload.get("to", "draft"), "message": "Invoice status updated"}


@router.post("/invoices/{invoice_id}/send")
async def send_invoice(invoice_id: int) -> dict:
    return {"id": invoice_id, "message": "Invoice sent"}
